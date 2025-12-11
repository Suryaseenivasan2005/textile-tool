import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ReportViewProps {
  reportType: string;
  dateRange: { start: string; end: string };
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ reportType, dateRange, onClose }) => {
  // Mock data - replace with actual API calls
  const mockData: any[] = [];

  const handleExport = () => {
    // TODO: Implement Excel export using xlsx library
    alert('Excel export functionality will be implemented');
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'sales':
        return (
          <div className="space-y-6">
            <Card title="Sales Summary">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total GST</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </Card>
            <Card title="Sales Transactions">
              <Table
                data={mockData}
                columns={[]}
                emptyMessage="No sales data available for the selected date range"
              />
            </Card>
          </div>
        );

      case 'purchase':
        return (
          <div className="space-y-6">
            <Card title="Purchase Summary">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total GST</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </Card>
            <Card title="Purchase Transactions">
              <Table
                data={mockData}
                columns={[]}
                emptyMessage="No purchase data available for the selected date range"
              />
            </Card>
          </div>
        );

      case 'stock':
        return (
          <div className="space-y-6">
            <Card title="Stock Summary">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
              </div>
            </Card>
            <Card title="Stock Details">
              <Table
                data={mockData}
                columns={[]}
                emptyMessage="No stock data available"
              />
            </Card>
          </div>
        );

      case 'profit':
        return (
          <div className="space-y-6">
            <Card title="Profit & Loss Summary">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">₹0.00</p>
                </div>
                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className="text-3xl font-bold text-gray-900">₹0.00</p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'gst':
        return (
          <div className="space-y-6">
            <Card title="GST Summary">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Output GST (Sales)</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Input GST (Purchases)</p>
                  <p className="text-2xl font-bold text-gray-900">₹0.00</p>
                </div>
                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm text-gray-600">GST Payable</p>
                  <p className="text-3xl font-bold text-gray-900">₹0.00</p>
                </div>
              </div>
            </Card>
            <Card title="GST Details">
              <Table
                data={mockData}
                columns={[]}
                emptyMessage="No GST data available for the selected date range"
              />
            </Card>
          </div>
        );

      default:
        return <div>Report type not found</div>;
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Date Range: {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
        </p>
        <Button
          variant="primary"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>
      {renderReportContent()}
    </div>
  );
};

