import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
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
  Settings,
} from 'lucide-react';

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

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-30 flex-col shadow-soft">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600 tracking-tight">Textile Manager</h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">Business Management System</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className={isActive ? 'text-primary-600' : 'text-gray-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

