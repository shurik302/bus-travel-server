const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
require('dotenv').config();

class TicketService {
    constructor() {
        this.transporter = nodemailer.createTransport({
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

    generateQRCodeToken(ticketId, userId) {
        const payload = { ticketId, userId };
        const options = { expiresIn: '30d' }; // Token valid for 30 days
        return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
    }

    async sendTicketMail(to, ticketData) {
        if (!to) {
            console.error("Recipient email address is not specified");
            throw new Error('Recipient email address is not specified');
        }

        if (!this.validateEmail(to)) {
            console.error(`Invalid recipient email address format: ${to}`);
            throw new Error('Invalid recipient email address format');
        }

        const formatDate = (date, time) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone: 'Europe/Kiev' };
            const formattedDate = new Date(date).toLocaleDateString(ticketData.language === 'ua' ? 'uk-UA' : 'en-US', options);
            return `${formattedDate} о ${time}`;
        };

        // Select price based on user's language
        const price = ticketData.language === 'ua' ? ticketData.priceUA : ticketData.priceEN;
        const currency = ticketData.language === 'ua' ? 'грн' : '$';

        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: to,
                subject: 'Ваш квиток',
                text: `Доброго дня, ${ticketData.firstName} ${ticketData.lastName}, Вас вітає наш сайт. Ми раді повідомити, що Ваш квиток було придбано успішно!`,
                html: `
          <div style="font-family: 'Open Sans', sans-serif; padding: 20px; width: calc(90% - 40px); margin: 20px 5%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <h1 style="font-size: 30px; font-weight: 500;">Доброго дня, ${ticketData.firstName} ${ticketData.lastName}, Вас вітає Bustravel!</h1>
              <span style="font-size: 20px; font-weight: 400;">Ми раді повідомити, що Ваш квиток було придбано успішно!</span>
              <span style="font-size: 20px; font-weight: 400;">Деталі поїздки:</span>
            </div>

            <div style="display: flex; flex-direction: row; width: 100%; margin-top: 20px;">
              <div style="border: 1px solid black; display: flex; flex-direction: column; gap: 20px; width: 50%; padding: 10px;">
                <div style="border-bottom: 1px solid black; padding-bottom: 10px;">
                  <span style="font-size: 30px; font-weight: 600;">Маршрут</span>
                </div>
                <div style="padding-top: 10px;">
                  <span style="font-size: 20px; font-weight: 400;">Звідки: ${ticketData.from}</span><br/>
                  <span style="font-size: 20px; font-weight: 400;">Куди: ${ticketData.to}</span>
                </div>
              </div>
              <div style="border: 1px solid black; display: flex; flex-direction: column; gap: 20px; width: 50%; padding: 10px;">
                <div style="border-bottom: 1px solid black; padding-bottom: 10px;">
                  <span style="font-size: 30px; font-weight: 600;">Додаткова інформація</span>
                </div>
                <div style="padding-top: 10px;">
                  <span style="font-size: 20px; font-weight: 400;">Дата та час відправлення: ${formatDate(ticketData.date_departure, ticketData.departure)}</span><br/>
                  <span style="font-size: 20px; font-weight: 400;">Дата та час прибуття: ${formatDate(ticketData.date_arrival, ticketData.arrival)}</span><br/>
                  <span style="font-size: 20px; font-weight: 400;">Ціна квитка: ${price} ${currency}</span><br/>
                  <span style="font-size: 20px; font-weight: 400;">Кількість пасажирів: ${ticketData.passengers}</span>
                </div>
              </div>
            </div>
          </div>`
            });

            console.log(`Email with ticket sent to ${to}`);
        } catch (error) {
            console.error(`Error sending ticket email: ${error.message}`);
            throw new Error('Error sending ticket email');
        }
    }
}

module.exports = new TicketService();
