const authService = require("../../services/v1/authService");

async function register(req, res) {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "Compte créé avec succès",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: result.requiresOtp
        ? "Code OTP envoyé par email"
        : "Connexion réussie",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const result = await authService.verifyOtp(email, otp);

    return res.status(200).json({
      success: true,
      message: "Vérification OTP réussie",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function profile(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    const result = await authService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  register,
  login,
  verifyOtp,
  profile,
  updateProfile,
  forgotPassword,
  resetPassword,
};