import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { successResponse } from '../common/response.helper';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a budget for a category' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 409, description: 'Budget already exists for this category and month' })
  async create(@Req() req: any, @Body() dto: CreateBudgetDto) {
    const data = await this.budgetsService.create(req.user.id, dto);
    return successResponse(data, 'Budget created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  async findAll(@Req() req: any) {
    const data = await this.budgetsService.findAll(req.user.id);
    return successResponse(data, 'Budgets fetched successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single budget by ID' })
  async findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.budgetsService.findOne(req.user.id, id);
    return successResponse(data, 'Budget fetched successfully');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  async update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    const data = await this.budgetsService.update(req.user.id, id, dto);
    return successResponse(data, 'Budget updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.budgetsService.remove(req.user.id, id);
    return successResponse(data, 'Budget deleted successfully');
  }
}