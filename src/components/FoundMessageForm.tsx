// src/components/FoundMessageForm.tsx
'use client';

import React, { useState } from 'react';
import { submitFoundMessageByDocumentId } from '@/lib/api';
import {
  Mail,
  User,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

type FoundMessageFormProps = {
  documentId: string;
};

const MAX_LEN = 500;

// very light client-side check: allow +, digits, spaces, (), -
const PHONE_REGEX = /^[+\d\s()\-]{7,20}$/;

export default function FoundMessageForm({ documentId }: FoundMessageFormProps) {
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');            // NEW
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState(''); // honeypot

  const emailValid = !senderEmail || /^\S+@\S+\.\S+$/.test(senderEmail);
  const phoneValid = !senderPhone || PHONE_REGEX.test(senderPhone); // optional, but if present must match regex
  const messageValid = message.trim().length > 0 && message.length <= MAX_LEN;

  const canSubmit =
    status !== 'loading' && emailValid && phoneValid && messageValid && !website;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('loading');
    setError(null);

    try {
      await submitFoundMessageByDocumentId({
        documentId,
        message: message.trim(),
        sender_name: senderName.trim() || undefined,
        sender_email: senderEmail.trim() || undefined,
        sender_phone: senderPhone.trim() || undefined,           // NEW
      });
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to send message. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="rounded-2xl border bg-white/60 dark:bg-gray-900/60 backdrop-blur p-6 shadow-md inline-block">
          <div className="flex items-start gap-3 justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold">Message sent</h2>
              <p className="text-sm text-gray-500 mt-1">
                Thank you! Your message has been sent to the item owner.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-2xl border bg-white/60 dark:bg-gray-900/60 backdrop-blur p-6 shadow-md">
        <h1 className="text-xl font-semibold">Contact the Owner</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share a quick note so the owner can reach you back.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Honeypot */}
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="senderName" className="text-sm font-medium">
              Your Name <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="senderName"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g., Juan D."
                className="w-full rounded-xl border px-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-950"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="senderEmail" className="text-sm font-medium">
              Your Email <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="senderEmail"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-10 py-2.5 outline-none focus:ring-2 dark:bg-gray-950
                  ${emailValid ? 'focus:ring-indigo-500' : 'border-red-500 focus:ring-red-500'}`}
              />
            </div>
            {!emailValid && (
              <p className="text-xs text-red-600">Please enter a valid email.</p>
            )}
          </div>

          {/* Phone (NEW) */}
          <div className="space-y-2">
            <label htmlFor="senderPhone" className="text-sm font-medium">
              Your Phone <span className="text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="senderPhone"
                type="tel"
                inputMode="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="+63 927 575 0898 or 0412 345 678"
                className={`w-full rounded-xl border px-10 py-2.5 outline-none focus:ring-2 dark:bg-gray-950
                  ${phoneValid ? 'focus:ring-indigo-500' : 'border-red-500 focus:ring-red-500'}`}
              />
            </div>
            {!phoneValid && (
              <p className="text-xs text-red-600">
                Please enter a valid phone number (digits, +, (), - and spaces allowed).
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Your Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_LEN}
                rows={5}
                required
                className={`w-full rounded-xl border pl-10 pr-4 py-3 outline-none resize-y focus:ring-2 dark:bg-gray-950
                  ${messageValid ? 'focus:ring-indigo-500' : 'border-red-500 focus:ring-red-500'}`}
                placeholder="Where you found the item, when, and how to reach you."
              />
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {message.length}/{MAX_LEN}
              </div>
            </div>
            {!messageValid && (
              <p className="text-xs text-red-600">
                Message is required and must be {MAX_LEN} characters or less.
              </p>
            )}
          </div>

          {/* Errors */}
          {status === 'error' && error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </div>

          <p className="text-[11px] text-gray-400">
            By sending, you agree not to include sensitive information.
          </p>
        </form>
      </div>
    </div>
  );
}
