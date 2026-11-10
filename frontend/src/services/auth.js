export const logout = () => {
    // Remove JWT tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Redirect to login page
    window.location.href = "/";
};