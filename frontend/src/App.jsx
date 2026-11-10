
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Registration";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Category from "./pages/Category";
import PublicRoute from "./components/PublicRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <>
            <Routes>

                {/* Public routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Default route */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/categories" element={<Category />} />
                </Route>
                {/* Invalid URL */}
                {/* <Route path="*" element={<Navigate to="/dashboard" /> } /> */}
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="colored"
                closeOnClick
                pauseOnHover
            />
        </>
    );
}

export default App;
