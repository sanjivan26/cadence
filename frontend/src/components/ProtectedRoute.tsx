import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";

const API_URL = import.meta.env.VITE_API_URL;

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
          `${API_URL}/auth/me`,
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
    return <LoadingScreen message="Checking authentication..." />
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