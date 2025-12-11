import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const Login: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateMobile = (mobile: string): boolean => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate mobile number
    if (!validateMobile(mobile)) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await login(mobile, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid mobile number or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-soft-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2 tracking-tight">Textile Manager</h1>
          <p className="text-gray-600 text-sm font-medium">Business Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Mobile Number"
            type="tel"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Only numbers
              if (value.length <= 10) {
                setMobile(value);
              }
            }}
            required
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            helperText="Enter your 10-digit mobile number"
          />
          
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
                className="input pr-10"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};

