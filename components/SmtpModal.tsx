'use client';
import { useState, useEffect } from 'react';
import { Server, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SmtpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmtpModal({ isOpen, onClose }: SmtpModalProps) {
  const [smtpCredentials, setSmtpCredentials] = useState({
    emailUser: '',
    emailPass: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchSmtpCredentials = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/credentials`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.settings) {
        setSmtpCredentials({
          emailUser: data.settings.emailUser,
          emailPass: '••••••••'
        });
      }
    } catch (error) {
      console.error('Failed to fetch SMTP credentials:', error);
      toast.error('Failed to load SMTP settings');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSmtpCredentials();
    }
  }, [isOpen]);

  const handleUpdateSmtpCredentials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/credentials`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailUser: smtpCredentials.emailUser,
          emailPass: smtpCredentials.emailPass === '••••••••' ? undefined : smtpCredentials.emailPass
        })
      });

      if (response.ok) {
        toast.success('SMTP credentials updated successfully');
        setIsEditing(false);
        await fetchSmtpCredentials();
      } else {
        throw new Error('Failed to update credentials');
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error(error.message || 'Failed to update SMTP credentials');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d404f]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0d404f] flex items-center">
            <Server className="mr-2" />
            SMTP Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={smtpCredentials.emailUser}
                onChange={(e) => setSmtpCredentials({...smtpCredentials, emailUser: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                disabled={isLoading}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">{smtpCredentials.emailUser}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Password
            </label>
            {isEditing ? (
              <input
                type="password"
                value={smtpCredentials.emailPass}
                onChange={(e) => setSmtpCredentials({...smtpCredentials, emailPass: e.target.value})}
                placeholder="Leave blank to keep current password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f]"
                disabled={isLoading}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded">{smtpCredentials.emailPass}</p>
            )}
          </div>

          <div className="sticky bottom-0 bg-white pt-6 border-t flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    fetchSmtpCredentials();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSmtpCredentials}
                  disabled={isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff795f] hover:bg-[#0d404f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff795f] ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff795f] hover:bg-[#0d404f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff795f]"
                >
                  <Pencil className="h-4 w-4 mr-1 inline" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}