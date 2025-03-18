'use client'


import { registerSchema } from '@/app/schema/Register';
import { register } from '@/app/services/auth.Service';
import { RegisterData } from '@/app/types/RegisterData';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaEnvelope, FaGlobeAsia, FaHome, FaLock, FaMapMarkerAlt, FaPhoneAlt, FaRegBuilding, FaUser } from 'react-icons/fa';

import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    modules: [1],
    verified: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate the form data
      registerSchema.parse(formData);
      
      // Call the register service
      const response = await register(formData);
      
      // Show success or error message based on the response
      if (response.status === 'OK') {
        toast.success('Registration successful! Please login to continue.', { autoClose: 3000 , position: "top-right"});
        // Redirect to the login page (optional)
        // router.push('/login');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center px-6 py-4 lg:px-8">
      <div className="flex justify-center">
        <Image src="/tiamed1.svg" alt="Lab Management System" width={80} height={80} />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Username */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-zinc-900 pl-10 focus:ring-indigo-500 mt-6"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="text"
                required
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="city"
                name="city"
                type="text"
                required
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="state"
                name="state"
                type="text"
                required
                placeholder="Enter your state"
                value={formData.state}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaRegBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Zip */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="zip"
                name="zip"
                type="text"
                required
                placeholder="Enter your ZIP code"
                value={formData.zip}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="country"
                name="country"
                type="text"
                required
                placeholder="Enter your country"
                value={formData.country}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaGlobeAsia className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 px-4 text-white font-bold rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-indigo-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
