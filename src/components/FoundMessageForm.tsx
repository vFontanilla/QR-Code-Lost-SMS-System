// src/components/FoundMessageForm.tsx
import React, { useState, FormEvent } from 'react';
import { submitFoundMessage } from '@/lib/api';

type FoundMessageFormProps = {
  itemId: string;
};

export default function FoundMessageForm({ itemId }: FoundMessageFormProps) {
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitFoundMessage({ item: itemId, message });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };

  return submitted ? (
    <p>Thank you! Your message has been sent to the item owner.</p>
  ) : (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Your Message:</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      <button type="submit">Send Message</button>
    </form>
  );
}
