import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isAuthenticated } from '../api/AuthContext';

const mockNavigate = vi.fn();

vi.mock('../api/AuthContext', () => ({
  isAuthenticated: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode, to: string }) => (
    <a href={to}>{children}</a>
  )
}));

describe('Header', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(isAuthenticated).mockClear();
  });

  it('renders without navigation links when not authenticated', () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);
    render(
        <Header />
    );

    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders navigation links and logout button when authenticated', () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    render(
        <Header />
    );

    expect(screen.queryByText('Upload')).toBeInTheDocument();
    expect(screen.queryByText('Search')).toBeInTheDocument();
    expect(screen.queryByText('Analyse')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).toBeInTheDocument();
  });

}); 