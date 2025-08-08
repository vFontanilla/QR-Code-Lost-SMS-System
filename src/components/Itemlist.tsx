'use client';

import Link from 'next/link';

type Item = {
  id: number;
  name: string;
  status_item: 'found' | 'missing';
  documentId: string;
};

type ItemListProps = {
  items: Item[]; // props coming from parent component
};

export default function ItemList({ items }: ItemListProps) {
  console.log('DEBUG: Item list received from API:', items);

  if (!items || items.length === 0) {
    return <p>No items found.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        console.log('DEBUG: Item ID:', item.id); // ✅ logs each item's ID

        return (
          <li key={item.id} className="p-4 border rounded shadow bg-white">
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>Status:</strong> {item.status_item}</p>
            <Link
              href={`/item/${item.documentId}`}
              className="text-blue-600 hover:underline"
            >
              View Public Page
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
