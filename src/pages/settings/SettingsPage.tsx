import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Settings } from '../../types';
import { apiService } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    gst_number: '',
    tax_rate: 18,
    invoice_prefix: 'INV',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await apiService.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
        <p className="text-gray-600 mt-1">Configure your business details and system settings</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading settings...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card title="Business Details" className="mb-6">
          <div className="space-y-4">
            <Input
              label="Business Name *"
              value={settings.business_name || ''}
              onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              required
              placeholder="Enter business name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                value={settings.business_address || ''}
                onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Enter business address"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                value={settings.business_phone || ''}
                onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                placeholder="Enter phone number"
              />

              <Input
                label="Email"
                type="email"
                value={settings.business_email || ''}
                onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <Input
              label="GST Number"
              value={settings.gst_number || ''}
              onChange={(e) => setSettings({ ...settings, gst_number: e.target.value })}
              placeholder="Enter GST number"
            />
          </div>
        </Card>

        <Card title="Invoice Settings" className="mb-6">
          <div className="space-y-4">
            <Input
              label="Invoice Prefix"
              value={settings.invoice_prefix || ''}
              onChange={(e) => setSettings({ ...settings, invoice_prefix: e.target.value })}
              placeholder="e.g., INV, BILL"
              helperText="Prefix for invoice numbers"
            />

            <Input
              label="Tax Rate (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={settings.tax_rate || 18}
              onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 18 })}
              placeholder="18"
              helperText="Default GST rate for invoices"
            />
          </div>
        </Card>

        <Card title="Units Configuration" className="mb-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Available units: Meter, Yard, Piece, Kilogram, Roll
            </p>
            <p className="text-sm text-gray-500">
              Units can be configured when adding products. Default unit is Meter.
            </p>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      </form>
      )}
    </div>
  );
};

