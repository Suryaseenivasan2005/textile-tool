import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { CustomerForm } from './CustomerForm';
import { CustomerDetail } from './CustomerDetail';
import { Customer } from '../../types';
import { apiService } from '../../services/api';

export const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCustomers({ search: searchTerm || undefined });
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiService.createCustomer(customer);
      setIsAddModalOpen(false);
      loadCustomers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create customer');
    }
  };

  const handleEditCustomer = async (customer: Customer) => {
    try {
      await apiService.updateCustomer(customer.id, customer);
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update customer');
    }
  };

  const columns = [
    {
      key: 'name' as keyof Customer,
      header: 'Customer Name',
    },
    {
      key: 'gst_number' as keyof Customer,
      header: 'GST Number',
      render: (customer: Customer) => customer.gst_number || '-',
    },
    {
      key: 'phone' as keyof Customer,
      header: 'Phone',
      render: (customer: Customer) => customer.phone || '-',
    },
    {
      key: 'address' as keyof Customer,
      header: 'Address',
      render: (customer: Customer) => customer.address || '-',
      className: 'max-w-xs truncate',
    },
    {
      key: 'actions' as keyof Customer,
      header: 'Actions',
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(customer);
              setIsDetailModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer(customer);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Manage your customer records</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search customers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading customers...</div>
        ) : (
          <Table
            data={filteredCustomers}
            columns={columns}
            emptyMessage="No customers found. Add your first customer to get started."
          />
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        size="md"
      >
        <CustomerForm
          onSubmit={handleAddCustomer}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        title="Edit Customer"
        size="md"
      >
        {selectedCustomer && (
          <CustomerForm
            customer={selectedCustomer}
            onSubmit={handleEditCustomer}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCustomer(null);
        }}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <CustomerDetail
            customer={selectedCustomer}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

