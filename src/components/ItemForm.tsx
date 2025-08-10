'use client';
import React, { useState, useRef, FormEvent } from 'react';
import { addItem } from '@/lib/api';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { Download, Copy, Printer, Link as LinkIcon, Share2, CheckCircle2 } from 'lucide-react';

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
      user: user.id,
    };

    try {
      console.log('Token being sent:', token);
      const response = await addItem(payload, token || undefined);
      console.log('Response from API:', response.data);
      setNewItemId(response.data.data.documentId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error adding item:', err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiErr = err as { response?: { data?: unknown } };
        console.error('Error adding item:', apiErr.response?.data);
      } else {
        console.error('Error adding item:', err);
      }
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

  const copyLink = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      alert('QR link copied to clipboard!');
    } catch {
      alert('Failed to copy link.');
    }
  };

  const printQRCode = () => {
    // Print just the QR code area
    const node = qrRef.current;
    if (!node) return;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          </style>
        </head>
        <body>${node.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };  

  const shareLink = async () => {
    if (!qrUrl || !navigator.share) return window.open(qrUrl, '_blank');
    try {
      await navigator.share({ title: 'Item QR Code', text: 'Scan to view item details', url: qrUrl });
    } catch {
      // user canceled; no-op
    }
  };  

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Item</h1>

      {newItemId ? (
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Item added successfully</span>
          </div>

          <div className="mx-auto max-w-xl rounded-2xl border bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">QR Code Ready</h2>
            <p className="mt-1 text-sm text-gray-500">
              Print it, stick it to the item, or share the link.
            </p>

            <div className="mt-5 flex flex-col items-center">
              <div
                ref={qrRef}
                className="mx-auto inline-block rounded-xl border border-dashed bg-white p-4 shadow-sm"
              >
                <QRCodeDisplay url={qrUrl} filename={`qr_item_${newItemId}`} />
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Target URL: <span className="break-all">{qrUrl}</span>
              </p>

              <div className="mt-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={copyLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </button>

                <button
                  onClick={downloadQRCode}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>

                <button
                  onClick={printQRCode}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>

                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  <LinkIcon className="h-4 w-4" />
                  Open Link
                </a>

                <button
                  onClick={shareLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  title={typeof navigator.share === 'function' ? 'Share' : 'Open link (share unsupported)'}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>

              {/* Back to dashboard button */}
              <div className="mt-6">
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
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
