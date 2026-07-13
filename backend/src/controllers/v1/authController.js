const authService = require("../../services/v1/authService");
const settingsService = require("../../services/v1/settingsService");

// ── Redirection Google ──
function sendAuthRedirect(res, result) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Admin avec OTP requis
  if (result.requiresOtp) {
    const payload = encodeURIComponent(JSON.stringify({
      requiresOtp: true,
      email: result.email,
      userId: result.userId,
    }));
    return res.redirect(`${frontendUrl}/auth/google/success?data=${payload}&redirect=/auth`);
  }

  // Connexion normale
  const payload = encodeURIComponent(JSON.stringify({
    token: result.token,
    user: result.user,
  }));
  const target = result.user?.role === "admin" ? "/admin" : "/";
  return res.redirect(`${frontendUrl}/auth/google/success?data=${payload}&redirect=${target}`);
}

// ── Register ──
async function register(req, res) {
  try {
    const registrationEnabled = await settingsService.getSetting('registrationEnabled', true);
    if (!registrationEnabled) {
      return res.status(403).json({
        success: false,
        message: "Les inscriptions sont temporairement fermées.",
      });
    }
    const result = await authService.register(req.body);
    return res.status(201).json({ success: true, message: "Compte créé avec succès", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Login ──
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const maintenanceMode = await settingsService.getSetting('maintenanceMode', false);
    const result = await authService.login(email, password);

    if (!result.user) {
      return res.status(400).json({ success: false, message: "Erreur de connexion" });
    }

    // Mode maintenance : bloquer les clients
    if (maintenanceMode && result.user.role !== 'admin') {
      return res.status(503).json({
        success: false,
        redirect: "/maintenance",
        message: "Le site est en maintenance. Seuls les administrateurs peuvent se connecter.",
      });
    }

    return res.status(200).json({
      success: true,
      message: result.requiresOtp ? "Code OTP envoyé par email" : "Connexion réussie",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Verify OTP ──
async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);
    return res.status(200).json({ success: true, message: "Vérification OTP réussie", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Google Callback ──
async function googleCallback(req, res) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  try {
    const result = await authService.handleGoogleUser(req.user);

    // Si l'utilisateur est admin et a besoin d'OTP
    if (result.requiresOtp) {
      const payload = encodeURIComponent(JSON.stringify({
        requiresOtp: true,
        email: result.email,
        userId: result.userId,
      }));
      return res.redirect(`${frontendUrl}/auth/google/success?data=${payload}&redirect=/auth`);
    }

    const redirect = result.user?.role === "admin" ? "/admin" : "/";
    const data = encodeURIComponent(JSON.stringify(result));

    return res.redirect(
      `${frontendUrl}/auth/google/success?data=${data}&redirect=${redirect}`
    );
  } catch (error) {
    return res.redirect(
      `${frontendUrl}/auth?error=${encodeURIComponent(error.message)}`
    );
  }
}

// ── Profile ──
async function profile(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Update Profile ──
async function updateProfile(req, res) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Profil mis à jour", data: user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Forgot Password ──
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

// ── Reset Password ──
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  verifyOtp,
  googleCallback,
  profile,
  updateProfile,
  forgotPassword,
  resetPassword,
};