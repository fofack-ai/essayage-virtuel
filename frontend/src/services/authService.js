const USERS_KEY = "tryon_users";
const CURRENT_USER_KEY = "tryon_current_user";

const getUsers = () => {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const removePassword = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const authService = {
  register(data) {
    const users = getUsers();

    const emailExists = users.find(
      (user) => user.email.toLowerCase() === data.email.toLowerCase()
    );

    if (emailExists) {
      throw new Error("Cet email est déjà utilisé.");
    }

    if (data.password !== data.confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas.");
    }

    const newUser = {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.email.includes("admin") ? "admin" : "client",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const safeUser = removePassword(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return safeUser;
  },

  login(email, password) {
    const users = getUsers();

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    const safeUser = removePassword(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return safeUser;
  },

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },
};