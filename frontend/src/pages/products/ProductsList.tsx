import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, X, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ProductForm } from './ProductForm';
import { Product } from '../../types';
import { apiService } from '../../services/api';

export const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getProducts({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.design?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEditProduct = async (product: Product) => {
    try {
      await apiService.updateProduct(product.id, product);
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      loadProducts();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update product');
    }
  };

  const handleDeactivateProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      loadProducts();
    } catch (err: any) {
      console.error('Error deactivating product:', err);
      alert(err.message || 'Failed to deactivate product');
    }
  };

  const columns = [
    {
      key: 'name' as keyof Product,
      header: 'Product Name',
    },
    {
      key: 'category' as keyof Product,
      header: 'Category',
      render: (product: Product) => product.category || '-',
    },
    {
      key: 'color' as keyof Product,
      header: 'Color',
      render: (product: Product) => product.color || '-',
    },
    {
      key: 'design' as keyof Product,
      header: 'Design',
      render: (product: Product) => product.design || '-',
    },
    {
      key: 'unit' as keyof Product,
      header: 'Unit',
    },
    {
      key: 'cost_price' as keyof Product,
      header: 'Cost Price',
      render: (product: Product) => `₹${(product.cost_price || 0).toFixed(2)}`,
    },
    {
      key: 'selling_price' as keyof Product,
      header: 'Selling Price',
      render: (product: Product) => `₹${(product.selling_price || 0).toFixed(2)}`,
    },
    {
      key: 'status' as keyof Product,
      header: 'Status',
      render: (product: Product) => (
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
            product.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      key: 'actions' as keyof Product,
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
              setIsEditModalOpen(true);
            }}
            className="text-primary-600 hover:text-primary-700 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {product.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeactivateProduct(product.id);
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products / Fabric Master</h1>
          <p className="text-gray-600 mt-2 text-sm font-medium">Manage your product and fabric catalog</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, color, or design..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading products...</div>
        ) : (
          <Table
            data={filteredProducts}
            columns={columns}
            emptyMessage="No products found. Add your first product to get started."
          />
        )}
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        title="Edit Product"
        size="lg"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSubmit={handleEditProduct}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

