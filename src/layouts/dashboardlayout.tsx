import React from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import "../styles/sidebar.css";
import "../styles/navbar.css";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="home-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}
