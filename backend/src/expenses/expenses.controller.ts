import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import { BudgetAlertInterceptor } from '../common/interceptors/budget-alert.interceptor';
import { successResponse } from '../common/response.helper';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseInterceptors(BudgetAlertInterceptor)
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async create(@Req() req: any, @Body() dto: CreateExpenseDto) {
    const data = await this.expensesService.create(req.user.id, dto);
    return successResponse(data, 'Expense created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with filters and pagination' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-01-31' })
  @ApiQuery({ name: 'minAmount', required: false, example: 100 })
  @ApiQuery({ name: 'maxAmount', required: false, example: 500 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async findAll(
    @Req() req: any,
    @Query(PaginationPipe) filters: FilterExpenseDto,
  ) {
    const result = await this.expensesService.findAll(req.user.id, filters);
    return successResponse(result.data, 'Expenses fetched successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single expense by ID' })
  async findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.expensesService.findOne(req.user.id, id);
    return successResponse(data, 'Expense fetched successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  async update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    const data = await this.expensesService.update(req.user.id, id, dto);
    return successResponse(data, 'Expense updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.expensesService.remove(req.user.id, id);
    return successResponse(data, 'Expense deleted successfully');
  }
}