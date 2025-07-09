'use client'
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios, { AxiosError } from "axios"
import { countries } from 'apps/sellers-ui/src/constants/Countries';
import CreateShop from 'apps/sellers-ui/src/shared/components/CreateShop';
import Image from 'next/image';



const Signup = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [timer, setTimer] = useState(60);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [sellerData, setSellerData] = useState<FormData | null>(null);
    const [sellerId, setSellerId] = useState("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { register, handleSubmit, formState: { errors } } = useForm<any>();

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1
            })

        }, 1000);
    }

    const signupMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`, data);
            return response.data;
        },
        onSuccess: (_, formData) => {
            setSellerData(formData);
            setShowOtp(true);
            setCanResend(false);
            setTimer(60);
            startResendTimer();
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if(!sellerData) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`, { ...sellerData, otp: otp.join("") });
            return response.data;
        },
        onSuccess: (data) => {
            setSellerId(data?.seller?.id);
            setActiveStep(2);
        }
    })

    const onSubmit = (data: any) => {
        signupMutation.mutate(data);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        }
    };


    const resendOTP = () => {
        if (sellerData) {
            signupMutation.mutate(sellerData);
        }
    }

    const connectStripe = async () => {
        try {
            
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`, { sellerId });

            if (response.data.url) {
                window.location.href = response.data.url;
            }

        } catch (error) {
            console.error("Stripe Connection Error: ", error)
        }
    }

    return (
        <div className="w-full max-md:px-10 flex flex-col items-center pt-10 min-h-screen">
            {/* Stepper */}
            <div className='relative flex items-center justify-between w-full md:w-[50%] mb-8'>
                <div className='absolute top=[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10' />
                {[1, 2, 3].map((step) => (
                    <div key={step}>
                        <div className={`w-10 h-10 mt-5 flex items-center justify-center rounded-full text-white font-bold ${step <= activeStep ? "bg-blue-600" : "bg-gray-300"}`}>
                            <p>{step}</p>
                        </div>
                        <span className={`ml-[-15px]`}>{step === 1 ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"}</span>
                    </div>
                ))}
            </div>

            
            <div className='w-3/4 md:w-[480px] p-8 bg-white shadow rounded-lg border border-gray-200'>
                {activeStep === 1 && (
                    <>
                        {!showOtp ? (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <h3 className="text-4xl font-Poppins font-semibold text-black text-center">
                                    Create Seller Account
                                </h3>

                                <label className='block text-gray-700 mb-1' htmlFor='name'>Name</label>
                                <input
                                    type="text"
                                    id='name'
                                    placeholder='Xyz Efc'
                                    className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                    {...register("name", {
                                        required: "Name is required",
                                        
                                        validate:{
                                            hasSurname: (value) =>{
                                                const trimmed = value.trim();
                                                const words = trimmed.split(/\s+/);
                                                if (words.length < 2) return "Please enter both first and last name";

                                                const onlyLetters = trimmed.replace(/\s/g, '');
                                                if (onlyLetters.length < 5) return "Name must be at least 5 letters";

                                                return true;
                                            }   
                                        }
                                    })}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm">
                                        {String(errors.name?.message)}
                                    </p>
                                )}


                                <label className='block text-gray-700 mb-1' htmlFor='email'>Email</label>
                                <input
                                    type="email"
                                    id='email'
                                    placeholder='xyzabc@something.com'
                                    className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/,
                                            message: "Invalid email address",
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm">
                                        {String(errors.email.message)}
                                    </p>
                                )}

                                <label className='block text-gray-700 mb-1' htmlFor='phone'>Phone Number</label>
                                <input
                                    type="tel"
                                    id='phone'
                                    placeholder='Enter your valid Phone Number'
                                    className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                    {...register("phone_number", {
                                        required: "Phone Number is required",
                                        pattern: {
                                            value: /^\+?[1-9]\d{1,14}$/,
                                            message: "Invalid phone number format",
                                        },
                                        minLength: {
                                            value: 10,
                                            message: "Phone number must be at least 10 digits",
                                        },
                                        maxLength: {
                                            value: 15,
                                            message: "Phone number cannot exceed 15 digits"
                                        }
                                    })}
                                />
                                {errors.phone_number && (
                                    <p className="text-red-500 text-sm">
                                        {String(errors.phone_number.message)}
                                    </p>
                                )}

                                <label className='block text-gray-700 mb-1' htmlFor='country'>Country</label>
                                <select
                                    id='country'
                                    className='w-full p-3 border border-gray-300 outline-0 rounded-[4px] '
                                    {...register("country", { required: "Country is Required" })}
                                >
                                    <option value="">Select your country</option>
                                    {countries.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.country && (
                                    <p className="text-red-500 text-sm">
                                        {String(errors.country.message)}
                                    </p>
                                )}

                                <label className='block text-gray-700 mb-1'>Password</label>
                                <div className="relative">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        id='password'
                                        placeholder='Min 6 Characters'
                                        className='w-full p-2 border border-gray-300 outline-0 !rounded mb-1'
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters",
                                            },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        className='absolute inset-y-0 right-3 flex items-center text-gray-400'>
                                        {passwordVisible ? <Eye /> : <EyeOff />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm">
                                        {String(errors.password.message)}
                                    </p>
                                )}
                                

                                <button
                                    type="submit"
                                    disabled={signupMutation.isPending}
                                    className='w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg flex items-center justify-center'
                                >
                                    {signupMutation.isPending ? "Signing up ..." : "Sign Up"}
                                </button>
                                {signupMutation.isError &&
                                    signupMutation.error instanceof AxiosError && (
                                        <p className='text-red-500 text-sm mt-2'>
                                            {signupMutation.error.message}
                                        </p>
                                    )}

                                <p className='font-medium pt-3 text-center'>
                                    Already have an account?{"  "}
                                    <Link className="text-blue-500 font-medium" href={"/login"}>
                                        Login
                                    </Link>
                                </p>
                            </form>
                        ) : (
                            <div>
                                <h3 className='text-xl font-semibold text-center mb-4'>
                                    Enter OTP
                                </h3>
                                <div className='flex justify-center gap-6'>
                                    {otp?.map((digit, index) => (
                                        <input
                                            type="text"
                                            key={index}
                                            ref={(el) => {
                                                if (el) { inputRefs.current[index] = el }
                                            }}
                                            maxLength={1}
                                            className='w-12 h-12 text-center border border-gray-300 outline-none !rounded focus:ring-2 focus:ring-blue-200'
                                            value={digit}
                                            onChange={(e) =>  handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        />
                                    ))}
                                </div>

                                <button
                                    className='w-full mt-4 tex-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'
                                    disabled={verifyOtpMutation.isPending}
                                    onClick={() => verifyOtpMutation.mutate()}
                                >
                                    {verifyOtpMutation.isPending ? "Verifying ..." : "Verify OTP"}
                                </button>

                                <p className='text-center text-sm mt-4'>
                                    {canResend ? (
                                        <button
                                            onClick={resendOTP}
                                            className='text-blue-500 cursor-pointer'
                                        >   
                                            Resend OTP
                                        </button>
                                    ) : (
                                        `Resend OTP in ${timer}s`
                                    )}
                                </p>
                                {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                                    <p className='text-error'>
                                        {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeStep === 2 && (
                    <CreateShop sellerId={sellerId} setActiveStep={setActiveStep}/>
                )}

                {activeStep === 3 && (
                    <div className='text-center'>
                        <h3 className='text-2xl font-semibold'>Withdraw Method</h3>
                        <br />
                        <button
                            className='w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg'
                            onClick={connectStripe}
                        >
                            Connect Stripe
                            <Image src="/stripe.svg" alt="stripe" width={20} height={20} className='rounded-md'/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Signup