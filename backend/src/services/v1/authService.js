const userModel = require("../../models/v1/userModel");
const { hashPassword, comparePassword } = require("../../utils/crypto");
const { generateToken } = require("../../utils/jwt");
const { sendOtpEmail } = require("./emailService");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function register(data) {
  if (!data.firstName || !data.lastName || !data.email || !data.password) {
    throw new Error("Tous les champs obligatoires doivent être remplis");
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

  const user = await userModel.findById(userId);
  const token = generateToken(user);

  return {
    token,
    user,
  };
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email et mot de passe obligatoires");
  }

  const user = await userModel.findByEmail(email);

  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Email ou mot de passe incorrect");
  }

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
    };
  }

  const token = generateToken(user);

  delete user.password;
  delete user.otpCode;
  delete user.otpExpiresAt;

  return {
    token,
    user,
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

  const cleanUser = await userModel.findById(user.id);
  const token = generateToken(cleanUser);

  return {
    token,
    user: cleanUser,
  };
}

async function getProfile(userId) {
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  return user;
}

module.exports = {
  register,
  login,
  verifyOtp,
  getProfile,
};