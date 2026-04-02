/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Auth disabled for now — all routes are public
  return <>{children}</>;
}