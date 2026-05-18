import { useNavigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  FaHome,
  FaChartBar,
  FaSignOutAlt, FaSimCard, FaSignal 
} from "react-icons/fa";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();

  const handleLogout = async () => {
    // ✅ CLEAR ONLY AUTH STATE (IMPORTANT)
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("username");
    sessionStorage.removeItem("simSearchResults"); // ✅ HERE
  
    await instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  const sidebarItems = [
    { icon: <FaHome />, title: "Home", path: "/home" },
    { icon: <FaChartBar />, title: "Data", path: "/data" },
    { icon: <FaSimCard />, title: "Sim", path: "/sim" },
    { icon: <FaSignal />, title: "Status", path: "/status" },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  return (
    <aside className="sidebar">
      <nav>
        <ul className="nav-list">
          {sidebarItems.map((item) => (
            <li key={item.title}>
              <button
                title={item.title}
                className={`icon-link ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
              </button>
            </li>
          ))}
        </ul>

        <div className="logout-container">
          <button
            onClick={handleLogout}
            className="icon-link logout"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </nav>
    </aside>
  );
}