
import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
    FaHome,
    FaClipboardList,
    FaPlusCircle,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from "react-icons/fa";

import "./Sidebar.css";
import { logout } from "../services/auth";

function Sidebar({ onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: FaHome
        },
        {
            name: "Category",
            path: "/categories",
            icon: FaClipboardList
        },
        {
            name: "Transactions",
            path: "/transactions",
            icon: FaPlusCircle
        }
    ];

    const handleClick = () => {
        setMenuOpen(false);
    };
    const handleLogoutClick = () => {
        setMenuOpen(false);
        setShowLogoutModal(true);
    };
    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };
    const handleConfirmLogout = () => {
        setShowLogoutModal(false);

        if (onLogout) {
            onLogout();
        } else {
            logout();
        }
    };

    return (
        <>
            <button
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle sidebar"
            >
                {menuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {menuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}
            <aside className={`sidebar ${menuOpen ? "open" : ""}`}>

                <h2 className="sidebar-title">
                    Personal Finance & Expense Tracker
                </h2>

                <nav className="sidebar-menu">

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                onClick={handleClick}
                                className={({ isActive }) =>
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                            >
                                <Icon className="menu-icon" />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                    <button
                        className="sidebar-link logout-link"
                        onClick={handleLogoutClick}
                    >
                        <FaSignOutAlt className="menu-icon" />
                        <span>Logout</span>
                    </button>

                </nav>
            </aside>
            {showLogoutModal && (
                <div
                    className="logout-modal-overlay"
                    onClick={handleCancelLogout}
                >
                    <div
                        className="logout-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="logout-modal-icon">
                            <FaSignOutAlt />
                        </div>

                        <h2>Confirm Logout</h2>

                        <p>
                            Are you sure you want to logout
                            from your account?
                        </p>

                        <div className="logout-modal-actions">

                            <button
                                className="logout-cancel-btn"
                                onClick={handleCancelLogout}
                            >
                                Cancel
                            </button>

                            <button
                                className="logout-confirm-btn"
                                onClick={handleConfirmLogout}
                            >
                                Yes, Logout
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
export default Sidebar;
