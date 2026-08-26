import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/api';

interface ReportViewProps {
  reportType: string;
  dateRange: { start: string; end: string };
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ reportType, dateRange, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [reportType, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (reportType === 'sales') {
        const sales = await apiService.getSales();
        const filtered = sales.filter(s => {
          const d = s.invoice_date.split('T')[0];
          return d >= dateRange.start && d <= dateRange.end;
        });
        const totalSales = filtered.reduce((acc, s) => acc + s.total_amount, 0);
        const totalGst = filtered.reduce((acc, s) => acc + s.gst_amount, 0);
        setData({ list: filtered, totalSales, totalGst, count: filtered.length });
      } else if (reportType === 'purchase') {
        const purchases = await apiService.getPurchases();
        const filtered = purchases.filter(p => {
          const d = p.invoice_date.split('T')[0];
          return d >= dateRange.start && d <= dateRange.end;
        });
        const totalPurchases = filtered.reduce((acc, p) => acc + p.total_amount, 0);
        const totalGst = filtered.reduce((acc, p) => acc + p.gst_amount, 0);
        setData({ list: filtered, totalPurchases, totalGst, count: filtered.length });
      } else if (reportType === 'profit') {
        const sales = await apiService.getSales();
        const purchases = await apiService.getPurchases();
        
        const filteredSales = sales.filter(s => {
          const d = s.invoice_date.split('T')[0];
          return d >= dateRange.start && d <= dateRange.end;
        });
        const filteredPurchases = purchases.filter(p => {
          const d = p.invoice_date.split('T')[0];
          return d >= dateRange.start && d <= dateRange.end;
        });

        const totalRev = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
        const totalExp = filteredPurchases.reduce((acc, p) => acc + p.subtotal, 0);
        setData({ revenue: totalRev, expenses: totalExp, net: totalRev - totalExp });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
    setLoading(false);
  };

  const handleExport = () => {
    alert('Excel export functionality will be implemented');
  };

  if (loading) {
    return <div className="text-center py-8">Generating report...</div>;
  }

  const renderReportContent = () => {
    switch (reportType) {
      case 'sales':
        return (
          <div className="space-y-6">
            <Card title="Sales Summary">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">₹{data?.totalSales?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total GST</p>
                  <p className="text-2xl font-bold text-gray-900">₹{data?.totalGst?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.count || 0}</p>
                </div>
              </div>
            </Card>
            <Card title="Sales Transactions">
              <Table
                data={data?.list || []}
                columns={[
                  { key: 'invoice_no', header: 'Invoice No' },
                  { key: 'invoice_date', header: 'Date', render: (s: any) => new Date(s.invoice_date).toLocaleDateString() },
                  { key: 'total_amount', header: 'Amount', render: (s: any) => `₹${s.total_amount.toFixed(2)}` },
                ]}
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
                  <p className="text-2xl font-bold text-gray-900">₹{data?.totalPurchases?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total GST</p>
                  <p className="text-2xl font-bold text-gray-900">₹{data?.totalGst?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.count || 0}</p>
                </div>
              </div>
            </Card>
            <Card title="Purchase Transactions">
              <Table
                data={data?.list || []}
                columns={[
                  { key: 'invoice_no', header: 'Invoice No' },
                  { key: 'invoice_date', header: 'Date', render: (p: any) => new Date(p.invoice_date).toLocaleDateString() },
                  { key: 'total_amount', header: 'Amount', render: (p: any) => `₹${p.total_amount.toFixed(2)}` },
                ]}
                emptyMessage="No purchase data available for the selected date range"
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
                  <p className="text-sm text-gray-600">Total Revenue (Subtotal)</p>
                  <p className="text-2xl font-bold text-green-600">₹{data?.revenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Expenses (Subtotal)</p>
                  <p className="text-2xl font-bold text-red-600">₹{data?.expenses?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className="text-3xl font-bold text-gray-900">₹{data?.net?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return <div>Report view for this type is not fully implemented yet.</div>;
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
