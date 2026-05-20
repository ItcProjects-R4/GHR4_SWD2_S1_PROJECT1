import { Routes, Route } from "react-router";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout/Layout";
import ProtectedRoutes from "@/components/ProtectedRoutes/ProtectedRoutes";
import AdminRoute from "@/components/AdminRoute/AdminRoute";
import Home from "@/pages/Home/Home";
import Explore from "@/pages/Explore/Explore";
import RestaurantDetail from "@/pages/RestaurantDetail/RestaurantDetail";
import Saved from "@/pages/Saved/Saved";
import Profile from "@/pages/Profile/Profile";
import Admin from "@/pages/Admin/Admin";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import NotFound from "@/pages/NotFound/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth routes - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoutes>
                <Saved />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <Profile />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
