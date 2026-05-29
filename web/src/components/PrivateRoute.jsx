import React from 'react';
import { RequireAuth } from './routing/RouteGuards';

export default function PrivateRoute({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
