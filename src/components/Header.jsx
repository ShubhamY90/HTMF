// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../context/firebase';

const Header = () => {
  // Retrieve the user's role from localStorage; this is set during login.
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('userRole');
      // Optionally, clear other stored data if needed.
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header style={{ backgroundColor: '#580191' }} className="p-5">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Hackathon Teammate Finder</h1>
        <nav>
          <Link to="/" className="mx-2 text-white hover:underline">Home</Link>
          <Link to="/hackathons" className="mx-2 text-white hover:underline">Hackathons</Link>
          <Link to="/contact" className="mx-2 text-white hover:underline">Contact</Link>
          {/* Show Dashboard link only if user is logged in */}
          {userRole && (
            <Link to="/dashboard" className="mx-2 text-white hover:underline">Dashboard</Link>
          )}
          {userRole === 'admin' && (
            <Link to="/add-hackathon" className="mx-2 text-white hover:underline">Add Hackathon</Link>
          )}
          {userRole && (
            <button
              onClick={handleLogout}
              className="mx-2 text-white hover:underline"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
