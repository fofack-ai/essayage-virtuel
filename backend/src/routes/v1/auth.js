const express = require("express");
const passport = require("../../config/passport");

const router = express.Router();

const authController = require("../../controllers/v1/authController");
const auth = require("../../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth`,
  }),
  authController.googleCallback
);

router.get("/profile", auth, authController.profile);
router.put("/profile", auth, authController.updateProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
