import { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '../pages/LoginPage';
interface ProtectedRouteProps {
  children: ReactNode;
}
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  console.log(user)
  const isLoading = useAuthStore((s) => s.isLoading);
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <LoginPage />;
  return <>{children}</>;
}