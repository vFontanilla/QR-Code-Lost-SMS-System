'use client';
import { useEffect, useState } from 'react';
import { fetchItems } from '@/lib/api';
import Link from 'next/link';
import ItemList from '@/components/Itemlist';
// import { useRouter } from 'next/navigation';
import useAuthRedirect from '@/hooks/useAuthRedirect'; // 👈 auth protection

interface User {
  id: number;
  username: string;
  email: string;
}

export default function DashboardPage() {
  useAuthRedirect(); // 👈 protect the page
  // const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/profile');
        if (!userRes.ok) throw new Error('Unauthorized');

        const userData = await userRes.json();
        setUser(userData);

        const itemRes = await fetchItems();
        console.log(itemRes)
        setItems(itemRes.data.data);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // force redirect and clear all
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6 text-red-600">You are not logged in.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Registered Items</h2>
      <Link href="/add-item" className="text-blue-600 hover:underline mb-4 inline-block">
        + Add New Item
      </Link>

      <ItemList items={items} />
    </div>
  );
}
