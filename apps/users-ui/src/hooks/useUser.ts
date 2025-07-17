import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from '../store/useAuthStore';
import { isProtected } from '../utils/isProtected';



const fetchUser = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : {};
  const response = await axiosInstance.get(`/api/logged-in-user`,config);
  if (!response?.data?.user) {
    throw new Error("User not found");
  }
  return response.data.user;
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
    onSuccess: () => {
      setLoggedIn(true);
    },
    onError: () => {
      setLoggedIn(false); 
    },
  });
  return { user:user as any, isLoading, isError };
};

export default useUser;