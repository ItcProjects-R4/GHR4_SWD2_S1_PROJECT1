import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const defaultAdminUser = {
    name: "Admin",
    email: "Admin@gmail.com",
    password: "Admin123",
    role: "admin",
    phone: "(555) 123-4567",
    location: "Cairo, Egypt",
    preferences: {
      cuisineTypes: "Italian, Japanese, Mexican",
      priceRange: "$$ - $$$",
      dietaryRestrictions: "None",
      preferredDiningTime: "7:00 PM - 9:00 PM",
    },
    notifications: {
      newRestaurantAlerts: true,
      reservationReminders: true,
      specialOffers: false,
      reviewRequests: true,
    },
    twoFactorEnabled: false,
    passwordLastChanged: "Changed May 2026",
  };

  const initialUsers = (() => {
    const savedUsers = localStorage.getItem("users");
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    const hasAdmin = users.some(
      (stored) => stored.email === defaultAdminUser.email,
    );
    if (!hasAdmin) {
      users.unshift(defaultAdminUser);
      localStorage.setItem("users", JSON.stringify(users));
    }
    return users;
  })();

  const getStoredUsers = useCallback(() => {
    const savedUsers = localStorage.getItem("users");
    if (savedUsers) return JSON.parse(savedUsers);
    return initialUsers;
  }, []);

  const saveStoredUsers = useCallback((users) => {
    localStorage.setItem("users", JSON.stringify(users));
  }, []);

  const updateUser = useCallback(
    (updates) => {
      const currentUser = user || {};
      const updatedUser = {
        ...currentUser,
        ...updates,
      };
      const publicUser = { ...updatedUser };
      delete publicUser.password;
      setUser(publicUser);
      localStorage.setItem("user", JSON.stringify(publicUser));

      const users = getStoredUsers();
      const existingIndex = users.findIndex(
        (stored) => stored.email === currentUser.email,
      );
      if (existingIndex !== -1) {
        users[existingIndex] = {
          ...users[existingIndex],
          ...updates,
          email: updatedUser.email,
          name: updatedUser.name,
        };
        saveStoredUsers(users);
      }
      return updatedUser;
    },
    [getStoredUsers, saveStoredUsers, user],
  );

  const login = useCallback(
    ({ email, password }) => {
      const users = getStoredUsers();
      const existing = users.find((stored) => stored.email === email);
      if (!existing) {
        throw new Error("No account found with this email");
      }
      if (existing.password !== password) {
        throw new Error("Incorrect password");
      }
      const currentUser = { ...existing };
      delete currentUser.password;
      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));
      return currentUser;
    },
    [getStoredUsers],
  );

  const register = useCallback(
    ({ name, email, password }) => {
      const users = getStoredUsers();
      const existing = users.find((stored) => stored.email === email);
      if (existing) {
        throw new Error("Email already registered");
      }
      const passwordLastChanged = `Changed ${new Date().toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        },
      )}`;
      const newUser = {
        name,
        email,
        password,
        phone: "(555) 123-4567",
        location: "New York, NY",
        preferences: {
          cuisineTypes: "Italian, Japanese, Mexican",
          priceRange: "$$ - $$$",
          dietaryRestrictions: "None",
          preferredDiningTime: "7:00 PM - 9:00 PM",
        },
        notifications: {
          newRestaurantAlerts: true,
          reservationReminders: true,
          specialOffers: false,
          reviewRequests: true,
        },
        twoFactorEnabled: false,
        passwordLastChanged,
      };
      users.push(newUser);
      saveStoredUsers(users);
      const publicUser = { ...newUser };
      delete publicUser.password;
      setUser(publicUser);
      localStorage.setItem("user", JSON.stringify(publicUser));
      return publicUser;
    },
    [getStoredUsers, saveStoredUsers],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  const deleteAccount = useCallback(() => {
    if (!user?.email) return;
    const users = getStoredUsers().filter(
      (stored) => stored.email !== user.email,
    );
    saveStoredUsers(users);
    logout();
  }, [getStoredUsers, logout, saveStoredUsers, user]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        updateUser,
        deleteAccount,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
