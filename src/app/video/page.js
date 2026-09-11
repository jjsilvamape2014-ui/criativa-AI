'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import VideoGenerator from '@/components/VideoGenerator';
import { clearAuthTokenCookie } from '@/lib/auth-cookie';

export default function VideoPage() {
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      clearAuthTokenCookie();
      window.location.href = '/login';
    }
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pt-40 pb-16">
        <VideoGenerator />
      </main>
    </>
  );
}