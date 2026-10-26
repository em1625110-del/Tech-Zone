import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import useAuth from "../hooks/useAuth";

function getAuthError(error) {
  const messages = {
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/invalid-email": "Укажите корректный email.",
    "auth/weak-password": "Пароль должен содержать не менее 6 символов.",
    "auth/too-many-requests": "Слишком много попыток. Попробуйте позже.",
    "auth/network-request-failed": "Ошибка сети. Проверьте подключение.",
  };
  return messages[error.code] || error.message || "Не удалось выполнить запрос.";
}

export default function AuthPage() {
  const { authError, authLoading, firebaseConfigured, isAdmin, login, register, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) navigate(isAdmin ? "/admin" : "/account", { replace: true });
  }, [user, authLoading, isAdmin, navigate]);

  if (authLoading) return <main className="section"><p>Проверка аккаунта...</p></main>;
  if (user) return <Navigate to={isAdmin ? "/admin" : "/account"} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (mode === "register") {
        await register({ name: name.trim(), email: email.trim(), password });
        setSuccess("Аккаунт создан. Для входа в админ-панель администратор должен назначить вам роль.");
      } else {
        await login({ email: email.trim(), password });
        setSuccess("Вход выполнен. Если у аккаунта есть роль администратора, панель откроется автоматически.");
      }
    } catch (submitError) {
      setError(getAuthError(submitError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="section auth-page">
      <section className="auth-card">
        <h1>{mode === "login" ? "Вход" : "Регистрация"}</h1>
        <p className="auth-note">Войдите или создайте аккаунт Tech-Zone.</p>
        {!firebaseConfigured && (
          <p className="admin-error">Firebase не настроен. Заполните .env.local по примеру .env.example и перезапустите приложение.</p>
        )}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>Имя<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label>
          )}
          <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
          <label>Пароль<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          {error && <p className="admin-error">{error}</p>}
          {authError && <p className="admin-error">{authError}</p>}
          {success && <p className="admin-success">{success}</p>}
          <button type="submit" className="primary-button" disabled={busy || !firebaseConfigured}>
            {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {busy ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
        </form>
        <button className="auth-mode-toggle" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}>
          {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
        </button>
        <Link to="/" className="auth-back-link">Вернуться в магазин</Link>
      </section>
    </main>
  );
}
