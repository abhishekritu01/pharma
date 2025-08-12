"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/app/services/auth.Service";
import { toast } from "react-toastify";
// import { FaClinicMedical } from "react-icons/fa";
import UserRegister from "../userRegister/page";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Page: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegister, ] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // stop navigation
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // hide after 3 seconds
  };

  return (
    <div className="flex h-screen bg-darkPurple">
      <div className="w-[30%] flex flex-col items-center justify-center text-white px-10 space-y-10">
        <div className="mt-10 flex space-x-4">
          <Image
            src="/TiamedsIconOne.svg"
            alt="Company Logo"
            width={80}
            height={40}
          />
          <Image
            src="/TiaMedsLogoOne.svg"
            alt="Company Logo"
            width={150}
            height={40}
          />
        </div>

        <div>
          <Image
            src="/TiaMedsLogoTwo.svg"
            alt="Company Logo"
            width={280}
            height={40}
          />
        </div>
      </div>

      <div className="w-[70%] flex items-center justify-center bg-white rounded-l-[2rem] shadow-lg">
        <div className="w-96 space-y-6">
          {!showRegister ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900">Login</h2>

              <div className="mt-5 space-y-2">
                <label className="block text-sm font-medium text-gray">
                  User Name
                </label>
                <input
                  type="text"
                  placeholder="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4B0082]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* <div className="mt-5 space-y-2 relative">
                <label className="block text-sm font-medium text-gray">
                  Password
                </label>
                <input
                  type="text"
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4B0082]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </button>
              </div> */}

              <div className="mt-5 space-y-2">
                <label className="block text-sm font-medium text-gray">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // ✅ use password type by default
                    placeholder="Enter password"
                    className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#4B0082]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                {/* <label className="flex items-center text-sm text-gray">
                  <input
                    type="checkbox"
                    className="mr-2 cursor-pointer"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  Remember me
                </label> */}
                <a
                  href="#"
                  onClick={handleClick}
                  className="text-sm text-darkPurple hover:underline"
                >
                  Forgot Password?
                </a>

                {showToast && (
                  <div className="fixed top-5 right-5 bg-gray-700 text-white px-4 py-2 rounded shadow-lg text-sm">
                    Feature coming soon 🚀
                  </div>
                )}
              </div>

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
              {/* <div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500">
                      New to our platform?
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="group w-full flex justify-center items-center px-4 py-2 rounded-3xl cursor-pointer border border-gray-300 hover:bg-[#4B0082] hover:text-white transition"
                    onClick={() => setShowRegister(true)}
                  >
                    <FaClinicMedical className="mr-2 text-Purple group-hover:text-white transition" />
                    Register Pharmacy
                  </button>
                </div>
              </div> */}
            </>
          ) : (
            <UserRegister />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
