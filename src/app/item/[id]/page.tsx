'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchItemByDocumentId } from '@/lib/api';
import Link from 'next/link';
import { Mail, MapPin, Phone, Info, Loader2 } from 'lucide-react';

type Item = {
  id: number;
  name: string;
  description: string | null;
  status_item: 'found' | 'missing';
  location?: string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  documentId?: string;
};

export default function ItemDetailPage() {
  const params = useParams();
  const documentId = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const res = await fetchItemByDocumentId(documentId);
        const raw = res?.data?.data;
        // Your API returns flat objects, so we only handle array-or-single
        const entity = Array.isArray(raw) ? raw[0] : raw;

        if (!mounted) return;
        if (!entity) {
          setNotFound(true);
          return;
        }

        const mapped: Item = {
          id: entity.id,
          name: entity.name,
          description: entity.description ?? null,
          status_item: entity.status_item,
          location: entity.location ?? null,
          ownerName: entity.ownerName ?? null,
          ownerPhone: entity.ownerPhone ?? null,
          documentId: entity.documentId,
        };

        setItem(mapped);
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (typeof documentId === 'string') run();
    return () => {
      mounted = false;
    };
  }, [documentId]);

  const badge = useMemo(() => {
    if (!item) return null;
    const isMissing = item.status_item === 'missing';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium
          ${isMissing ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
      >
        <span
          className={`h-2 w-2 rounded-full
            ${isMissing ? 'bg-red-500' : 'bg-emerald-500'}`}
        />
        {isMissing ? 'Missing' : 'Found'}
      </span>
    );
  }, [item]);

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-2xl mx-auto">
        <div className="rounded-2xl border bg-white p-6 shadow">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="mt-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading item details…
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="px-4 py-8 max-w-xl mx-auto">
        <div className="rounded-2xl border bg-white p-6 shadow text-center">
          <Info className="mx-auto h-8 w-8 text-gray-400" />
          <h2 className="mt-2 text-lg font-semibold">Item not found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The item link may be invalid or the item was removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto">
      <div className="rounded-2xl border bg-white p-6 shadow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{item.name}</h1>
          {badge}
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-1 gap-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-800">
              {item.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.location && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{item.location}</p>
                </div>
              </div>
            )}

            {item.ownerPhone && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-gray-100 p-2">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Contact</p>
                  {/* tap-to-call on mobile */}
                  <a href={`tel:${item.ownerPhone}`} className="font-medium text-indigo-600 hover:underline">
                    {item.ownerPhone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {item.status_item === 'missing' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-700">
                This item is reported <span className="font-semibold">missing</span>. If found, please contact the owner or send a message below.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8">
          <Link
            href={`/found/${item.documentId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>Send a message to the owner</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
