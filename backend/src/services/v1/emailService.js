const nodemailer = require("nodemailer");

async function sendOtpEmail(to, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Code OTP admin :", otp);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Code de vérification TryOn",
    html: `
      <h2>Connexion administrateur TryOn</h2>
      <p>Votre code de vérification est :</p>
      <h1>${otp}</h1>
      <p>Ce code expire dans 10 minutes.</p>
    `,
  });
}

module.exports = {
  sendOtpEmail,
};