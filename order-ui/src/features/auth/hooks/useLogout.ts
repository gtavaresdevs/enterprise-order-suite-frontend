import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logoutRequest } from '../services/auth.service';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      // Wipe the react-query cache completely to prevent stale data leaks
      queryClient.clear();
      
      // Clear local storage / session state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      // Or any other relevant tokens/data
      
      // Redirect strictly to login
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if API call fails, we still want to force the user out on the client side
      queryClient.clear();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      navigate('/login', { replace: true });
    }
  });
}
