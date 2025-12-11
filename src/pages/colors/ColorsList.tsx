import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ColorForm } from './ColorForm';
import { Color } from '../../types';
import { apiService } from '../../services/api';

export const ColorsList: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getColors({ search: searchTerm || undefined });
      setColors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load colors');
      console.error('Error loading colors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadColors();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredColors = colors.filter((color) =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddColor = async (color: Omit<Color, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiService.createColor(color);
      setIsAddModalOpen(false);
      loadColors();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create color');
    }
  };

  const handleEditColor = async (color: Color) => {
    try {
      await apiService.updateColor(color.id, color);
      setIsEditModalOpen(false);
      setSelectedColor(null);
      loadColors();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update color');
    }
  };

  const handleDeactivateColor = async (id: string) => {
    try {
      await apiService.deleteColor(id);
      loadColors();
    } catch (err: any) {
      console.error('Error deactivating color:', err);
      alert(err.message || 'Failed to deactivate color');
    }
  };

  const columns = [
    {
      key: 'name' as keyof Color,
      header: 'Color Name',
    },
    {
      key: 'hex_code' as keyof Color,
      header: 'Color Code',
      render: (color: Color) => (
        <div className="flex items-center gap-3">
          {color.hex_code && (
            <div
              className="w-8 h-8 rounded-lg border border-gray-300 shadow-sm"
              style={{ backgroundColor: color.hex_code }}
              title={color.hex_code}
            />
          )}
          <span>{color.hex_code || '-'}</span>
        </div>
      ),
    },
    {
      key: 'status' as keyof Color,
      header: 'Status',
      render: (color: Color) => (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            color.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {color.status}
        </span>
      ),
    },
    {
      key: 'actions' as keyof Color,
      header: 'Actions',
      render: (color: Color) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedColor(color);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {color.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivateColor(color.id as string);
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Color Master</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Manage product colors</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Color
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search colors by name..."
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
          <div className="text-center py-12 text-gray-500">Loading colors...</div>
        ) : (
          <Table
            data={filteredColors}
            columns={columns}
            emptyMessage="No colors found. Add your first color to get started."
          />
        )}
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Color"
        size="md"
      >
        <ColorForm
          onSubmit={handleAddColor}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedColor(null);
        }}
        title="Edit Color"
        size="md"
      >
        {selectedColor && (
          <ColorForm
            color={selectedColor}
            onSubmit={handleEditColor}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedColor(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

