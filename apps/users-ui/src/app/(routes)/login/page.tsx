'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import GoogleButton from 'apps/users-ui/src/shared/components/GoogleButton';
import axiosInstance from 'apps/users-ui/src/utils/axiosInstance';
import { useAuthStore } from 'apps/users-ui/src/store/useAuthStore';




type FormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setLoggedIn } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
        const response = await axiosInstance.post('/api/login-user', data, {
            withCredentials: true,
        });
        return response.data;
    },
    onSuccess: async() => {
        setLoggedIn(true);
        setServerError(null);
        await queryClient.invalidateQueries({ queryKey: ['user'] });
        router.push('/');
    },
    onError: (error: AxiosError) => {
        const errorMessage =
            (error.response?.data as { message?: string })?.message ||
            'Invalid credentials';
        setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: FormData) => {
        loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
        <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
            Login
        </h1>
        <p className="text-center text-lg font-medium py-3 text-[#00000099]">
            Home . Login
        </p>
        <div className="w-full flex justify-center">
            <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
                <h3 className="text-3xl font-semibold text-center mb-2">
                    Login to E-Comm
                </h3>
                <p className='text-center text-gray-400 mb-3'>
                    Dont have an Account?{" "}
                    <Link href={"/signup"} className="text-blue-500">
                        Sign Up
                    </Link>
                </p>

                <GoogleButton/>
                <div className="flex items-center my-5 text-gray-400 text-sm">
                    <div className="flex-1 border-t border-gray-300" />
                        <span className="px-3">or Sign in with Email</span>
                    <div className="flex-1 border-t border-gray-300" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="email" className="block text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'Invalid email address',
                            },
                        })}
                    />
                    {errors.email && (
                    <p className="text-red-500 text-sm text-center">
                        {String(errors.email.message)}
                    </p>
                    )}
                    <label htmlFor="password" className="block text-gray-700 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={passwordVisible ? 'text' : 'password'}
                            id="password"
                            placeholder="Enter your Password"
                            className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                        >
                            {passwordVisible ? <Eye /> : <EyeOff />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm text-center">
                            {String(errors.password.message)}
                        </p>
                    )}
                    <div className="flex justify-between items-center my-4">
                        <label
                            htmlFor="rememberMe"
                            className="flex items-center text-gray-600"
                        >
                            <input
                            type="checkbox"
                            className="mr-2"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            />
                            Remember Me
                        </label>
                        <Link href="/forgot-password" className="text-blue-500 text-sm">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg flex items-center justify-center"
                        >
                        {loginMutation.isPending ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            'Login'
                        )}
                    </button>
                    {serverError && <p className="text-error">{serverError}</p>}
                </form>
                <p className="text-center text-gray-500 my-4">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-blue-500">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;