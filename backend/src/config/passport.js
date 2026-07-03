const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const userModel = require("../models/v1/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName || "Utilisateur";
        const lastName = profile.name?.familyName || "Google";
        const avatar = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Aucun email Google trouvé"), null);
        }

        let user = await userModel.findByGoogleId(googleId);

        if (user) {
          return done(null, user);
        }

        user = await userModel.findByEmail(email);

        if (user) {
          await userModel.attachGoogleAccount(user.id, googleId, avatar);
          const updatedUser = await userModel.findById(user.id);
          return done(null, updatedUser);
        }

        const userId = await userModel.createGoogleUser({
          googleId,
          firstName,
          lastName,
          email,
          avatar,
          role: "client",
        });

        const newUser = await userModel.findById(userId);

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;