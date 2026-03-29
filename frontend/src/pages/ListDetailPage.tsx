import React from 'react';
import { useParams } from 'react-router-dom';

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">List #{id}</h1>
    </main>
  );
}
