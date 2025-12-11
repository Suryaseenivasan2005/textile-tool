import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Eye, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { VendorForm } from './VendorForm';
import { VendorDetail } from './VendorDetail';
import { Vendor } from '../../types';
import { apiService } from '../../services/api';

export const VendorsList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getVendors({ search: searchTerm || undefined });
      setVendors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vendors');
      console.error('Error loading vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadVendors();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVendor = async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiService.createVendor(vendor);
      setIsAddModalOpen(false);
      loadVendors(); // Reload list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create vendor');
    }
  };

  const handleEditVendor = async (vendor: Vendor) => {
    try {
      await apiService.updateVendor(vendor.id, vendor);
      setIsEditModalOpen(false);
      setSelectedVendor(null);
      loadVendors(); // Reload list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update vendor');
    }
  };

  const handleDeactivateVendor = async (id: string) => {
    try {
      await apiService.deleteVendor(id);
      loadVendors(); // Reload list
    } catch (err: any) {
      console.error('Error deactivating vendor:', err);
      alert(err.message || 'Failed to deactivate vendor');
    }
  };

  const columns = [
    {
      key: 'name' as keyof Vendor,
      header: 'Vendor Name',
    },
    {
      key: 'gst_number' as keyof Vendor,
      header: 'GST Number',
      render: (vendor: Vendor) => vendor.gst_number || '-',
    },
    {
      key: 'phone' as keyof Vendor,
      header: 'Phone',
      render: (vendor: Vendor) => vendor.phone || '-',
    },
    {
      key: 'status' as keyof Vendor,
      header: 'Status',
      render: (vendor: Vendor) => (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            vendor.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {vendor.status}
        </span>
      ),
    },
    {
      key: 'actions' as keyof Vendor,
      header: 'Actions',
      render: (vendor: Vendor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedVendor(vendor);
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
              setSelectedVendor(vendor);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {vendor.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivateVendor(vendor.id);
              }}
              className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Deactivate"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Vendors</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Manage your vendor records</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search vendors by name..."
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
          <div className="text-center py-12 text-gray-500">Loading vendors...</div>
        ) : (
          <Table
            data={filteredVendors}
            columns={columns}
            emptyMessage="No vendors found. Add your first vendor to get started."
          />
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor"
        size="md"
      >
        <VendorForm
          onSubmit={handleAddVendor}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVendor(null);
        }}
        title="Edit Vendor"
        size="md"
      >
        {selectedVendor && (
          <VendorForm
            vendor={selectedVendor}
            onSubmit={handleEditVendor}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedVendor(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVendor(null);
        }}
        title="Vendor Details"
        size="lg"
      >
        {selectedVendor && (
          <VendorDetail
            vendor={selectedVendor}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedVendor(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

