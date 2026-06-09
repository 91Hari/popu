import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 12,
        borderBottom: "1px solid #eee",
      }}
    >
      <Logo />
      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/customer">Customer</Link>
        <Link to="/caterer">Caterer</Link>
      </div>
    </nav>
  );
}
