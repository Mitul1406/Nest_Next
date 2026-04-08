import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(query: any): PaginationOptions {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const skip = (page - 1) * limit;

    return { ...query, page, limit, skip };
  }
}