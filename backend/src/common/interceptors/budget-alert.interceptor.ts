import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BudgetsService } from '../../budgets/budgets.service';

@Injectable()
export class BudgetAlertInterceptor implements NestInterceptor {
  constructor(private readonly budgetsService: BudgetsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;

    if (method !== 'POST' || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      map(async (response) => {
        try {
          const body = request.body;

          if (!body?.category || !body?.date) return response;

          const date = new Date(body.date);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          const status = await this.budgetsService.checkBudgetStatus(
            user.id,
            body.category,
            month,
            year,
          );

          if (!status) return response;

          let budgetAlert: { type: string; message: string; remaining: number } | null = null;

          if (status.isExceeded) {
            budgetAlert = {
              type: 'exceeded',
              message: `Budget exceeded for "${body.category}"! You have spent ${status.totalSpent} of ${status.budgetAmount} (${status.percentage}%)`,
              remaining: status.remaining,
            };
          } else if (status.isNearLimit) {
            budgetAlert = {
              type: 'warning',
              message: `You have used ${status.percentage}% of your "${body.category}" budget. Only ${status.remaining} remaining.`,
              remaining: status.remaining,
            };
          }

          if (budgetAlert) {
            return {
              ...response,
              budgetAlert,
            };
          }

          return response;
        } catch (err) {
          return response;
        }
      }),
    );
  }
}