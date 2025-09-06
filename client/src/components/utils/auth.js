export const logout = (navigate) => {
  // Remove token and any other user info from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("adminData"); // if you store admin info
  // Redirect to login page
  navigate("/login");
};