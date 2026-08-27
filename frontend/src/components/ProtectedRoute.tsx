import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

function ProtectedRoute() {
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        await axios.get(
          "http://127.0.0.1:8000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAuthenticated(true);
      } catch {
        localStorage.removeItem("access_token");
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    }

    checkAuthentication();
  }, []);

  if (checking) {
    return <p>Checking authentication...</p>;
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;