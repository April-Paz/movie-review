import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          🎞️ MovieReviews
        </Link>

        <div style={{ flex: 1, maxWidth: "500px", margin: "0 20px" }}>
          <SearchBar />
        </div>

        <nav>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/movies" className="nav-link">
            Movies
          </Link>

          {isAuthenticated ? (
            <div className="user-section">
              <span>Welcome, {user?.username}!</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;