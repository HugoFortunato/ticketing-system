import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { User } from "../api/types";

const STORAGE_KEY = "ticketing.userId";

type UserContextValue = {
  users: User[];
  userId: string;
  setUserId: (id: string) => void;
  currentUser: User | undefined;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER_ID ?? "";
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserIdState] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? defaultUserId,
  );

  useEffect(() => {
    api.listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const setUserId = (id: string) => {
    setUserIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const value = useMemo(
    () => ({
      users,
      userId,
      setUserId,
      currentUser: users.find((user) => user.id === userId),
    }),
    [users, userId],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
