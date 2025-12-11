import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Color } from '../../types';

interface ColorFormProps {
  color?: Color;
  onSubmit: (color: Color | Omit<Color, 'id'>) => void;
  onCancel: () => void;
}

// Color name mapping based on hex codes
const getColorNameFromHex = (hex: string): string => {
  if (!hex || hex.length !== 6) return '';
  
  const hexUpper = hex.toUpperCase();
  const colorMap: { [key: string]: string } = {
    // Primary colors
    'FF0000': 'Red',
    '00FF00': 'Green',
    '0000FF': 'Blue',
    'FFFF00': 'Yellow',
    'FF00FF': 'Magenta',
    '00FFFF': 'Cyan',
    // Common colors
    '000000': 'Black',
    'FFFFFF': 'White',
    '808080': 'Gray',
    'C0C0C0': 'Silver',
    'FFA500': 'Orange',
    '800080': 'Purple',
    'FFC0CB': 'Pink',
    'A52A2A': 'Brown',
    'FFD700': 'Gold',
    'FF6347': 'Tomato',
    '32CD32': 'Lime Green',
    '008000': 'Dark Green',
    '000080': 'Navy',
    '800000': 'Maroon',
    'FF1493': 'Deep Pink',
    '00CED1': 'Dark Turquoise',
    'FF4500': 'Orange Red',
    '4B0082': 'Indigo',
    'DC143C': 'Crimson',
    '00FF7F': 'Spring Green',
    'FF69B4': 'Hot Pink',
    '8B4513': 'Saddle Brown',
    '2E8B57': 'Sea Green',
    '4169E1': 'Royal Blue',
    'FF8C00': 'Dark Orange',
    '9370DB': 'Medium Purple',
    '3CB371': 'Medium Sea Green',
    'CD5C5C': 'Indian Red',
    '4682B4': 'Steel Blue',
    '9ACD32': 'Yellow Green',
    '20B2AA': 'Light Sea Green',
    '778899': 'Light Slate Gray',
    'B0C4DE': 'Light Steel Blue',
    'FFB6C1': 'Light Pink',
    'FFA07A': 'Light Salmon',
    '98D8C8': 'Pale Turquoise',
    'F0E68C': 'Khaki',
    'DDA0DD': 'Plum',
    'F5DEB3': 'Wheat',
    'DEB887': 'Burly Wood',
    'BC8F8F': 'Rosy Brown',
    'A9A9A9': 'Dark Gray',
    '696969': 'Dim Gray',
    '556B2F': 'Dark Olive Green',
    '8B008B': 'Dark Magenta',
    '9932CC': 'Dark Orchid',
    '8B0000': 'Dark Red',
    '483D8B': 'Dark Slate Blue',
    '2F4F4F': 'Dark Slate Gray',
    '006400': 'Dark Green',
    'BDB76B': 'Dark Khaki',
  };

  // Exact match
  if (colorMap[hexUpper]) {
    return colorMap[hexUpper];
  }

  // Try to find closest match by RGB distance
  const r = parseInt(hexUpper.substring(0, 2), 16);
  const g = parseInt(hexUpper.substring(2, 4), 16);
  const b = parseInt(hexUpper.substring(4, 6), 16);

  let closestColor = '';
  let minDistance = Infinity;

  Object.entries(colorMap).forEach(([hexKey, colorName]) => {
    const r2 = parseInt(hexKey.substring(0, 2), 16);
    const g2 = parseInt(hexKey.substring(2, 4), 16);
    const b2 = parseInt(hexKey.substring(4, 6), 16);
    
    const distance = Math.sqrt(
      Math.pow(r - r2, 2) + Math.pow(g - g2, 2) + Math.pow(b - b2, 2)
    );

    if (distance < minDistance && distance < 50) {
      minDistance = distance;
      closestColor = colorName;
    }
  });

  if (closestColor) {
    return closestColor;
  }

  // If no match found, generate a descriptive name
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 50) return 'Dark Color';
  if (brightness > 200) return 'Light Color';
  return 'Custom Color';
};

export const ColorForm: React.FC<ColorFormProps> = ({ color, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    hex_code: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (color) {
      setFormData({
        name: color.name,
        hex_code: color.hex_code || '',
        status: color.status,
      });
    }
  }, [color]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (color) {
      onSubmit({ ...formData, id: color.id });
    } else {
      onSubmit(formData);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexValue = e.target.value.replace('#', '').toUpperCase();
    const colorName = getColorNameFromHex(hexValue);
    setFormData({
      ...formData,
      hex_code: hexValue,
      // Always auto-fill name based on selected color
      name: colorName || formData.name,
    });
  };

  const handleHexCodeChange = (value: string) => {
    // Remove # if user types it
    const cleaned = value.replace('#', '').toUpperCase();
    // Only allow hex characters
    if (/^[0-9A-Fa-f]*$/.test(cleaned) && cleaned.length <= 6) {
      const colorName = cleaned.length === 6 ? getColorNameFromHex(cleaned) : '';
      setFormData({
        ...formData,
        hex_code: cleaned,
        // Auto-fill name when hex code is complete and we found a match
        // Or keep existing name if no match found
        name: colorName || formData.name,
      });
    }
  };

  // Ensure color picker always has a valid 6-digit hex value
  const getColorPickerValue = (): string => {
    if (!formData.hex_code) return '#FFFFFF';
    const padded = formData.hex_code.padEnd(6, '0').substring(0, 6);
    return `#${padded}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pick Color *
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={getColorPickerValue()}
            onChange={handleColorPickerChange}
            className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm hover:border-primary-500 transition-colors"
            title="Pick a color"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {formData.hex_code && (
                <div
                  className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm"
                  style={{ backgroundColor: `#${formData.hex_code}` }}
                  title={`#${formData.hex_code}`}
                />
              )}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    #
                  </div>
                  <input
                    type="text"
                    value={formData.hex_code}
                    onChange={(e) => handleHexCodeChange(e.target.value)}
                    placeholder="FFFFFF"
                    maxLength={6}
                    className="input pl-8"
                    pattern="[0-9A-Fa-f]{0,6}"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Click the color box to pick a color, or enter hex code manually
            </p>
          </div>
        </div>
      </div>

      <Input
        label="Color Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="Color name will be auto-filled based on selection"
      />

      {color && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
            }
            className="input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="w-full sm:w-auto">
          {color ? 'Update' : 'Add'} Color
        </Button>
      </div>
    </form>
  );
};

