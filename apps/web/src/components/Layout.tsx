import { Link, NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { users, userId, setUserId } = useUser();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Ticketing<span>V1</span>
        </Link>
        <nav>
          <NavLink to="/" end>
            Eventos
          </NavLink>
        </nav>
        <label className="user-switch">
          Usuário
          <select value={userId} onChange={(event) => setUserId(event.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
