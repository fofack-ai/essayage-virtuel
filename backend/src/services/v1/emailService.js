const nodemailer = require("nodemailer");

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    // Force IPv4 : Render ne route pas correctement les connexions
    // sortantes en IPv6, ce qui fait planter la connexion vers
    // smtp.gmail.com avec une erreur "connect ENETUNREACH 2607:f8b0:...".
    // smtp.gmail.com répond aussi en IPv4, donc ce forçage règle le
    // problème sans rien changer côté Gmail.
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOtpEmail(to, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Code OTP admin :", otp);
    return;
  }

  const transporter = createTransporter();

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

async function sendResetPasswordEmail(to, resetLink) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Lien de réinitialisation :", resetLink);
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Réinitialisation de votre mot de passe TryOn",
    html: `
      <h2>Réinitialisation du mot de passe</h2>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Ce lien expire dans 15 minutes.</p>
      <p>Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.</p>
    `,
  });
}

module.exports = {
  sendOtpEmail,
  sendResetPasswordEmail,
};