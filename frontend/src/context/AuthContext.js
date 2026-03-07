import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.api";

const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = async () => {
    try {
      const profile = await authApi.me();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refreshUser();
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        setUser(response.user);
      },
      register: async (name, email, password, passwordConfirmation) => {
        const response = await authApi.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        });
        setUser(response.user);
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
      refreshUser
    }),
    [loading, user]
  );
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
export {
  AuthProvider,
  useAuth
};
