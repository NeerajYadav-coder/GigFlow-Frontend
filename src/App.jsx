import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateGig from "./pages/CreateGig";
import GigDetails from "./pages/GigDetails";
import MyBids from "./pages/MyBids";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/create" element={
          <ProtectedRoute role="client">
            <CreateGig />
          </ProtectedRoute>
        } />
        <Route path="/gig/:id" element={<GigDetails />} />
        <Route path="/my-bids" element={
          <ProtectedRoute>
            <MyBids />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        {/* 404 fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
            <div className="text-center">
              <div className="text-8xl font-black gradient-text mb-4">404</div>
              <p className="text-xl font-semibold text-[#f0f0fa] mb-2">Page not found</p>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                The page you're looking for doesn't exist.
              </p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
