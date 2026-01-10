import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Package, ShoppingCart, Receipt, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_products: 0,
    total_purchases: 0,
    total_sales: 0,
    profit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Total Products',
      value: isLoading ? '...' : stats.total_products.toString(),
      icon: <Package className="w-8 h-8 text-primary-600" />,
      color: 'bg-primary-50',
    },
    {
      title: 'Total Purchases',
      value: isLoading ? '...' : `₹${stats.total_purchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <ShoppingCart className="w-8 h-8 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Total Sales',
      value: isLoading ? '...' : `₹${stats.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <Receipt className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Profit',
      value: isLoading ? '...' : `₹${stats.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm font-medium">Overview of your business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-soft-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/purchases/new')}
            className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
          >
            <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-primary-700">New Purchase</h3>
            <p className="text-sm text-gray-600">Record a new purchase entry</p>
          </button>
          <button
            onClick={() => navigate('/sales/new')}
            className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
          >
            <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-primary-700">New Sale</h3>
            <p className="text-sm text-gray-600">Create a new sales invoice</p>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
          >
            <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-primary-700">View Reports</h3>
            <p className="text-sm text-gray-600">Generate business reports</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

