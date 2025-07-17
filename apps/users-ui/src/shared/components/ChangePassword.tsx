import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import axiosInstance from '../../utils/axiosInstance';
import { Eye, EyeOff } from 'lucide-react';

const ChangePassword = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    setError("");
    setMessage("");
    try {
      await axiosInstance.post("/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data?.confirmPassword,
      });

      setMessage("Password updated successfully!");
      reset();
    } catch (error: any) {
      setError(error?.response?.data?.message);
    }
  };
  
  return (
    <div className='max-w-md mx-auto space-y-6'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <label className='block mb-1 text-sm font-medium text-gray-700'>
            Current Password
          </label>
          <input
            type="password"
            placeholder='Enter your current password'
            className='form-input'
            {...register("currentPassword", {
              required: "Current Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters long"
              }
            })}
          />
          {errors.currentPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.currentPassword.message)}
            </p>
          )}
        </div>

        <div>
          <label className='block mb-1 text-sm font-medium text-gray-700'>
            New Password
          </label>
          <div className='relative'>
            <input
              type={passwordVisible ? 'text' : 'password'}
              {...register('newPassword', {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Must be at least 8 characters",
                },
                validate: {
                  hasLower: (value) =>
                    /[a-z]/.test(value) || "Must include a lowwercase letter",
                  hasUpper: (value) =>
                    /[A-Z]/.test(value) || "Must include an uppercase letter",
                  hasNumber: (value) =>
                    /\d/.test(value) || "Must include a number",
                  hasSpecial: (value) =>
                    /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Must include a special character",

                },
              })}
              className='form-input'
              placeholder='Enter New Password'
            />
            <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
                {passwordVisible ? <Eye /> : <EyeOff />}
            </button>
          </div>
          
          {errors.newPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.newPassword.message)}
            </p>
          )}
        </div>

        <div>
          <label className='block mb-1 text-sm font-medium text-gray-700'>
            Confirm Password
          </label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: "Confirm your New Password",
              validate: (value) =>
                value === watch("newPassword") || "Passwords do not match",
            })}
            className='form-input'
            placeholder='Re-enter New Password'
          />
          {errors.confirmPassword?.message && (
            <p className='text-red-500 text-xs mt-1'>
              {String(errors.confirmPassword.message)}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full mt-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-700'
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
      {error && (<p className='text-red-500 text-center text-sm'>{error}</p>)}
      {message && (
        <p className='text-green-500 text-center text-sm'>{message}</p>
      )}
    </div>
  )
}

export default ChangePassword