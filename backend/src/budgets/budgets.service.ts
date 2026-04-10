import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,

    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const existing = await this.budgetRepository.findOne({
      where: {
        userId,
        category: dto.category,
        month: dto.month,
        year: dto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Budget for this category and month already exists',
      );
    }

    const budget = this.budgetRepository.create({ ...dto, userId });
    return await this.budgetRepository.save(budget);
  }

async findAll(userId: string, filters: any) {
  const { limit, skip, page, month, year } = filters;

  const now = new Date();
  const currentMonth = month || now.getMonth() + 1;
  const currentYear = year || now.getFullYear();

  const [budgets, total] = await this.budgetRepository.findAndCount({
    where: {
      userId,
      month: currentMonth,
      year: currentYear,
    },
    order: { category: 'ASC' },
    take: limit,
    skip,
  });

  const budgetStats = await Promise.all(
    budgets.map(async (b) => {
      const spentResult = await this.expenseRepository
        .createQueryBuilder('expense')
        .select('COALESCE(SUM(expense.amount), 0)', 'total')
        .where('expense.userId = :userId', { userId })
        .andWhere('expense.category = :category', { category: b.category })
        .andWhere('MONTH(expense.date) = :month', { month: currentMonth })
        .andWhere('YEAR(expense.date) = :year', { year: currentYear })
        .getRawOne();

      const spent = Number(spentResult.total) || 0;
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

      let status = 'ok';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 80) status = 'near_limit';

      return {
        ...b,
        spent,
        percentage: Math.min(percentage, 100),
        status,
      };
    }),
  );

  return {
    data: budgetStats,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    meta: {
      month: currentMonth,
      year: currentYear,
    },
  };
}

  async findOne(userId: string, id: string) {
    const budget = await this.budgetRepository.findOne({ where: { id } });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    if (budget.userId !== userId) {
      throw new ForbiddenException('You cannot access this budget');
    }

    return budget;
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.findOne(userId, id);
    Object.assign(budget, dto);
    return await this.budgetRepository.save(budget);
  }

  async remove(userId: string, id: string) {
    const budget = await this.findOne(userId, id);
    await this.budgetRepository.remove(budget);
    return { deleted: true };
  }

  async checkBudgetStatus(
    userId: string,
    category: string,
    month: number,
    year: number,
  ) {
    const budget = await this.budgetRepository.findOne({
      where: { userId, category, month, year },
    });

    if (!budget) return null;

    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.category = :category', { category })
      .andWhere('MONTH(expense.date) = :month', { month })
      .andWhere('YEAR(expense.date) = :year', { year })
      .getRawOne();

    const totalSpent = parseFloat(result?.total || '0');
    const budgetAmount = parseFloat(budget.amount.toString());
    const remaining = budgetAmount - totalSpent;
    const percentage = (totalSpent / budgetAmount) * 100;

    return {
      category,
      budgetAmount,
      totalSpent,
      remaining,
      percentage: +percentage.toFixed(2),
      isExceeded: totalSpent > budgetAmount,
      isNearLimit: percentage >= 80 && totalSpent <= budgetAmount,
    };
  }
}