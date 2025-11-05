import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="nav">
      <div className="nav-inner container">
        <div className="brand">Smart Finance</div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
