import React from 'react';
import { useParams } from 'react-router-dom';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Book #{id}</h1>
    </main>
  );
}
