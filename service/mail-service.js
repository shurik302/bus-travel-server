const nodeMailer = require("nodemailer");
require('dotenv').config();

class MailService {
  constructor() {
    this.transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  async sendActivationMail(to, activationLink) {
    if (!to) {
      console.error("Адреса електронної пошти отримувача не вказана");
      throw new Error('Адреса електронної пошти отримувача не вказана');
    }

    if (!this.validateEmail(to)) {
      console.error(`Некоректний формат адреси електронної пошти отримувача: ${to}`);
      throw new Error('Некоректний формат адреси електронної пошти отримувача');
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: `Активація акаунту на сайті ${process.env.API_URL}`,
        text: "",
        html: `<div style="font-family: 'Open Sans', sans-serif;">
          <div style="text-align: center; padding: 20px; background-color: #1e92ff;">
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley">
              <img src="./logo_big.png" style="height: 80px;" />
            </a>
          </div>
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="font-size: 32px; color: black; font-weight: 400;">Для активації акаунту, натисніть на посилання нижче</h1>
            <a href="${activationLink}" style="font-size: 20px; text-decoration: none; color: white; background-color: #1e92ff; border-radius: 8px; padding: 10px 25px; display: inline-block; margin-top: 30px; transition: background-color 0.5s;">активувати акаунт</a>
          </div>
        </div>`
      });

      console.log(`Лист з активацією відправлено на ${to}`);
    } catch (error) {
      console.error(`Помилка при відправленні листа активації: ${error.message}`);
      throw new Error('Помилка при відправленні листа активації');
    }
  }
}

module.exports = new MailService();
