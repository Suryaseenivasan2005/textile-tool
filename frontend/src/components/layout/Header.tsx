import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-40 shadow-soft">
      <div className="flex-1 hidden sm:block">
        <h2 className="text-base font-semibold text-gray-900">Welcome back!</h2>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-700">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-gray-900 text-sm">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.mobile}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

