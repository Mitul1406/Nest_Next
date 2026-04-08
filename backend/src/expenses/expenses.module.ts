import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';
import { BudgetsService } from 'src/budgets/budgets.service';
import { BudgetsModule } from 'src/budgets/budgets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Expense]),BudgetsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}