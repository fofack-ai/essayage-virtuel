import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { useSettings } from '../../context/SettingsContext';
import BottomNav from '../../components/layout/BottomNav';
import MobileHeader from '../../components/layout/MobileHeader';
import { User, Mail, Phone, Lock, KeyRound, Hash, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const IMAGES = {
  login: "/auth-login.jpg",
  register: "/auth-register.jpg",
  forgot: "/auth-forgot.jpg",
  reset: "/auth-reset.jpg",
};

export default function Auth() {
  const { t } = useTranslation();
  const { token } = useParams();
  const { login, register, verifyOtp, pendingOtp, loginWithGoogle, completeGoogleLogin } = useAuth();
  const { getSetting, loading: settingsLoading } = useSettings();

  const [screen, setScreen] = useState(() => {
    // Vérifier si le mode "register" est demandé dans l'URL
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'register' ? 'register' : 'login';
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

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

  // Effet pour le token de réinitialisation
  useEffect(() => {
    if (token) {
      setResetToken(token);
      setScreen("reset");
    }
  }, [token]);

  // Effet pour Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    const redirect = params.get("redirect") || "/";

    if (window.location.pathname === "/auth/google/success" && data) {
      const payload = JSON.parse(decodeURIComponent(data));
      const result = completeGoogleLogin(payload);

      if (result?.requiresOtp) {
        setScreen("login");
        setMessage(t('auth.messages.otpSentAdmin'));
        window.history.replaceState({}, "", "/auth");
        return;
      }

      window.location.href = redirect;
    }
  }, [completeGoogleLogin]);

  // 👇 EFFET POUR VÉRIFIER SI L'INSCRIPTION EST OUVERTE
  useEffect(() => {
    const checkRegistration = async () => {
      const enabled = getSetting('registrationEnabled', true);
      console.log('📝 Inscription ouverte:', enabled);
      setRegistrationEnabled(enabled);
      
      // Si l'inscription est fermée et qu'on est sur l'écran register, basculer vers login
      if (!enabled && screen === 'register') {
        setScreen('login');
      }
    };
    checkRegistration();
  }, [getSetting, screen]);

  const active = {
    image: IMAGES[screen],
    title: t(`auth.hero.${screen}.title`),
    red: t(`auth.hero.${screen}.highlight`),
    end: t(`auth.hero.${screen}.end`),
    tags: t(`auth.hero.${screen}.tags`, { returnObjects: true }),
  };

  const changeScreen = (value) => {
    // 👇 EMPÊCHER LE PASSAGE VERS REGISTER SI L'INSCRIPTION EST FERMÉE
    if (value === "register" && !registrationEnabled) {
      setError(t('auth.errors.registrationClosed'));
      return;
    }
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
        setMessage(t('auth.messages.otpSent'));
        return;
      }

      window.location.href = "/";
    } catch (err) {
      if (err.redirect === "/maintenance") {
        window.location.href = "/maintenance";
        return;
      }
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

      // 👇 VÉRIFICATION SUPPLÉMENTAIRE AVANT L'INSCRIPTION
      if (!registrationEnabled) {
        setError(t('auth.errors.registrationClosed'));
        return;
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        setError(t('auth.errors.passwordMismatch'));
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

      setMessage(t('auth.messages.resetLinkSent'));
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
        setError(t('auth.errors.passwordMismatch'));
        return;
      }

      await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword,
      });

      setMessage(t('auth.messages.passwordResetSuccess'));

      setTimeout(() => {
        changeScreen("login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ PENDANT LE CHARGEMENT
  if (settingsLoading) {
    return <div className="auth-loading">{t('auth.loading')}</div>;
  }

  // ✅ SI L'INSCRIPTION EST FERMÉE ET QU'ON ESSAIE D'Y ACCÉDER
  if (screen === "register" && !registrationEnabled) {
    return (
      <div style={pageStyle} className="auth-page">
        <MobileHeader />
        <section
          style={{
            ...leftStyle,
            backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.50)), url(${IMAGES.register})`,
          }}
          className="auth-left"
        >
          <div style={leftContentStyle}>
            <h1 style={leftTitleStyle}>
              {t('auth.registrationClosed.heroTitle')}<br />
              <span style={redWordStyle}>{t('auth.registrationClosed.heroHighlight')}</span>
            </h1>
            <div style={tagsBoxStyle} className="auth-tags">
              <span style={tagStyle}>{t('auth.registrationClosed.tag1')}</span>
              <span style={tagStyle}>{t('auth.registrationClosed.tag2')}</span>
              <span style={tagStyle}>{t('auth.registrationClosed.tag3')}</span>
            </div>
          </div>
        </section>

        <section style={rightStyle} className="auth-right">
          <div style={cardStyle} className="auth-card">
            <div className="auth-header" style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={titleStyle}>{t('auth.registrationClosed.title')}</h2>
              <p style={descStyle}>
                {t('auth.registrationClosed.desc1')}
              </p>
              <p style={{ ...descStyle, color: '#888', fontSize: 14 }}>
                {t('auth.registrationClosed.desc2')}
              </p>
              <div style={{ marginTop: 24 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => changeScreen("login")}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {t('auth.registrationClosed.loginButton')}
                </button>
              </div>
            </div>
          </div>
        </section>
        <BottomNav />
      </div>
    );
  }

  // ... LE RESTE DU RENDU (inchangé)
  return (
    <div style={pageStyle} className="auth-page">
      <MobileHeader />
      <style>{`
        /* ═══════════════════════════════════════
          RESPONSIVE — AUTH
        ═══════════════════════════════════════ */

        /* ─── TABLETTE ─── */
        @media (max-width: 900px) {
          .auth-page {
            grid-template-columns: 1fr !important;
            padding-top: 0 !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
          }

          .auth-left {
            min-height: 300px !important;
            height: auto !important;
            padding: 32px 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-size: cover !important;
            background-position: center !important;
            flex-shrink: 0 !important;
          }

          .auth-left h1 {
            font-size: 32px !important;
          }

          .auth-left .auth-tags {
            display: flex !important;
            gap: 8px !important;
            margin-top: 16px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }

          .auth-left .auth-tags span {
            padding: 6px 12px !important;
            font-size: 11px !important;
          }

          .auth-right {
            padding: 24px 20px !important;
            min-height: auto !important;
            flex: 1 !important;
          }

          .auth-card {
            padding: 24px 20px !important;
            max-width: 100% !important;
            border-radius: 16px !important;
            box-shadow: none !important;
          }
        }

        /* ─── MOBILE ─── */
        @media (max-width: 640px) {
          .auth-left {
            min-height: 240px !important;
            padding: 24px 16px !important;
          }

          .auth-left h1 {
            font-size: 24px !important;
          }

          .auth-left .auth-tags {
            gap: 6px !important;
            margin-top: 12px !important;
          }

          .auth-left .auth-tags span {
            padding: 4px 10px !important;
            font-size: 10px !important;
          }

          .auth-right {
            padding: 16px 14px !important;
          }

          .auth-card {
            padding: 20px 14px !important;
          }

          .auth-card h2 {
            font-size: 28px !important;
          }

          .auth-card p {
            font-size: 14px !important;
          }

          .auth-tabs button {
            padding: 12px 8px !important;
            font-size: 11px !important;
            letter-spacing: 1px !important;
          }

          .auth-tabs {
            padding: 5px !important;
            border-radius: 16px !important;
            margin-bottom: 20px !important;
          }

          .auth-input-wrapper {
            padding: 0 12px !important;
          }

          .auth-input-wrapper input {
            padding: 12px 0 !important;
            font-size: 14px !important;
          }

          .auth-input-wrapper .input-icon {
            font-size: 16px !important;
          }

          .auth-input-label {
            font-size: 10px !important;
            letter-spacing: 1.2px !important;
          }

          .auth-name-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }

          .auth-btn {
            padding: 14px !important;
            font-size: 12px !important;
            letter-spacing: 1.5px !important;
          }

          .auth-social-btn {
            padding: 10px !important;
            font-size: 12px !important;
          }

          .auth-otp-input {
            font-size: 16px !important;
            padding: 12px !important;
          }

          .auth-separator {
            font-size: 12px !important;
            margin: 16px 0 10px !important;
          }

          .auth-back-link {
            font-size: 13px !important;
          }
        }

        /* ─── TRÈS PETIT ÉCRAN (iPhone SE) ─── */
        @media (max-width: 420px) {
          .auth-left {
            min-height: 200px !important;
            padding: 16px 12px !important;
          }

          .auth-left h1 {
            font-size: 20px !important;
          }

          .auth-left .auth-tags {
            gap: 4px !important;
            margin-top: 10px !important;
          }

          .auth-left .auth-tags span {
            padding: 3px 8px !important;
            font-size: 9px !important;
          }

          .auth-right {
            padding: 12px 10px !important;
          }

          .auth-card {
            padding: 16px 12px !important;
          }

          .auth-card h2 {
            font-size: 24px !important;
          }

          .auth-card p {
            font-size: 13px !important;
          }

          .auth-tabs button {
            padding: 10px 6px !important;
            font-size: 10px !important;
          }

          .auth-input-wrapper input {
            padding: 10px 0 !important;
            font-size: 13px !important;
          }

          .auth-btn {
            padding: 12px !important;
            font-size: 11px !important;
          }

          .auth-tags span {
            padding: 4px 10px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      <section
        style={{
          ...leftStyle,
          backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.50)), url(${active.image})`,
        }}
        className="auth-left"
      >
        <div style={leftContentStyle}>
          <h1 style={leftTitleStyle}>
            {pendingOtp && screen === "login" ? (
              <>
                {t('auth.hero.otp.line1')}
                <br />
                <span style={redWordStyle}>{t('auth.hero.otp.highlight')}</span>
                <br />
                {t('auth.hero.otp.line2')}
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

          <div style={tagsBoxStyle} className="auth-tags">
            {(pendingOtp && screen === "login"
              ? t('auth.hero.otp.tags', { returnObjects: true })
              : active.tags
            ).map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={rightStyle} className="auth-right">
        <div style={cardStyle} className="auth-card">
          <div style={tabsStyle} className="auth-tabs">
            <button
              type="button"
              onClick={() => changeScreen("login")}
              style={tabStyle(screen === "login")}
              onMouseEnter={hoverTabEnter}
              onMouseLeave={(e) => hoverTabLeave(e, screen === "login")}
            >
              {t('auth.tabs.login')}
            </button>

            <button
              type="button"
              onClick={() => changeScreen("register")}
              style={tabStyle(screen === "register")}
              onMouseEnter={hoverTabEnter}
              onMouseLeave={(e) => hoverTabLeave(e, screen === "register")}
            >
              {t('auth.tabs.register')}
            </button>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={successStyle}>{message}</div>}

          {screen === "login" && (
            <>
              <h2 style={titleStyle}>
                {pendingOtp ? t('auth.login.otpTitle') : t('auth.login.title')}
              </h2>

              <p style={descStyle}>
                {pendingOtp
                  ? t('auth.login.otpDesc')
                  : t('auth.login.desc')}
              </p>

              {pendingOtp ? (
                <form onSubmit={handleVerifyOtp}>
                  <Input
                    icon={<Hash size={18} />}
                    label={t('auth.login.otpLabel')}
                    placeholder={t('auth.login.otpPlaceholder')}
                    value={otp}
                    onChange={setOtp}
                  />

                  <HoverButton type="submit">
                    {t('auth.login.verifyButton')}
                  </HoverButton>
                  
                </form>
              ) : (
                <>
                  <form onSubmit={handleLogin}>
                    <Input
                      icon={<Mail size={18} />}
                      label={t('auth.login.emailLabel')}
                      type="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      value={loginForm.email}
                      onChange={(v) =>
                        setLoginForm({
                          ...loginForm,
                          email: v,
                        })
                      }
                    />

                    <Input
                      icon={<KeyRound size={18} />}
                      label={t('auth.login.passwordLabel')}
                      type="password"
                      placeholder={t('auth.login.passwordPlaceholder')}
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
                        {t('auth.login.forgotLink')}
                      </button>
                    </div>

                    <HoverButton type="submit" className="auth-btn">
                      {t('auth.login.submitButton')}
                    </HoverButton>
                  </form>

                  <div style={separatorStyle} className="auth-separator">{t('auth.login.orContinueWith')}</div>

                  {/* Connexion avec Google */}
                  <SocialButton onClick={loginWithGoogle} className="auth-social-btn">
                    <FcGoogle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {t('auth.login.googleButton')}
                  </SocialButton>
                </>
              )}
            </>
          )}

          {screen === "register" && (
            <>
              <h2 style={titleStyle}>{t('auth.register.title')}</h2>
              <p style={descStyle}>
                {t('auth.register.desc')}
              </p>

              <form onSubmit={handleRegister}>
                <div style={registerNameGridStyle} className="auth-name-grid">
                  <Input
                    icon={<User size={18} />}
                    label={t('auth.register.firstNameLabel')}
                    placeholder={t('auth.register.firstNamePlaceholder')}
                    value={registerForm.firstName}
                    onChange={(v) =>
                      setRegisterForm({
                        ...registerForm,
                        firstName: v,
                      })
                    }
                  />

                  <Input
                    icon={<User size={18} />}
                    label={t('auth.register.lastNameLabel')}
                    placeholder={t('auth.register.lastNamePlaceholder')}
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
                  icon={<Mail size={18} />}
                  label={t('auth.register.emailLabel')}
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={registerForm.email}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      email: v,
                    })
                  }
                />

                <Input
                  icon={<Phone size={18} />}
                  label={t('auth.register.phoneLabel')}
                  placeholder={t('auth.register.phonePlaceholder')}
                  value={registerForm.phone}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      phone: v,
                    })
                  }
                />

                <Input
                  icon={<Lock size={18} />}
                  label={t('auth.register.passwordLabel')}
                  type="password"
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={registerForm.password}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      password: v,
                    })
                  }
                />

                <Input
                  icon={<KeyRound size={18} />}
                  label={t('auth.register.confirmLabel')}
                  type="password"
                  placeholder={t('auth.register.confirmPlaceholder')}
                  value={registerForm.confirmPassword}
                  onChange={(v) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: v,
                    })
                  }
                />

                <HoverButton type="submit" className="auth-btn">
                  {t('auth.register.submitButton')}
                </HoverButton>
              </form>
            </>
          )}

          {screen === "forgot" && (
            <>
              <h2 style={titleStyle}>{t('auth.forgot.title')}</h2>
              <p style={descStyle}>
                {t('auth.forgot.desc')}
              </p>

              <form onSubmit={handleForgot}>
                <Input
                  icon={<Mail size={18} />}
                  label={t('auth.forgot.emailLabel')}
                  type="email"
                  placeholder={t('auth.forgot.emailPlaceholder')}
                  value={forgotEmail}
                  onChange={setForgotEmail}
                />

                <HoverButton type="submit" className="auth-btn">
                  {t('auth.forgot.submitButton')}
                </HoverButton>
              </form>

              <p style={{ textAlign: "center", marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => changeScreen("login")}
                  style={inlineButtonStyle}
                  className="auth-back-link"
                >
                  {t('auth.forgot.backLink')}
                </button>
              </p>
            </>
          )}

          {screen === "reset" && (
            <>
              <h2 style={titleStyle}>
                {t('auth.reset.title')}
              </h2>

              <p style={descStyle}>
                {t('auth.reset.desc')}
              </p>

              <form onSubmit={handleResetPassword}>
                <Input
                  icon={<Lock size={18} />}
                  label={t('auth.reset.newPasswordLabel')}
                  type="password"
                  placeholder={t('auth.reset.passwordPlaceholder')}
                  value={newPassword}
                  onChange={setNewPassword}
                />

                <Input
                  icon={<KeyRound size={18} />}
                  label={t('auth.reset.confirmLabel')}
                  type="password"
                  placeholder={t('auth.reset.passwordPlaceholder')}
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                />

                <HoverButton type="submit" className="auth-btn">
                  {t('auth.reset.submitButton')}
                </HoverButton>
              </form>

              <p style={{ textAlign: "center", marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => changeScreen("login")}
                  style={inlineButtonStyle}
                  className="auth-back-link"
                >
                  {t('auth.reset.backLink')}
                </button>
              </p>
            </>
          )}
        </div>
      </section>
      <BottomNav />
    </div>
  );
}

// ============================================================
// COMPOSANTS ET STYLES
// ============================================================

function Input({ label, type = "text", placeholder, value, onChange, icon }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle} className="auth-input-label">{label}</label>

      <div
        style={{
          ...inputWrapperStyle,
          borderColor: focused ? "#E30613" : "#dfe5ec",
          boxShadow: focused ? "0 0 0 4px rgba(227,6,19,.12)" : "none",
        }}
        className="auth-input-wrapper"
      >
        <span style={inputIconStyle} className="input-icon">{icon}</span>

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
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

function HoverButton({ children, type = "button", className = "" }) {
  return (
    <button
      type={type}
      style={mainButtonStyle}
      className={`auth-btn ${className}`}
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

function SocialButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      style={socialButtonStyle}
      className={`auth-social-btn ${className}`}
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
  color: "#fff",
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