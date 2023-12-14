import { useAuth } from "./AuthContext";

function Logout() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Logout;
