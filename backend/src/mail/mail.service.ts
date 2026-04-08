import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendBirthdayMail(email: string, name: string) {
  await this.mailerService.sendMail({
    to: email,
    subject: '🎉 Happy Birthday!',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Happy Birthday</title>
    </head>

    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
        <tr>
          <td align="center">
            
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
              
              <tr>
                <td align="center" style="background:#4A90E2; color:#ffffff; padding:20px;">
                  <h1 style="margin:0;">🎉 Happy Birthday!</h1>
                </td>
              </tr>

              <tr>
                <td style="padding:30px; text-align:center; color:#333;">
                  <h2 style="margin-top:0;">Dear ${name}, 🎂</h2>
                  
                  <p style="font-size:16px; line-height:1.6;">
                    Wishing you a day filled with happiness and a year filled with joy.
                    May all your dreams come true! 🎈
                  </p>

                  <p style="font-size:16px;">
                    Enjoy your special day! 🥳
                  </p>

                  
                  <a href="#" 
                     style="display:inline-block; margin-top:20px; padding:12px 20px; 
                            background:#4A90E2; color:#ffffff; text-decoration:none; 
                            border-radius:5px; font-size:16px;">
                    Celebrate Now 🎁
                  </a>
                </td>
              </tr>

              
              <tr>
                <td style="background:#f4f4f4; text-align:center; padding:15px; font-size:12px; color:#777;">
                  © ${new Date().getFullYear()} Your Company. All rights reserved.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
    `,
  });
}
}