import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const DATA = {
  login: {
    image: "/auth-login.jpg",
    title: "Connectez-vous à votre",
    red: "style",
    end: "et essayez avant d’acheter.",
    tags: ["Compte client", "Commandes", "Essayages virtuels", "Favoris"],
  },
  register: {
    image: "/auth-register.jpg",
    title: "Créez votre espace",
    red: "TryOn",
    end: "et construisez votre dressing.",
    tags: ["Profil morphologie", "Tailles sauvegardées", "Offres privées", "Suivi commandes"],
  },
  forgot: {
    image: "/auth-forgot.jpg",
    title: "Retrouvez l’accès à votre",
    red: "compte",
    end: "en toute sécurité.",
    tags: ["Email sécurisé", "Nouveau mot de passe", "Retour rapide", "Compte protégé"],
  },
  reset: {
  image: "/auth-reset.jpg",
  title: "Choisissez un nouveau",
  red: "mot de passe",
  end: "pour sécuriser votre compte.",
  tags: [
    "Lien sécurisé",
    "Nouveau mot de passe",
    "Protection renforcée",
    "Accès restauré"
  ],
},
};

export default function Auth() {
  const { token } = useParams();
  const { login, register, verifyOtp, pendingOtp, loginWithGoogle, completeGoogleLogin } = useAuth();

  const [screen, setScreen] = useState("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Gestion des effets secondaires pour le token de réinitialisation et la connexion Google
  useEffect(() => {
    if (token) {
      setResetToken(token);
      setScreen("reset");
    }
  }, [token]);

  // Gestion de la connexion Google après le redirection en passant par le formulaire d'OTP si nécessaire
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    const redirect = params.get("redirect") || "/";

    if (window.location.pathname === "/auth/google/success" && data) {
      const payload = JSON.parse(decodeURIComponent(data));
      const result = completeGoogleLogin(payload);

      if (result?.requiresOtp) {
        setScreen("login");
        setMessage("Un code OTP a été envoyé à votre email administrateur.");
        window.history.replaceState({}, "", "/auth");
        return;
      }

      window.location.href = redirect;
    }
  }, [completeGoogleLogin]);

  const active = DATA[screen];

  const changeScreen = (value) => {
    setScreen(value);
    setError("");
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const result = await login(
        loginForm.email,
        loginForm.password
      );

      if (result?.requiresOtp) {
        setMessage(
          "Un code OTP a été envoyé. Vérifiez votre email ou le terminal backend."
        );
        return;
      }

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await verifyOtp(
        pendingOtp.email,
        otp
      );

      window.location.href = "/admin";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (registerForm.password !== registerForm.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      await register(registerForm);

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await api.post("/auth/forgot-password", {
        email: forgotEmail,
      });

      setMessage(
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      if (newPassword !== confirmNewPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword,
      });

      setMessage(
        "Mot de passe réinitialisé avec succès."
      );

      setTimeout(() => {
        changeScreen("login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={pageStyle}>
      <section
        style={{
          ...leftStyle,
          backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.50)), url(${active.image})`,
        }}
      >
        <div style={leftContentStyle}>
          <h1 style={leftTitleStyle}>
            {pendingOtp && screen === "login" ? (
              <>
                Vérifiez votre
                <br />
                <span style={redWordStyle}>identité</span>
                <br />
                administrateur.
              </>
            ) : (
              <>
                {active.title}
                <br />
                <span style={redWordStyle}>{active.red}</span>
                <br />
                {active.end}
              </>
            )}
          </h1>

          <div style={tagsBoxStyle}>
            {(pendingOtp && screen === "login"
              ? ["Sécurité renforcée", "Code OTP", "Accès administrateur", "Compte protégé"]
              : active.tags
            ).map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={rightStyle}>
        <div style={cardStyle}>
          <div style={tabsStyle}>
            <button
              type="button"
              onClick={() => changeScreen("login")}
              style={tabStyle(screen === "login")}
              onMouseEnter={hoverTabEnter}
              onMouseLeave={(e) => hoverTabLeave(e, screen === "login")}
            >
              Connexion
            </button>

            <button
              type="button"
              onClick={() => changeScreen("register")}
              style={tabStyle(screen === "register")}
              onMouseEnter={hoverTabEnter}
              onMouseLeave={(e) => hoverTabLeave(e, screen === "register")}
            >
              Créer un compte
            </button>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={successStyle}>{message}</div>}

          {screen === "login" && (
            <>
              <h2 style={titleStyle}>
                {pendingOtp ? "Vérification OTP" : "Bon retour"}
              </h2>

              <p style={descStyle}>
                {pendingOtp
                  ? "Entrez le code de vérification reçu pour accéder à votre espace administrateur."
                  : "Accédez à votre espace personnel et retrouvez vos essayages."}
              </p>

              {pendingOtp ? (
                <form onSubmit={handleVerifyOtp}>
                  <Input
                    icon="🔢"
                    label="Code OTP"
                    placeholder="Ex : 123456"
                    value={otp}
                    onChange={setOtp}
                  />

                  <HoverButton type="submit">
                    Vérifier le code
                  </HoverButton>

                  <p style={{ textAlign: "center", marginTop: 18 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp("");
                        setMessage("");
                        setError("");
                      }}
                      style={inlineButtonStyle}
                    >
                      Je vais vérifier le terminal backend
                    </button>
                  </p>
                </form>
              ) : (
                <>
                  <form onSubmit={handleLogin}>
                    <Input
                      icon="✉️"
                      label="Email"
                      type="email"
                      placeholder="vous@exemple.cm"
                      value={loginForm.email}
                      onChange={(v) =>
                        setLoginForm({
                          ...loginForm,
                          email: v,
                        })
                      }
                    />

                    <Input
                      icon="🔐"
                      label="Mot de passe"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(v) =>
                        setLoginForm({
                          ...loginForm,
                          password: v,
                        })
                      }
                    />

                    <div style={{ textAlign: "right", marginBottom: 20 }}>
                      <button
                        type="button"
                        onClick={() => changeScreen("forgot")}
                        style={linkButtonStyle}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>

                    <HoverButton type="submit">
                      Se connecter
                    </HoverButton>
                  </form>

                  <div style={separatorStyle}>ou continuer avec</div>

                  <SocialButton onClick={loginWithGoogle}>
                    🌐 Continuer avec Google
                  </SocialButton>
                </>
              )}
            </>
          )}

          {screen === "register" && (
            <>
              <h2 style={titleStyle}>Créer un compte</h2>
              <p style={descStyle}>
                Créez votre profil pour sauvegarder vos tailles, favoris et commandes.
              </p>

              <form onSubmit={handleRegister}>
                <div style={registerNameGridStyle}>
                  <Input
                    icon="👤"
                    label="Prénom"
                    placeholder="Miranda"
                    value={registerForm.firstName}
                    onChange={(v) =>
                      setRegisterForm({
                        ...registerForm,
                        firstName: v,
                      })
                    }
                  />

                  <Input
                    icon="👤"
                    label="Nom"
                    placeholder="Eko"
                    value={registerForm.lastName}
                    onChange={(v) =>
                      setRegisterForm({
                        ...registerForm,
                        lastName: v,
                      })
                    }
                  />
                </div>

                <Input
                  icon="✉️"
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.cm"
                  value={registerForm.email}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      email: v,
                    })
                  }
                />

                <Input
                  icon="📱"
                  label="Téléphone"
                  placeholder="+237 6XX XXX XXX"
                  value={registerForm.phone}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      phone: v,
                    })
                  }
                />

                <Input
                  icon="🔒"
                  label="Mot de passe"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={registerForm.password}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      password: v,
                    })
                  }
                />

                <Input
                  icon="🔐"
                  label="Confirmer"
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={registerForm.confirmPassword}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: v,
                    })
                  }
                />

                <HoverButton type="submit">
                  Créer mon compte
                </HoverButton>
              </form>
            </>
          )}

          {screen === "forgot" && (
            <>
              <h2 style={titleStyle}>Réinitialisation</h2>
              <p style={descStyle}>
                Entrez votre email pour recevoir les instructions et obtenir un
                nouveau mot de passe sécurisé.
              </p>

              <form onSubmit={handleForgot}>
                <Input
                  icon="✉️"
                  label="Email"
                  type="email"
                  placeholder="vous@exemple.cm"
                  value={forgotEmail}
                  onChange={setForgotEmail}
                />

                <HoverButton type="submit">
                  Demander un nouveau mot de passe
                </HoverButton>
              </form>

              <p style={{ textAlign: "center", marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => changeScreen("login")}
                  style={inlineButtonStyle}
                >
                  ← Retour à la connexion
                </button>
              </p>
            </>
          )}

          {screen === "reset" && (
            <>
              <h2 style={titleStyle}>
                Nouveau mot de passe
              </h2>

              <p style={descStyle}>
                Entrez le token reçu par email puis choisissez
                votre nouveau mot de passe.
              </p>

              <form onSubmit={handleResetPassword}>
                <Input
                  icon="🔒"
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={setNewPassword}
                />

                <Input
                  icon="🔐"
                  label="Confirmer"
                  type="password"
                  placeholder="********"
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                />

                <HoverButton type="submit">
                  Réinitialiser
                </HoverButton>
              </form>

              <p style={{ textAlign: "center", marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => changeScreen("login")}
                  style={inlineButtonStyle}
                >
                  ← Retour à la connexion
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>

      <div
        style={{
          ...inputWrapperStyle,
          borderColor: focused ? "#E30613" : "#dfe5ec",
          boxShadow: focused ? "0 0 0 4px rgba(227,6,19,.12)" : "none",
        }}
      >
        <span style={inputIconStyle}>{icon}</span>

        <input
          required
          type={inputType}
          placeholder={placeholder}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={eyeButtonStyle}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}
      </div>
    </div>
  );
}

function HoverButton({ children, type = "button" }) {
  return (
    <button
      type={type}
      style={mainButtonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg,#E30613,#B8000A)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 18px 42px rgba(227,6,19,.28)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(135deg,#080808,#222)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 14px 34px rgba(227,6,19,.14)";
      }}
    >
      {children}
    </button>
  );
}

function SocialButton({ children, onClick }) {
  return (
    <button
      type="button"
      style={socialButtonStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#E30613";
        e.currentTarget.style.color = "#E30613";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 12px 28px rgba(227,6,19,.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#ddd";
        e.currentTarget.style.color = "#1A1A1A";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

const hoverTabEnter = (e) => {
  e.currentTarget.style.color = "#E30613";
  e.currentTarget.style.transform = "translateY(-1px)";
};

const hoverTabLeave = (e, active) => {
  e.currentTarget.style.color = active ? "#E30613" : "#1A1A1A";
  e.currentTarget.style.transform = "translateY(0)";
};

const pageStyle = {
  minHeight: "calc(100vh - 72px)",
  paddingTop: 72,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  background: "#f7f7f7",
};

const leftStyle = {
  minHeight: "calc(100vh - 72px)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 42,
  transition: "all .45s ease",
};

const leftContentStyle = {
  width: "100%",
  maxWidth: 560,
  textAlign: "center",
  color: "#fff",
};

const leftTitleStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: "clamp(34px, 3.8vw, 50px)",
  fontWeight: 300,
  lineHeight: 1.25,
  textShadow: "0 8px 28px rgba(0,0,0,.75)",
};

const redWordStyle = {
  color: "#E30613",
  fontStyle: "italic",
};

const tagsBoxStyle = {
  marginTop: 34,
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 10,
};

const tagStyle = {
  padding: "9px 16px",
  borderRadius: 999,
  background: "rgba(255,255,255,.18)",
  border: "1px solid rgba(255,255,255,.35)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  backdropFilter: "blur(8px)",
};

const rightStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px 44px",
};

const cardStyle = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: 26,
  padding: 34,
  boxShadow: "0 24px 70px rgba(0,0,0,.10)",
};

const tabsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  background: "#f2f2f2",
  padding: 7,
  borderRadius: 22,
  marginBottom: 30,
};

const registerNameGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 16,
  alignItems: "start",
  width: "100%",
};

const tabStyle = (active) => ({
  border: 0,
  borderRadius: 17,
  padding: "15px 10px",
  cursor: "pointer",
  background: active ? "#fff" : "transparent",
  color: active ? "#E30613" : "#1A1A1A",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 1.4,
  transition: "all .25s ease",
  boxShadow: active ? "0 12px 26px rgba(0,0,0,.08)" : "none",
});

const titleStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 42,
  fontWeight: 300,
  marginBottom: 10,
};

const descStyle = {
  color: "#666",
  fontSize: 15,
  lineHeight: 1.6,
  marginBottom: 24,
};

const labelStyle = {
  display: "block",
  marginBottom: 7,
  color: "#666",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 1.6,
  textTransform: "uppercase",
};

const inputWrapperStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "0 16px",
  borderRadius: 15,
  border: "1.5px solid #dfe5ec",
  background: "#fff",
  transition: "all .25s ease",
};

const inputIconStyle = {
  fontSize: 20,
  opacity: 0.65,
};

const inputStyle = {
  flex: 1,
  padding: "14px 0",
  border: "none",
  fontSize: 15,
  outline: "none",
  background: "transparent",
};

const eyeButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const mainButtonStyle = {
  width: "100%",
  border: 0,
  borderRadius: 15,
  background: "linear-gradient(135deg,#080808,#222)",
  color: "#fff",
  padding: "16px",
  cursor: "pointer",
  fontWeight: 900,
  letterSpacing: 2.3,
  textTransform: "uppercase",
  transition: "all .25s ease",
  boxShadow: "0 14px 34px rgba(227,6,19,.14)",
};

const linkButtonStyle = {
  border: 0,
  background: "transparent",
  color: "#C0392B",
  fontWeight: 800,
  cursor: "pointer",
  transition: "all .25s ease",
};

const inlineButtonStyle = {
  border: 0,
  background: "transparent",
  cursor: "pointer",
  fontWeight: 800,
  transition: "all .25s ease",
};

const separatorStyle = {
  textAlign: "center",
  margin: "22px 0 14px",
  color: "#777",
  fontSize: 14,
};

const socialButtonStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 13,
  border: "1.5px solid #ddd",
  background: "#fff",
  color: "#1A1A1A",
  cursor: "pointer",
  marginBottom: 10,
  transition: "all .25s ease",
};

const errorStyle = {
  background: "#FDECEC",
  color: "#C0392B",
  padding: 12,
  borderRadius: 12,
  marginBottom: 16,
};

const successStyle = {
  background: "#EAF8F0",
  color: "#137A45",
  padding: 12,
  borderRadius: 12,
  marginBottom: 16,
};