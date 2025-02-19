import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/api';
import { isAuthenticated } from '../api/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white fixed top-0 left-0 right-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-between flex-1">
            <span className="font-bold text-xl">Log Viewer</span>
            {authenticated && (
              <nav className="space-x-4">
                <Link to="/search" className="text-white hover:text-gray-300">Search</Link>
                <Link to="/chart" className="text-white hover:text-gray-300">Analyse</Link>
                <Link to="/upload" className="text-white hover:text-gray-300">Upload</Link>
              </nav>
            )}
          </div>
          {authenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded hover:text-gray-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};