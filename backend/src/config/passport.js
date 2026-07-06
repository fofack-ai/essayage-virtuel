const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const userModel = require("../models/v1/userModel");

// Le login Google n'est activé que si les clés sont présentes dans le .env.
// Sans elles, on saute cette configuration au lieu de faire planter le serveur.
// (Utile en dev / soutenance : la connexion email + mot de passe reste dispo.)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
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

  console.log("Login Google activé");
} else {
  console.log("Login Google désactivé (clés GOOGLE_CLIENT_ID / SECRET absentes du .env)");
}

module.exports = passport;