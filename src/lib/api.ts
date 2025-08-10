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

type SubmitParams = {
  documentId: string;          // string from URL
  message: string;
  sender_name?: string;
  sender_email?: string;
  sender_phone?: string;
};

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
export const addItem = async (data: unknown, token: string | undefined) => {
  const authToken = token ?? localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return axios.post(`${API}/items`, {
    data: {
      ...(data as object),
      user: user.id, // 👈 attach user ID to the item
    },
  }, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// Get a specific item by ID
// export const fetchItemByDocumentId = (documentId: string) => {
//   console.log('fetchItemByDocumentId:', documentId);
//   return axios.get(`${API}/items/${documentId}?populate=*`);
// };

// Look up an item by its documentId (string)
export const fetchItemByDocumentId = (documentId: string) => {
  console.log('fetchItemByDocumentId:', documentId);
  return axios.get(`${API}/items/${documentId}`);
};

// Submit a "found" message linked to an item
// export const submitFoundMessageByDocumentId = (data: MessagePayload) => {
//   console.log('submitFoundMessageByDocumentId:', data);
//   return axios.post(`${API}/messages`, { data });
// };

// Resolve documentId → numeric item.id, then POST message
// export const submitFoundMessageByDocumentId = async ({
//   documentId,
//   message,
//   sender_name,
//   sender_email,
//   sender_phone,
// }: SubmitParams) => {
//   console.log('📩 submitFoundMessageByDocumentId called with:', {
//     documentId,
//     message,
//     sender_name,
//     sender_email,
//     sender_phone
//   });  

//   console.log(`🔍 Fetching item for documentId: ${documentId}`);
//   const { data } = await fetchItemByDocumentId(documentId);
//   console.log('📦 Raw item fetch response:', data);

//   const item = data?.data?.[0];
//   const itemId: number | undefined = item?.id;

//   console.log(`📦 Item data from fetchItemByDocumentId:`, documentId);

//   if (!documentId) {
//     console.error('❌ No item found for documentId:', documentId);
//     throw new Error('Item not found for the provided documentId.');
//   }

//   // Step 2: Prepare payload
//   const payload = {
//     data: {
//       message,
//       sender_name,
//       sender_email,
//       sender_phone
//     },
//   };
//   console.log('📤 Sending POST to /messages with payload:', payload);

//   // Step 3: Send to Strapi
//   const response = await axios.post(`${API}/messages`, payload);
//   console.log('✅ Message submission response:', response.data);

//   return response;
// };

export const submitFoundMessageByDocumentId = async ({
  documentId,
  message,
  sender_name,
  sender_email,
  sender_phone,
}: SubmitParams) => {
  console.log('📩 [submitFoundMessageByDocumentId] called with:', {
    documentId,
    message,
    sender_name,
    sender_email,
    sender_phone,
  });

  if (!documentId || !message.trim()) {
    console.error('❌ [submitFoundMessageByDocumentId] Missing required fields:', {
      documentIdPresent: !!documentId,
      messagePresent: !!message?.trim(),
    });
    throw new Error('documentId and message are required.');
  }

  const url = `${API}/messages/by-document-id`;
  console.log(`🌐 [submitFoundMessageByDocumentId] POST → ${url}`);

  const payload = {
    documentId,
    message,
    sender_name,
    sender_email,
    sender_phone,
  };

  console.log('📤 [submitFoundMessageByDocumentId] Payload:', payload);

  try {
    const res = await axios.post(url, payload);
    console.log('✅ [submitFoundMessageByDocumentId] Response status:', res.status);
    console.log('📦 [submitFoundMessageByDocumentId] Response data:', res.data);
    return res.data; // { data: ... } from controller
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ [submitFoundMessageByDocumentId] Request failed:', {
        message: err.message,
      });
    } else if (typeof err === 'object' && err !== null && 'toString' in err) {
      console.error('❌ [submitFoundMessageByDocumentId] Request failed:', {
        message: String(err),
      });
    } else {
      console.error('❌ [submitFoundMessageByDocumentId] Unknown error:', err);
    }
    throw err;
  }
};
