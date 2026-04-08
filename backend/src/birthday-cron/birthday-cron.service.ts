import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Injectable()
export class BirthdayCronService {
  constructor(
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Kolkata' })
  async sendBirthdayWishes() {
    console.log('🎂 Checking birthdays...');

    const users = await this.dataSource.query(`
      SELECT name, email FROM users
      WHERE MONTH(dateOfBirth) = MONTH(CURDATE())
      AND DAY(dateOfBirth) = DAY(CURDATE())
    `);

    for (const user of users) {
      await this.mailService.sendBirthdayMail(user.email, user.name);
      console.log(`Birthday mail sent to ${user.email}`);
    }
  }
}