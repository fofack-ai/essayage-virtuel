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

    const result = await authService.login(
      email,
      password
    );

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
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
    const user = await authService.getProfile(
      req.user.id
    );

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

module.exports = {
  register,
  login,
  profile,
};