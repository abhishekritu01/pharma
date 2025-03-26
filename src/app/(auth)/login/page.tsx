// "use client";

// import React, { useState } from "react";
// import { FaArrowLeft, FaSignInAlt, FaUserPlus } from "react-icons/fa";
// import Link from "next/link";
// import Login from "../components/Login";
// import Register from "../components/Register";
// import Image from "next/image";
// import Button from "@/app/components/common/Button";

// const Page: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<"login" | "register">("login");

//   const handleTabSwitch = (tab: "login" | "register") => {
//     setActiveTab(tab);
//   };

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);

//   return (
//     <div className="h-screen flex">
//       {/* Left Panel */}
//       <div className="w-full sm:w-1/3 bg-white flex flex-col justify-center items-center p-8">
//         <Image src="/tiamed2.svg" alt="Lab Management System" width={200} height={200} />
//         <h1 className="text-3xl font-bold text-primary mb-4">Welcome to Tiamed</h1>
//         <p className="text-primary text-center mb-6">
//           Manage your laboratory seamlessly with our powerful system.
//         </p>
//         <Link href="/" passHref>
//           <button className="flex items-center mt-6 text-sm font-semibold text-primary hover:text-secondary transition-all duration-300">
//             <FaArrowLeft className="mr-2" /> Back to Home
//           </button>
//         </Link>
//       </div>

//       {/* Right Panel with Updated Background */}
//       <div className="flex-1 relative isolate bg-white ">
//         <div
//           aria-hidden="true"
//           className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
//         >
//           <div
//             style={{
//               clipPath:
//                 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//             }}
//             className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//           />
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex justify-center border-b border-gray-200 bg-gray-50 shadow-sm">
//           <button
//             className={`flex items-center justify-center w-1/2 py-4 text-lg font-semibold transition-all ${
//               activeTab === 'login'
//                 ? 'text-primary border-b-2 border-primary bg-white hover:border-primary'
//                 : 'text-tertiary hover:text-secondary'
//             }`}
//             onClick={() => handleTabSwitch('login')}
//           >
//             <FaSignInAlt className="mr-2" />
//             Log In
//           </button>
//           <button
//             className={`flex items-center justify-center w-1/2 py-4 text-lg font-semibold transition-all ${
//               activeTab === 'register'
//                 ? 'text-primary border-b-2 border-primary bg-white'
//                 : 'text-tertiary hover:text-secondary'
//             }`}
//             onClick={() => handleTabSwitch('register')}
//           >
//             <FaUserPlus className="mr-2" />
//             Register
//           </button>
//         </div>

//         {/* Login or Register Content */}
//         <div className="sm:p-8 px-4 py-6">
//           {activeTab === 'login' ? <Login /> : <Register />}
//         </div>
//       </div>
//     </div>

//   );
// };

// export default Page;

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/app/components/common/Button";
import { login } from "@/app/services/auth.Service";
import { toast } from "react-toastify";

const Page: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
      router.push("/dashboard"); // Redirect to dashboard
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-darkPurple">
      <div className="w-[30%] flex flex-col items-center justify-center text-white px-10 space-y-10">
        <div className="mt-10 flex space-x-4">
          <Image
            src="/TiamedsIcon1.svg"
            alt="Company Logo"
            width={80}
            height={40}
          />
          <Image
            src="/TiamedsLogo1.svg"
            alt="Company Logo"
            width={150}
            height={40}
          />
        </div>

        <div>
        <Image
            src="/TiamedsLogo2.svg"
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
