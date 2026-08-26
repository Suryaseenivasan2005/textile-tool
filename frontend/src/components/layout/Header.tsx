import React, { useState } from 'react';
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  Tags,
  Palette,
  Warehouse,
  ShoppingCart,
  Receipt,
  RotateCcw,
  CreditCard,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDemo } from '../../context/DemoContext';
import { Button } from '../ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/vendors', label: 'Vendors', icon: <Users className="w-5 h-5" /> },
  { path: '/customers', label: 'Customers', icon: <UserCheck className="w-5 h-5" /> },
  { path: '/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
  { path: '/categories', label: 'Category Master', icon: <Tags className="w-5 h-5" /> },
  { path: '/colors', label: 'Color Master', icon: <Palette className="w-5 h-5" /> },
  { path: '/inventory', label: 'Inventory', icon: <Warehouse className="w-5 h-5" /> },
  { path: '/purchases', label: 'Purchases', icon: <ShoppingCart className="w-5 h-5" /> },
  { path: '/sales', label: 'Sales & Billing', icon: <Receipt className="w-5 h-5" /> },
  { path: '/returns', label: 'Returns', icon: <RotateCcw className="w-5 h-5" /> },
  { path: '/payments', label: 'Payments & Ledger', icon: <CreditCard className="w-5 h-5" /> },
  { path: '/reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDemoMode, endDemo } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (isDemoMode) {
      endDemo();
    } else {
      logout();
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 fixed top-0 right-0 left-0 lg:left-64 z-40 shadow-soft">
      <div className="flex-1 hidden sm:block">
        <h2 className="text-base font-semibold text-gray-900">Welcome back!</h2>
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden mr-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-gray-700">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-gray-900 text-sm">
              {isDemoMode ? 'Demo User' : (user?.name || 'Admin')}
            </p>
            <p className="text-xs text-gray-500">
              {isDemoMode ? 'Sample mode' : user?.mobile}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{isDemoMode ? 'Exit Demo' : 'Logout'}</span>
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4 lg:hidden flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
          <div className="p-2 bg-gray-50 rounded-lg mb-2">
            <p className="font-medium text-gray-900 text-sm">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.mobile}</p>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`justify-start w-full ${isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span className={`mr-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>{item.icon}</span>
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 pt-2 mt-2">
            <Button
              variant="ghost"
              className="justify-start w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isDemoMode ? 'Exit Demo' : 'Logout'}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
