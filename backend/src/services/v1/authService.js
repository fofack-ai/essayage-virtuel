const passport = require("passport");
const userModel = require("../../models/v1/userModel");
const { hashPassword, comparePassword } = require("../../utils/crypto");
const { generateToken } = require("../../utils/jwt");
const { isValidCameroonPhone, isValidAllowedEmail } = require("../../utils/validators");
const { sendOtpEmail, sendResetPasswordEmail } = require("./emailService");
const crypto = require("crypto");
const notificationService = require("./notificationService");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanUser(user) {
  if (!user) return null;
  const copy = { ...user };
  delete copy.password;
  delete copy.otpCode;
  delete copy.otpExpiresAt;
  delete copy.resetToken;
  delete copy.resetTokenExpiresAt;
  return copy;
}

async function register(data) {
  if (!data.firstName || !data.lastName || !data.email || !data.password) {
    throw new Error("Tous les champs obligatoires doivent être remplis");
  }

  if (!isValidAllowedEmail(data.email)) {
    throw new Error("Seules les adresses Gmail ou Yahoo (yahoo.com / yahoo.fr) sont acceptées.");
  }

  if (!data.phone || !isValidCameroonPhone(data.phone)) {
    throw new Error("Le numéro de téléphone doit être à 9 chiffres (ex : 671207375).");
  }

  const existingUser = await userModel.findByEmail(data.email);

  if (existingUser) {
    throw new Error("Cet email est déjà utilisé");
  }

  const hashedPassword = await hashPassword(data.password);

  const userId = await userModel.createUser({
    ...data,
    password: hashedPassword,
    role: "client",
  });

  // Notification de bienvenue
  try {
    await notificationService.createUserNotification({
      userId: userId,
      type: "info",
      title: "Bienvenue sur TryOn !",
      message: "Votre compte a été créé avec succès.",
      isRead: false,
    });
    console.log("✅ Notification de bienvenue créée pour l'utilisateur:", userId);
  } catch (err) {
    console.error("❌ Erreur création notification bienvenue:", err.message);
  }

  const user = cleanUser(await userModel.findById(userId));
  const token = generateToken(user);

  return { token, user };
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email et mot de passe obligatoires");
  }

  const user = await userModel.findByEmail(email);
  console.log('🔍 Utilisateur trouvé:', user ? user.id : 'Non trouvé');

  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  if (user.status !== "active") {
    throw new Error("Votre compte est désactivé ou suspendu.");
  }

  if (!user.password) {
    throw new Error("Ce compte utilise Google. Connectez-vous avec Google.");
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Email ou mot de passe incorrect");
  }

  // 👇 CRÉER L'OBJET UTILISATEUR NETTOYÉ UNE FOIS
  const cleanUserData = cleanUser(user);
  console.log('👤 cleanUserData:', cleanUserData);

  // 👇 SI C'EST UN ADMIN → OTP
  if (user.role === "admin") {
    const otp = generateOtp();
    const hashedOtp = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.saveOtp(user.id, hashedOtp, expiresAt);
    await sendOtpEmail(user.email, otp);

    return {
      requiresOtp: true,
      message: "Code OTP envoyé par email",
      userId: user.id,
      user: cleanUserData, // 👈 AJOUTER user DANS LE RETOUR
    };
  }

  // 👇 POUR LE CLIENT → TOKEN DIRECT
  const token = generateToken(cleanUserData);

  return {
    token,
    user: cleanUserData, // 👈 RETOURNER user
    requiresOtp: false,
  };
}

async function verifyOtp(email, otp) {
  if (!email || !otp) {
    throw new Error("Email et code OTP obligatoires");
  }

  const user = await userModel.findByEmail(email);

  if (!user || user.role !== "admin") {
    throw new Error("Utilisateur admin introuvable");
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    throw new Error("Aucun code OTP actif");
  }

  if (new Date(user.otpExpiresAt) < new Date()) {
    await userModel.clearOtp(user.id);
    throw new Error("Code OTP expiré");
  }

  const validOtp = await comparePassword(otp, user.otpCode);

  if (!validOtp) {
    throw new Error("Code OTP incorrect");
  }

  await userModel.clearOtp(user.id);

  // ─── ✅ Notification de connexion admin APRÈS l'OTP ───
  try {
    console.log("🔔 Création notification admin pour userId:", user.id);
    
    await notificationService.createAdminNotification({
      adminId: user.id,
      type: "info",
      title: "Connexion admin",
      message: `Vous vous êtes connecté en tant qu'administrateur le ${new Date().toLocaleString('fr-FR')}.`,
      isRead: false,
    });
    
    console.log("✅ Notification admin créée avec succès");
  } catch (err) {
    console.error("❌ Erreur création notification admin:", err.message);
  }

  const clean = cleanUser(await userModel.findById(user.id));
  const token = generateToken(clean);

  return { token, user: clean };
}

async function googleLogin(user) {
  const clean = cleanUser(user);
  const token = generateToken(clean);
  return { token, user: clean };
}

async function getProfile(userId) {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  return cleanUser(user);
}

async function forgotPassword(email) {
  if (!email) {
    throw new Error("Email obligatoire");
  }

  const user = await userModel.findByEmail(email);

  if (!user) {
    return {
      message: "Si cet email existe, un lien de réinitialisation a été envoyé",
    };
  }

  if (!user.password) {
    return {
      message: "Ce compte utilise Google. Connectez-vous avec Google.",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await userModel.saveResetToken(user.id, resetToken, expiresAt);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendResetPasswordEmail(user.email, resetLink);

  return {
    message: "Si cet email existe, un lien de réinitialisation a été envoyé",
  };
}

async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw new Error("Token et nouveau mot de passe obligatoires");
  }

  const user = await userModel.findByResetToken(token);

  if (!user) {
    throw new Error("Lien de réinitialisation invalide");
  }

  if (new Date(user.resetTokenExpiresAt) < new Date()) {
    await userModel.clearResetToken(user.id);
    throw new Error("Lien de réinitialisation expiré");
  }

  const hashedPassword = await hashPassword(newPassword);

  await userModel.updatePassword(user.id, hashedPassword);
  await userModel.clearResetToken(user.id);

  return {
    message: "Mot de passe réinitialisé avec succès",
  };
}

async function updateProfile(userId, data) {
  if (!data.firstName || !data.lastName) {
    throw new Error("Le prénom et le nom sont obligatoires");
  }

  if (data.email) {
    const existing = await userModel.findByEmail(data.email);
    if (existing && existing.id !== userId) {
      throw new Error("Cet email est déjà utilisé par un autre compte");
    }
  }

  await userModel.updateProfile(userId, data);
  return cleanUser(await userModel.findById(userId));
}

async function handleGoogleUser(user) {
  if (!user) {
    throw new Error("Utilisateur Google introuvable");
  }

  if (user.status !== "active") {
    throw new Error("Votre compte est désactivé ou suspendu.");
  }

  if (user.role === "admin") {
    const otp = generateOtp();
    const hashedOtp = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await userModel.saveOtp(user.id, hashedOtp, expiresAt);
    await sendOtpEmail(user.email, otp);

    return {
      requiresOtp: true,
      email: user.email,
      userId: user.id,
    };
  }

  const token = generateToken(user);

  return {
    token,
    user,
  };
}

module.exports = {
  register,
  login,
  verifyOtp,
  googleLogin,
  getProfile,
  forgotPassword,
  resetPassword,
  updateProfile,
  handleGoogleUser,
};