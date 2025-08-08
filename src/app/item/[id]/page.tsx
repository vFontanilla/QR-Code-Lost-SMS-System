'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchItemByDocumentId } from '@/lib/api';

type Item = {
  id: number;
  name: string;
  description: string | null;
  status_item: 'found' | 'missing';
  location?: string;
  ownerName?: string;
  ownerPhone?: string;
  documentId?: string;
};

// export default function ItemDetailPage() {
//   const params = useParams();
//   console.log('useParams()', params); // ← What does this print?

//   return <h1>Debugging Params</h1>;
// }

export default function ItemDetailPage() {
  const params = useParams();
  console.log('useParams()', params);
  const documentId = params?.id as string;
  const [item, setItem] = useState<Item | null>(null);

  console.log('Params:', documentId);
  console.log('DEBUG: Item details:', item);

  useEffect(() => {
    if (typeof documentId === 'string') {
      fetchItemByDocumentId(documentId)
        .then((res) => {
          const itemData = res.data.data;
          console.log('Item Data:', itemData);

          if (itemData) {
            setItem({
              id: itemData.id,
              name: itemData.name,
              description: itemData.description,
              status_item: itemData.status_item,
              location: itemData.location,
              ownerName: itemData.ownerName,
              ownerPhone: itemData.ownerPhone,
              documentId: itemData.documentId,
            });
          }
        })
        .catch(console.error);
    }
  }, [documentId]);

  if (!item) return <p>Loading item details...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Item Details</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {item.name}</p>
        <p><strong>Description:</strong> {item.description || 'No description provided.'}</p>
        <p><strong>Status:</strong> {item.status_item}</p>
        {item.location && <p><strong>Location:</strong> {item.location}</p>}
        {item.ownerName && <p><strong>Owner Name:</strong> {item.ownerName}</p>}
        {item.ownerPhone && <p><strong>Contact:</strong> {item.ownerPhone}</p>}
        {item.status_item === 'missing' && (
          <p className="text-red-600 font-semibold">
            This item is reported missing. If found, please contact the owner.
          </p>
        )}
      </div>
    </div>
  );
}
