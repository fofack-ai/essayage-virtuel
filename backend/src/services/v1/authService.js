const userModel = require("../../models/v1/userModel");
const { hashPassword, comparePassword } = require("../../utils/crypto");
const { generateToken } = require("../../utils/jwt");

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

  const token = generateToken(user);

  delete user.password;

  return {
    token,
    user,
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
  getProfile,
};