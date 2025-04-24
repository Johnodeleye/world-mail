'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Send, 
  Trash2, 
  Plus, 
  Menu, 
  LogOut,
  UserPlus,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddAccountModal from './AddAccountModal';
import ComposeModal from './ComposeModal';
import toast from 'react-hot-toast';
import { User, Email, DashboardStats } from '@/app/types';

export default function Dashboard() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sent' | 'users' | 'trash'>('sent');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ sent: 0, users: 0, trash: 0 });
  const [emails, setEmails] = useState<Email[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trashEmails, setTrashEmails] = useState<Email[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user details
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
          credentials: 'include'
        });
        const userData = await userRes.json();
        setUser(userData);

        // Fetch dashboard stats
        const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard/stats`);
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch emails
        const emailsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/history?status=sent`);
        const emailsData = await emailsRes.json();
        setEmails(emailsData.data || emailsData || []);
        

        const trashRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/history?status=trash`);
        const trashData = await trashRes.json();
        setTrashEmails(trashData.data || trashData || []);
        

        // Fetch users (if admin)
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`);
        const usersData = await usersRes.json();
        setUsers(usersData.data || usersData || []);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async (id: number) => {
    try {
      const toastId = toast.loading('Permanently deleting email...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/${id}/permanent`, {
        method: 'DELETE',
        credentials: 'include'
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to permanently delete email');
      }
  
      setTrashEmails(prev => prev.filter(email => email.id !== id));
      setStats(prev => ({ ...prev, trash: prev.trash - 1 }));
      toast.success('Email permanently deleted!', { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to permanently delete email');
      console.error('Permanent delete failed:', error);
    }
  };

  const handleDeleteEmail = async (id: number) => {
    try {
      // Show loading toast
      const toastId = toast.loading('Moving email to trash...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/email/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
  
      if (response.ok) {
        const data = await response.json();
        
        // Update the UI
        setEmails(prev => prev.filter(email => email.id !== id));
        setTrashEmails(prev => [data, ...prev]); // Add the deleted email to trash
        setStats(prev => ({ 
          ...prev, 
          sent: prev.sent - 1,
          trash: prev.trash + 1 
        }));
        
        // Update toast to success
        toast.success('Email moved to trash successfully!', { id: toastId });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to move email to trash');
      }
    } catch (error) {
      // Show error toast
      toast.error(error instanceof Error ? error.message : 'Failed to move email to trash');
      console.error('Delete failed:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== id));
        setStats(prev => ({ ...prev, users: prev.users - 1 }));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleAddUserSuccess = () => {
    // Refresh users list
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setStats(prev => ({ ...prev, users: prev.users + 1 }));
      });
    
    toast.success('User created successfully');
    setIsAddAccountOpen(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d404f]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      <AddAccountModal 
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onSuccess={handleAddUserSuccess}
      />


        <ComposeModal 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={(newEmail: Email) => {
            setEmails(prev => [newEmail, ...prev]);
            setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
            toast.success('Email sent successfully!');
        }}
        />

      {/* Header - make it more responsive */}
      <header className="bg-[#0d404f] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="https://www.rtnewworld.com/wp-content/uploads/2025/02/cropped-Brown-Beige-Tree-Business-Fundation-Logo-e1740757016443.png"
                alt="Rotary New World Foundation Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="ml-3 text-lg md:text-xl font-semibold">Mail Sender</span>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {/* Desktop buttons */}
                <button 
                  onClick={() => setIsAddAccountOpen(true)}
                  className="flex items-center text-sm hover:text-[#ff795f] transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Add Account</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex items-center text-sm hover:text-[#ff795f] transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{isLoading ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
              
              <button 
                className="md:hidden p-2 rounded-md hover:bg-[#1a5a6a]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="pt-4 border-t border-[#1a5a6a]">
                <div className="flex flex-col space-y-3 px-2">
                  <button 
                    onClick={() => {
                      setIsAddAccountOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-sm hover:text-[#ff795f] transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Account
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex items-center text-sm hover:text-[#ff795f] transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - make tables responsive */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Sent Emails Card */}
            <div 
              onClick={() => setActiveTab('sent')} 
              className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all ${activeTab === 'sent' ? 'ring-2 ring-[#ff795f]' : ''}`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                    <Send className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Sent Emails</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.sent}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div 
              onClick={() => setActiveTab('users')} 
              className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all ${activeTab === 'users' ? 'ring-2 ring-[#ff795f]' : ''}`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.users}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Trash Card */}
            <div 
              onClick={() => setActiveTab('trash')} 
              className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all ${activeTab === 'trash' ? 'ring-2 ring-[#ff795f]' : ''}`}
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-md">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Trash</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.trash}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'sent' && (
          <>
            <div className="mb-4 flex justify-end">
              <button 
                onClick={() => setIsComposeOpen(true)} 
                className="flex items-center px-3 py-2 bg-[#0d404f] text-white rounded-md hover:bg-[#1a5a6a] transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Compose</span>
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emails.length > 0 ? (
                      emails.map((email) => (
                        <tr key={email.id}>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[120px] truncate">
                            {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[150px] truncate">
                            {email.subject}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(email.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => handleDeleteEmail(email.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                          No emails found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

{activeTab === 'trash' && (
  <div className="bg-white shadow overflow-hidden rounded-lg">
    <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted On</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trashEmails.length > 0 ? (
            trashEmails.map((email) => (
              <tr key={email.id}>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[120px] truncate">
                  {Array.isArray(email.to) ? email.to.join(', ') : email.to}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[150px] truncate">
                  {email.subject}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(email.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(email.updatedAt).toLocaleDateString()}
                </td>

                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => handlePermanentDelete(email.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Permanently Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                Trash is empty
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
      </main>
    </div>
  );
}