import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(userId: string, dto: CreateExpenseDto) {
    
    const expense = this.expenseRepository.create({
      ...dto,
      userId,
    });

    return await this.expenseRepository.save(expense);
  }

  async findAll(userId: number, filters: FilterExpenseDto) {
    const {
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      limit = 10,
      skip = 0,
    } = filters;

    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .orderBy('expense.date', 'DESC');

    if (category) {
      query.andWhere('expense.category = :category', { category });
    }

    if (startDate) {
      query.andWhere('expense.date >= :startDate', { startDate });
      console.log("----->",query);
      
    }

    if (endDate) {
      query.andWhere('expense.date <= :endDate', { endDate });
    }

    if (minAmount) {
      query.andWhere('expense.amount >= :minAmount', {
        minAmount: +minAmount,
      });
    }

    if (maxAmount) {
      query.andWhere('expense.amount <= :maxAmount', {
        maxAmount: +maxAmount,
      });
    }

    const [data, total] = await query
    .skip(skip)
    .take(+limit)
    .getManyAndCount();

  return {
    data,
    pagination: {
      total,
      page: filters.page,
      limit,
      totalPages: Math.ceil(total / +limit),
    },
  };
  }

  async findOne(userId: string, id: string) {
    const expense = await this.expenseRepository.findOne({ where: { id } });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.userId !== userId) {
      throw new ForbiddenException('You cannot access this expense');
    }

    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOne(userId, id);
    Object.assign(expense, dto);
    return await this.expenseRepository.save(expense);
  }

  async remove(userId: string, id: string) {
    const expense = await this.findOne(userId, id);
    await this.expenseRepository.remove(expense);
    return { deleted: true };
  }
}