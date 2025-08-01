import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'sonner';



// Fetch user data from API
const fetchSeller = async () => {
  const response = await axiosInstance.get(`/api/logged-in-seller`);
  return response.data.seller;
};

const logoutSeller = async () => {
  const response = await axiosInstance.get(`/api/logout-seller`);
  return response.data;
};

const useSeller = () => {
  const queryClient = useQueryClient();
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['seller'],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,   
    retry: 1,
  });

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutSeller,
    onSuccess: () => {

      queryClient.removeQueries({ queryKey: ['seller'] });
      toast.success("Logged out successfully!");
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      toast.error(error.message || "Logout failed. Please try again.");
    },
  });

  return { seller, isLoading, isError, refetch, logout, isLoggingOut };
};

export default useSeller;