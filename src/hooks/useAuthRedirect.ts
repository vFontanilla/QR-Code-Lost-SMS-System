'use client';
import { useEffect } from 'react';

export default function useAuthRedirect() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/'; // 👈 redirects to your login page
    }
  }, []);
}
