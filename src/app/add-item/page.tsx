'use client';
import ItemForm from '@/components/ItemForm';
import useAuthRedirect from '@/hooks/useAuthRedirect';

export default function AddItemPage() {
  useAuthRedirect(); // 🔐 protect this page

  return <ItemForm />;
}
