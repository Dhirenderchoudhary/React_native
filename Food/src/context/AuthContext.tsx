import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Order = {
  id: string;
  place: string;
  items: string;
  total: number;
  date: string;
};

type User = {
  identifier: string;
  name: string;
  email: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  cartCount: number;
  setCartCount: Dispatch<SetStateAction<number>>;
  orders: Order[];
  login: (identifier: string, password: string) => Promise<void>;
  signup: (identifier: string, password: string) => Promise<void>;
  socialLogin: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  addOrder: (order: Omit<Order, "id" | "date">) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("userToken"),
      AsyncStorage.getItem("currentUser"),
      AsyncStorage.getItem("orders"),
    ]).then(([token, savedUser, savedOrders]) => {
      setIsLoggedIn(!!token);
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setOrders(savedOrders ? JSON.parse(savedOrders) : []);
      setIsLoading(false);
    });
  }, []);

  const login = async (identifier: string, password: string) => {
    const normalized = identifier.trim().toLowerCase();
    const savedUsers = await AsyncStorage.getItem("mockUsers");
    const users: Record<string, { password: string; user: User }> = savedUsers ? JSON.parse(savedUsers) : {};
    const record = users[normalized];

    if (!normalized || password.length < 4) {
      throw new Error("Enter your email and a 4+ character password.");
    }

    if (record && record.password !== password) {
      throw new Error("Password does not match this account.");
    }

    const nextUser = record?.user ?? {
      identifier: normalized,
      name: normalized.includes("@") ? normalized.split("@")[0] : "Juniper User",
      email: normalized.includes("@") ? normalized : "hello@juniper.app",
    };

    if (!record) {
      users[normalized] = { password, user: nextUser };
      await AsyncStorage.setItem("mockUsers", JSON.stringify(users));
    }

    await AsyncStorage.setItem("userToken", "mock-token");
    await AsyncStorage.setItem("currentUser", JSON.stringify(nextUser));
    setUser(nextUser);
    setIsLoggedIn(true);
  };

  const signup = async (identifier: string, password: string) => {
    const normalized = identifier.trim().toLowerCase();
    const savedUsers = await AsyncStorage.getItem("mockUsers");
    const users: Record<string, { password: string; user: User }> = savedUsers ? JSON.parse(savedUsers) : {};

    if (!normalized || password.length < 4) {
      throw new Error("Use an email and a 4+ character password.");
    }

    if (users[normalized]) {
      throw new Error("Account already exists. Log in instead.");
    }

    const nextUser = {
      identifier: normalized,
      name: normalized.includes("@") ? normalized.split("@")[0] : "Juniper User",
      email: normalized.includes("@") ? normalized : "hello@juniper.app",
    };

    users[normalized] = { password, user: nextUser };
    await AsyncStorage.setItem("mockUsers", JSON.stringify(users));
    await AsyncStorage.setItem("userToken", "mock-token");
    await AsyncStorage.setItem("currentUser", JSON.stringify(nextUser));
    setUser(nextUser);
    setIsLoggedIn(true);
  };

  const socialLogin = async (provider: string) => {
    const nextUser = {
      identifier: provider,
      name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
      email: `${provider}@juniper.app`,
    };

    await AsyncStorage.setItem("userToken", "mock-token");
    await AsyncStorage.setItem("currentUser", JSON.stringify(nextUser));
    setUser(nextUser);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
  };

  const addOrder = async (order: Omit<Order, "id" | "date">) => {
    const nextOrder = {
      ...order,
      id: `KHA-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Today",
    };
    const nextOrders = [nextOrder, ...orders];

    setOrders(nextOrders);
    await AsyncStorage.setItem("orders", JSON.stringify(nextOrders));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, cartCount, setCartCount, orders, login, signup, socialLogin, logout, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
