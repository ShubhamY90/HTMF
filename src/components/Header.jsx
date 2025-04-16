// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../context/firebase';

const Header = () => {
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('userRole');
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header
      className="fixed top-1 left-1 right-1 rounded-b-lg rounded-t-lg z-50 p-5 text-white header-shadow"
      style={{ backgroundColor: 'rgba(254, 74, 96, 0.9)' }} // 90% opacity of #580191
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block text-pink-500 text-3xl">✧</span>
          <span className="text-[#ffc480] text-3xl">Hackathon Teammate Finder</span>
          <span className="inline-block text-teal-600 text-3xl">✧</span>
        </div>
        <nav>
          <Link to="/" className="mx-2 text-white hover:underline">Home</Link>
          <Link to="/hackathons" className="mx-2 text-white hover:underline">Hackathons</Link>
          <Link to="/faqs" className="mx-2 text-white hover:underline">Contact</Link>
          {userRole && (
            <Link to="/dashboard" className="mx-2 text-white hover:underline">Dashboard</Link>
          )}
          {userRole && (
            <Link to="/notifications" className="mx-2 text-white hover:underline">Notifications</Link>
          )}
          {userRole === 'admin' && (
            <Link to="/add-hackathon" className="mx-2 text-white hover:underline">Add Hackathon</Link>
          )}
          {userRole && (
            <button onClick={handleLogout} className="mx-2 text-white hover:underline">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
