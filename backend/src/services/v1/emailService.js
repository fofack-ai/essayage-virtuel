const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM || "TryOn <onboarding@resend.dev>";

async function sendViaResend({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Échec de l'envoi d'email (Resend) : ${errorBody}`);
  }

  return response.json();
}

async function sendOtpEmail(to, otp) {
  if (!RESEND_API_KEY) {
    console.log("Code OTP admin :", otp);
    return;
  }

  await sendViaResend({
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
  if (!RESEND_API_KEY) {
    console.log("Lien de réinitialisation :", resetLink);
    return;
  }

  await sendViaResend({
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