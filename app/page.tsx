'use client';
import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import AuthRedirect from '@/components/AuthRedirect';

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Make sure this matches what your backend returns
    const token = data.token; 
    if (!token) {
      throw new Error('No token received');
    }

    // Store token
    if (formData.rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }

    // Redirect to dashboard
    window.location.href = '/dashboard'; // Use this instead of router.push to ensure full reload
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#0d404f] flex flex-col justify-center py-12 px-6 lg:px-8">
      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <Image
            src="https://www.rtnewworld.com/wp-content/uploads/2025/02/cropped-Brown-Beige-Tree-Business-Fundation-Logo-e1740757016443.png"
            alt="Rotary New World Foundation Logo"
            width={150}
            height={150}
            className="rounded-full"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Mail Sender Management
        </h2>
        <p className="mt-2 text-center text-sm text-[#7c7b79]">
          Access the Rotary New World Foundation management system
        </p>
      </motion.div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#0d404f]"
              >
                Username
              </label>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7c7b79] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f] sm:text-sm text-black"
                />
              </motion.div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#0d404f]"
              >
                Password
              </label>
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-[#7c7b79] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#ff795f] focus:border-[#ff795f] sm:text-sm text-black"
                />
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#ff795f] focus:ring-[#ff795f] border-[#7c7b79] rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-[#0d404f]"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="#"
                  className="font-medium text-[#ff795f] hover:text-[#0d404f]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff795f] hover:bg-[#0d404f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff795f] transition-colors duration-300 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 text-center text-sm text-[#7c7b79]"
      >
        <p>
          © {new Date().getFullYear()} Rotary New World Foundation. All rights reserved.
        </p>
        <p className="mt-1">
          Empowering children, young people and communities to make vital changes.
        </p>
      </motion.div>
      <AuthRedirect requireAuth={false} />
    </div>
  );
}