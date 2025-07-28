import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';



const fetchUser = async () => {
  const response = await axiosInstance.get(`/api/logged-in-user`);
  return response.data.user;
 
};

const useUser = () => {
  const { setLoggedIn , isLoggedIn } = useAuthStore();

  const {
    data: user,
    isPending,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    enabled: isLoggedIn,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 1;
    },
  });
  useEffect(() => {
    if (isSuccess) {
      setLoggedIn(true);
    }
    if (isError) {
      setLoggedIn(false);
    }
  }, [isSuccess, isError, setLoggedIn]);
  return { user:user as any, isLoading :isPending, isError };
};

export default useUser;