"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthRedirectProps {
  requireAuth: boolean;
  redirectTo?: string;
}

export default function AuthRedirect({ requireAuth, redirectTo = "/" }: AuthRedirectProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      // Check both localStorage and sessionStorage
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      
      if (requireAuth) {
        // For protected routes
        if (!token) {
          toast.error('Please sign up or log in to access this page', {
            duration: 3000,
            position: 'top-center',
            icon: '🔒',
          });
          router.push(redirectTo);
          return;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            toast.error('Session expired. Please log in again', {
              duration: 3000,
              position: 'top-center',
              icon: '⚠️',
            });
            router.push(redirectTo);
            return;
          }
          
          // If we get here, user is authenticated
          setIsCheckingAuth(false);
        } catch (error) {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          toast.error('Authentication error. Please log in again', {
            duration: 3000,
            position: 'top-center',
            icon: '🚨',
          });
          router.push(redirectTo);
        }
      } else {
        // For public routes (like login/signup)
        if (token) {
          router.push('/dashboard');
        } else {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();
  }, [requireAuth, router, redirectTo]);

  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return null;
}