import { useLocation, useParams } from "react-router-dom";
import "../styles/navbar.css";
import logo from "../assets/logo-tvs.png";

export default function Navbar() {
  const location = useLocation();
  const { company } = useParams<{ company?: string }>();

  const getTitle = () => {
    // ✅ Data page with company
    if (location.pathname.startsWith("/data") && company) {
      return company;
    }

    // ✅ Data page without company
    if (location.pathname.startsWith("/data")) {
      return "Data";
    }

    // ✅ SIM search page
    if (location.pathname.startsWith("/sim")) {
      return "SIM Lookup";
    }

    // ✅ Home / default
    return "Dashboard";
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <h1 className="navbar-title">{getTitle()}</h1>
      </div>
    </header>
  );
}
