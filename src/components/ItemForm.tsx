'use client';
import React, { useState, useRef, FormEvent } from 'react';
import { addItem } from '@/lib/api';
import QRCodeDisplay from '@/components/QRCodeDisplay';

interface ItemPayload {
  name: string;
  description: string;
  status_item: 'found' | 'missing';
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string | null;
  location?: string;
  date?: string | null;
  user: number; // ✅ Include user ID here
}

export default function ItemForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status_item, setStatusItem] = useState<'found' | 'missing'>('found');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [newItemId, setNewItemId] = useState<number | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user || !token) {
      alert('You must be logged in to add an item.');
      setLoading(false);
      return;
    }

    const payload: ItemPayload = {
      name,
      description,
      status_item,
      ownerName,
      ownerPhone,
      ownerEmail: ownerEmail.trim() === '' ? null : ownerEmail,
      location,
      date: date.trim() === '' ? null : date,
      user: user.id, // ✅ Attach user ID
    };

    try {
      console.log('Token being sent:', token);
      const response = await addItem(payload, token || undefined);
      console.log('Response from API:', response.data);
      setNewItemId(response.data.data.documentId); // ✅ This should now work correctly
    } catch (error: any) {
      console.error('Error adding item:', error.response?.data || error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const qrUrl = newItemId ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/item/${newItemId}` : '';

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_item_${newItemId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Item</h1>

      {newItemId ? (
        <div className="text-center space-y-4">
          <p className="text-green-600 font-medium">Item added successfully! Here is your QR code:</p>
          <div ref={qrRef} className="inline-block bg-white p-4 rounded-lg shadow">
            <QRCodeDisplay url={qrUrl} filename={`qr_item_${newItemId}`} />
          </div>
          <button
            onClick={downloadQRCode}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download QR Code
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium">Item Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status:</label>
            <select
              value={status_item}
              onChange={(e) => setStatusItem(e.target.value as 'found' | 'missing')}
              className="w-full mt-1 p-2 border rounded"
            >
              <option value="found">Found</option>
              <option value="missing">Missing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Owner Name:</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contact Number:</label>
            <input
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email (optional):</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location (where lost/found):</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date Lost/Found:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
      )}
    </div>
  );
}
