import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, Package, ShoppingCart, Receipt } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ReportView } from './ReportView';

export const ReportsList: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const reports = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'View sales transactions and revenue',
      icon: <Receipt className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      id: 'purchase',
      title: 'Purchase Report',
      description: 'View purchase transactions and expenses',
      icon: <ShoppingCart className="w-8 h-8 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      id: 'stock',
      title: 'Stock Report',
      description: 'View current inventory levels',
      icon: <Package className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      id: 'profit',
      title: 'Profit Summary',
      description: 'View profit and loss analysis',
      icon: <TrendingUp className="w-8 h-8 text-yellow-600" />,
      color: 'bg-yellow-50',
    },
    {
      id: 'gst',
      title: 'GST Breakup',
      description: 'View GST details and tax summary',
      icon: <Calendar className="w-8 h-8 text-red-600" />,
      color: 'bg-red-50',
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    setIsReportModalOpen(true);
  };

  const handleExport = (reportId: string) => {
    // TODO: Implement Excel export
    alert(`Excel export for ${reportId} report will be implemented`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate business reports and analytics</p>
      </div>

      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Date Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <div className={`${report.color} p-4 rounded-lg mb-4 inline-block`}>
              {report.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleGenerateReport(report.id)}
                className="flex-1"
              >
                Generate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(report.id)}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedReport(null);
        }}
        title={reports.find((r) => r.id === selectedReport)?.title || 'Report'}
        size="xl"
      >
        {selectedReport && (
          <ReportView
            reportType={selectedReport}
            dateRange={dateRange}
            onClose={() => {
              setIsReportModalOpen(false);
              setSelectedReport(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

