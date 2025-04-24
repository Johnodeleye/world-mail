'use client';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAccountModal({ isOpen, onClose, onSuccess }: AddAccountModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onSuccess();
      onClose();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Registration failed';
      setError(error);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0d404f] flex items-center">
            <UserPlus className="mr-2" />
            Add New Account
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff795f] hover:bg-[#0d404f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff795f] ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}