import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            📚 Flashcard App
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/upload" className="text-gray-700 hover:text-blue-600">
              Upload
            </Link>
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
