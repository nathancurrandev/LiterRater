import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function AppHeader() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      navigate(`/books?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/books');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-primary shrink-0">
          LiterRater
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/books">Books</Link>
          </Button>
          {currentUser && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/feed">Feed</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/diary">Diary</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-2"
          role="search"
        >
          <Input
            type="search"
            placeholder="Search books…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search books"
            className="max-w-sm"
          />
        </form>

        {/* Auth section */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser === null ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">{currentUser.username}</span>
              <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
