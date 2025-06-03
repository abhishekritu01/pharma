"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/app/services/auth.Service";
import { toast } from "react-toastify";

const Page: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Username and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ username, password });
      document.cookie = `token=${response.token}; path=/;`;
      localStorage.setItem("user", JSON.stringify(response?.data));

      toast.success("Logged in successfully!", { autoClose: 1000 });
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Login failed. Please try again.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    
    
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-darkPurple">
      <div className="w-[30%] flex flex-col items-center justify-center text-white px-10 space-y-10">
        <div className="mt-10 flex space-x-4">
          <Image
            src="/tiamedsIcon1.svg"
            alt="Company Logo"
            width={80}
            height={40}
          />
          <Image
            src="/tiamedsLogo1.svg"
            alt="Company Logo"
            width={150}
            height={40}
          />
        </div>

        <div>
        <Image
            src="/tiamedsLogo2.svg"
            alt="Company Logo"
            width={280}
            height={40}
          />
        </div>
      </div>

      <div className="w-[70%] flex items-center justify-center bg-white rounded-l-[2rem] shadow-lg">
        <div className="w-96 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Login</h2>

          <div className="mt-5 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              User Name
            </label>
            <input
              type="text"
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-900"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="password123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* <div className="flex items-center justify-between mt-4">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <a href="#" className="text-sm text-purple-900 hover:underline">
              Forgot Password?
            </a>
          </div> */}

          <div>
            <button
              className={`w-96 bg-darkPurple text-white px-4 py-2 rounded-3xl cursor-pointer ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
