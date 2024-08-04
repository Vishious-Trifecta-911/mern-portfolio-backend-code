import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_HOST_MAIL,
      pass: process.env.SMTP_HOST_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_HOST_MAIL,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
