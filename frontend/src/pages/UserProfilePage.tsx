import React from 'react';
import { useParams } from 'react-router-dom';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">User #{id}</h1>
    </main>
  );
}
