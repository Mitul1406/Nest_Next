import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { successResponse } from '../common/response.helper';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary for current month & year' })
  @ApiResponse({ status: 200, description: 'Dashboard data fetched' })
  async getDashboard(@Req() req: any) {
    const data = await this.reportsService.getDashboard(req.user.id);
    return successResponse(data, 'Dashboard fetched successfully');
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly spending summary by category' })
  @ApiQuery({ name: 'month', type: Number, example: 1 })
  @ApiQuery({ name: 'year', type: Number, example: 2024 })
  async getMonthlySummary(
    @Req() req: any,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }
    const data = await this.reportsService.getMonthlySummary(
      req.user.id,
      month,
      year,
    );
    return successResponse(data, 'Monthly summary fetched successfully');
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly spending summary by month' })
  @ApiQuery({ name: 'year', type: Number, example: 2024 })
  async getYearlySummary(
    @Req() req: any,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const data = await this.reportsService.getYearlySummary(req.user.id, year);
    return successResponse(data, 'Yearly summary fetched successfully');
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Get spending breakdown by category for date range' })
  @ApiQuery({ name: 'startDate', type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', type: String, example: '2024-01-31' })
  async getCategoryBreakdown(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new BadRequestException('Dates must be in YYYY-MM-DD format');
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    const data = await this.reportsService.getCategoryBreakdown(
      req.user.id,
      startDate,
      endDate,
    );
    return successResponse(data, 'Category breakdown fetched successfully');
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent expenses' })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 5 })
  async getRecentExpenses(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : 5;
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      throw new BadRequestException('Limit must be between 1 and 50');
    }
    const data = await this.reportsService.getRecentExpenses(
      req.user.id,
      parsedLimit,
    );
    return successResponse(data, 'Recent expenses fetched successfully');
  }
}