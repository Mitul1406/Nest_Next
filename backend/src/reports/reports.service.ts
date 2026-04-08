import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Budget } from '../budgets/entities/budget.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,

    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async getMonthlySummary(userId: string, month: number, year: number) {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'totalSpent')
      .addSelect('COUNT(expense.id)', 'totalTransactions')
      .where('expense.userId = :userId', { userId })
      .andWhere('MONTH(expense.date) = :month', { month })
      .andWhere('YEAR(expense.date) = :year', { year })
      .groupBy('expense.category')
      .getRawMany();

    const budgets = await this.budgetRepository.find({
      where: { userId, month, year },
    });

    const budgetMap: Record<string, number> = {};
    budgets.forEach((b) => {
      budgetMap[b.category] = parseFloat(b.amount.toString());
    });

    const summary = expenses.map((e) => {
      const totalSpent = parseFloat(e.totalSpent);
      const budgetAmount = budgetMap[e.category] || null;
      const remaining =
        budgetAmount !== null ? budgetAmount - totalSpent : null;
      const percentage =
        budgetAmount !== null
          ? +((totalSpent / budgetAmount) * 100).toFixed(2)
          : null;

      return {
        category: e.category,
        totalSpent,
        totalTransactions: +e.totalTransactions,
        budgetAmount,
        remaining,
        usedPercentage: percentage,
        status:
          budgetAmount === null
            ? 'no_budget'
            : totalSpent > budgetAmount
              ? 'exceeded'
              : percentage! >= 80
                ? 'near_limit'
                : 'on_track',
      };
    });

    const grandTotal = summary.reduce((sum, s) => sum + s.totalSpent, 0);

    return {
      month,
      year,
      grandTotal: +grandTotal.toFixed(2),
      categories: summary,
    };
  }

  async getYearlySummary(userId: string, year: number) {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('MONTH(expense.date)', 'month')
      .addSelect('SUM(expense.amount)', 'totalSpent')
      .addSelect('COUNT(expense.id)', 'totalTransactions')
      .where('expense.userId = :userId', { userId })
      .andWhere('YEAR(expense.date) = :year', { year })
      .groupBy('MONTH(expense.date)')
      .orderBy('MONTH(expense.date)', 'ASC')
      .getRawMany();

    const monthNames = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December',
    ];

    const monthly = expenses.map((e) => ({
      month: +e.month,
      monthName: monthNames[+e.month - 1],
      totalSpent: parseFloat(e.totalSpent),
      totalTransactions: +e.totalTransactions,
    }));

    const grandTotal = monthly.reduce((sum, m) => sum + m.totalSpent, 0);
    const highestMonth = monthly.reduce(
      (max, m) => (m.totalSpent > max.totalSpent ? m : max),
      monthly[0] || { totalSpent: 0 },
    );

    return {
      year,
      grandTotal: +grandTotal.toFixed(2),
      highestSpendingMonth: highestMonth,
      monthly,
    };
  }

  async getCategoryBreakdown(
    userId: number,
    startDate: string,
    endDate: string,
  ) {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'totalSpent')
      .addSelect('COUNT(expense.id)', 'totalTransactions')
      .addSelect('MIN(expense.amount)', 'minAmount')
      .addSelect('MAX(expense.amount)', 'maxAmount')
      .addSelect('AVG(expense.amount)', 'avgAmount')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.date >= :startDate', { startDate })
      .andWhere('expense.date <= :endDate', { endDate })
      .groupBy('expense.category')
      .orderBy('totalSpent', 'DESC')
      .getRawMany();

    const grandTotal = expenses.reduce(
      (sum, e) => sum + parseFloat(e.totalSpent),
      0,
    );

    const categories = expenses.map((e) => {
      const totalSpent = parseFloat(e.totalSpent);
      return {
        category: e.category,
        totalSpent,
        totalTransactions: +e.totalTransactions,
        minAmount: parseFloat(e.minAmount),
        maxAmount: parseFloat(e.maxAmount),
        avgAmount: +parseFloat(e.avgAmount).toFixed(2),
        sharePercentage:
          grandTotal > 0
            ? +((totalSpent / grandTotal) * 100).toFixed(2)
            : 0,
      };
    });

    return {
      startDate,
      endDate,
      grandTotal: +grandTotal.toFixed(2),
      categories,
    };
  }

  async getRecentExpenses(userId: string, limit: number = 5) {
    const expenses = await this.expenseRepository.find({
      where: { userId },
      order: { date: 'DESC', createdAt: 'DESC' },
      take: limit,
    });

    return expenses;
  }

  async getDashboard(userId: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [monthly, yearly, recent] = await Promise.all([
      this.getMonthlySummary(userId, month, year),
      this.getYearlySummary(userId, year),
      this.getRecentExpenses(userId, 5),
    ]);

    const exceededBudgets = monthly.categories.filter(
      (c) => c.status === 'exceeded',
    );
    const nearLimitBudgets = monthly.categories.filter(
      (c) => c.status === 'near_limit',
    );

    return {
      currentMonth: {
        month,
        year,
        totalSpent: monthly.grandTotal,
        categoryCount: monthly.categories.length,
      },
      currentYear: {
        year,
        totalSpent: yearly.grandTotal,
      },
      alerts: {
        exceeded: exceededBudgets,
        nearLimit: nearLimitBudgets,
      },
      recentExpenses: recent,
    };
  }
}