import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar__brand">
        <span className="logo">🎬</span>
        <span>MovieFinder</span>
      </NavLink>
      <div className="navbar__links">
        <NavLink to="/" end>
          Home
        </NavLink>
      </div>
    </nav>
  );
}
