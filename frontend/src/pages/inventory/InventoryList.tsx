import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { StockAdjustmentForm } from './StockAdjustmentForm';
import { Inventory, StockMovement } from '../../types';
import { apiService } from '../../services/api';

export const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Inventory | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getInventory();
      setInventory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock low stock threshold
  const LOW_STOCK_THRESHOLD = 10;

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !lowStockOnly || item.quantity_available <= LOW_STOCK_THRESHOLD;
    return matchesSearch && matchesLowStock;
  });

  const handleStockAdjustment = async (productId: string, quantity: number, type: 'in' | 'out' | 'adjustment', reason?: string) => {
    try {
      await apiService.adjustInventory({
        product_id: productId,
        quantity,
        type,
        reason,
      });
      setIsAdjustModalOpen(false);
      setSelectedProduct(null);
      loadInventory(); // Reload inventory
    } catch (err: any) {
      console.error('Error adjusting inventory:', err);
      alert(err.message || 'Failed to adjust inventory');
    }
  };

  const columns = [
    {
      key: 'product' as keyof Inventory,
      header: 'Product',
      render: (item: Inventory) => (
        <div>
          <p className="font-medium text-gray-900">{item.product?.name || 'Unknown'}</p>
          {item.product?.category && (
            <p className="text-xs text-gray-500">{item.product.category}</p>
          )}
        </div>
      ),
    },
    {
      key: 'quantity_available' as keyof Inventory,
      header: 'Stock Available',
      render: (item: Inventory) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${
            item.quantity_available <= LOW_STOCK_THRESHOLD ? 'text-red-600' : 'text-gray-900'
          }`}>
            {item.quantity_available} {item.product?.unit || ''}
          </span>
          {item.quantity_available <= LOW_STOCK_THRESHOLD && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'status' as keyof Inventory,
      header: 'Status',
      render: (item: Inventory) => {
        if (item.quantity_available <= LOW_STOCK_THRESHOLD) {
          return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              Low Stock
            </span>
          );
        } else if (item.quantity_available === 0) {
          return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              Out of Stock
            </span>
          );
        }
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            In Stock
          </span>
        );
      },
    },
    {
      key: 'actions' as keyof Inventory,
      header: 'Actions',
      render: (item: Inventory) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedProduct(item);
            setIsAdjustModalOpen(true);
          }}
          className="flex items-center gap-1"
        >
          <Edit className="w-4 h-4" />
          Adjust
        </Button>
      ),
    },
  ];

  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity_available <= LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = inventory.filter(item => item.quantity_available === 0).length;
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.quantity_available * (item.product?.cost_price || 0)), 0
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track and manage your stock levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-gray-600">{outOfStockCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-green-600">₹{totalValue.toFixed(2)}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show low stock only</span>
          </label>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading inventory...</div>
        ) : (
          <Table
            data={filteredInventory}
            columns={columns}
            emptyMessage="No inventory items found. Products will appear here after you add them."
          />
        )}
      </Card>

      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Adjust Stock"
        size="md"
      >
        {selectedProduct && (
          <StockAdjustmentForm
            inventory={selectedProduct}
            onSubmit={handleStockAdjustment}
            onCancel={() => {
              setIsAdjustModalOpen(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

