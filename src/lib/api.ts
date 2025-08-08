// src/lib/api.ts
import axios from 'axios';

// Update this interface to match your Strapi fields
export interface ItemPayload {
  name: string;
  description: string;
  status_item: 'found' | 'missing';
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  location?: string;
  date?: string;
}

// Message interface if you're allowing "found messages"
export interface MessagePayload {
  item: string; // This would be the item ID
  message: string;
}

// Base API URL from your .env file
const API = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api`;

// Fetch all items with their related fields populated
export const fetchItems = async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return axios.get(`${API}/items?filters[user][id][$eq]=${user.id}&populate=*`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Add a new item (requires auth token if protected)
export const addItem = async (data: any, p0: string | undefined) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return axios.post(`${API}/items`, {
    data: {
      ...data,
      user: user.id, // 👈 attach user ID to the item
    },
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get a specific item by ID
// export const fetchItemByDocumentId = (documentId: string) => {
//   console.log('fetchItemByDocumentId:', documentId);
//   return axios.get(`${API}/items/${documentId}?populate=*`);
// };

export const fetchItemByDocumentId = (documentId: string) => {
  console.log('fetchItemByDocumentId:', documentId);
  return axios.get(`${API}/items/${documentId}`);
};

// Submit a "found" message linked to an item
export const submitFoundMessage = (data: MessagePayload, token?: string) =>
  axios.post(`${API}/messages`, { data }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
