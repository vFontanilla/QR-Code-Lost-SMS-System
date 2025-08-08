'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Clear input fields & redirect if already logged in
  useEffect(() => {
    setEmail('');
    setPassword('');

    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { jwt, user } = data;
        console.log('Token2:', jwt);

        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(user));

        alert('Login successful!');
        router.push('/dashboard');
      } else {
        alert(data?.error?.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} autoComplete="off" className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-4">Login</h2>

        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            autoComplete="off"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="mt-4 text-sm text-center">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
