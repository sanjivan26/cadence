import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Puzzle from "./pages/Puzzle";
import Register from "./pages/Register";
import AdminPuzzles from "./pages/AdminPuzzles";
import Archive from "./pages/Archive";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin/puzzles"
            element={<AdminPuzzles />}
          />
          <Route path="/home" element={<Home />} />
          <Route
            path="/games/:gameSlug/daily"
            element={<Puzzle />}
          />
          <Route
            path="/archive"
            element={<Archive />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
