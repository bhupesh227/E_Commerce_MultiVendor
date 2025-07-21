import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { isProtected, isPublic } from '../utils/isProtected';



const fetchUser = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected :isPublic;
  try {
    const response = await axiosInstance.get(`/api/logged-in-user`, config);
    return response.data?.user || null;
  } catch (error) {
    return null;
  }
};

const useUser = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 5,   
    retry: false,
    // @ts-ignore
    onSuccess: (userData) => {
      setLoggedIn(!!userData);
    },
    onError: () => {
      setLoggedIn(false); 
    },
  });
  return { user:user as any, isLoading, isError };
};

export default useUser;