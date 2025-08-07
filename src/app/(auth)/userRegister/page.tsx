"use client";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import {
  FaArrowRight,
  FaEnvelope,
  FaGlobeAmericas,
  FaHome,
  FaIdCard,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegBuilding,
  FaUser,
  FaUserTie,
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { RegisterData } from "@/app/types/RegisterData";
import { register } from "@/app/services/auth.Service";

// Define validation schema
const registerDataSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must be at most 10 digits")
    .regex(/^[0-9+]+$/, "Phone number can only contain numbers and +"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be at most 100 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be at most 50 characters"),
  zip: z
    .string()
    .min(3, "ZIP code must be at least 3 characters")
    .max(10, "ZIP code must be at most 10 characters"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be at most 50 characters"),
  verified: z.boolean().default(false),
});

const UserRegister = () => {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    verified: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    try {
      // Validate only the fields in the current step
      const stepFields = fieldGroups[step - 1].fields.map((f) => f.name);
      const stepData = Object.fromEntries(
        Object.entries(formData).filter(([key]) => stepFields.includes(key))
      );

      // Create a partial schema for the current step
      const stepSchema = registerDataSchema.pick(
        stepFields.reduce((acc, field) => {
          acc[field as keyof RegisterData] = true;
          return acc;
        }, {} as Record<keyof RegisterData, true>)
      );

      stepSchema.parse(stepData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    try {
      registerDataSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
        // Jump to the first step with errors
        for (let i = 0; i < fieldGroups.length; i++) {
          if (fieldGroups[i].fields.some((field) => newErrors[field.name])) {
            setCurrentStep(i + 1);
            break;
          }
        }
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await register(formData);

      if (response.status === "success") {
        toast.success(
          "Registration successful! Please check your email to verify your account.",
          {
            autoClose: 3000,
            position: "top-center",
            onClose: () => {
              setFormData({
                username: "",
                password: "",
                email: "",
                firstName: "",
                lastName: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                zip: "",
                country: "",
                verified: false,
              });
              setCurrentStep(1);
              window.location.href = "/user-login";
            },
          }
        );
      } else {
        toast.error(
          response.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred during registration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fieldGroups = [
    {
      title: "Account Information",
      fields: [
        {
          id: "username",
          name: "username",
          type: "text",
          placeholder: "Choose a username",
          icon: <FaUser />,
        },
        {
          id: "email",
          name: "email",
          type: "email",
          placeholder: "Your email address",
          icon: <FaEnvelope />,
        },
        {
          id: "password",
          name: "password",
          type: "password",
          placeholder: "Create a password",
          icon: <FaLock />,
        },
      ],
    },
    {
      title: "Personal Details",
      fields: [
        {
          id: "firstName",
          name: "firstName",
          type: "text",
          placeholder: "First name",
          icon: <FaUserTie />,
        },
        {
          id: "lastName",
          name: "lastName",
          type: "text",
          placeholder: "Last name",
          icon: <FaUserTie />,
        },
        {
          id: "phone",
          name: "phone",
          type: "tel",
          placeholder: "Phone number",
          icon: <FaPhoneAlt />,
        },
      ],
    },
    {
      title: "Address Information",
      fields: [
        {
          id: "address",
          name: "address",
          type: "text",
          placeholder: "Street address",
          icon: <FaHome />,
        },
        {
          id: "city",
          name: "city",
          type: "text",
          placeholder: "City",
          icon: <FaMapMarkerAlt />,
        },
        {
          id: "state",
          name: "state",
          type: "text",
          placeholder: "State/Province",
          icon: <FaRegBuilding />,
        },
        {
          id: "zip",
          name: "zip",
          type: "text",
          placeholder: "ZIP/Postal code",
          icon: <FaIdCard />,
        },
        {
          id: "country",
          name: "country",
          type: "text",
          placeholder: "Country",
          icon: <FaGlobeAmericas />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Right Side - Registration Form */}
      <div className="max-w-md mx-auto">
        <div className="lg:hidden mb-8">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-purple-700">
              Diagnostics Platform
            </h1>
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-gray-600">
            Already registered?{" "}
            <Link
              href="/login"
              className="text-Purple underline underline-offset-4"
            >
              Sign in to your account
            </Link>
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step Indicator */}
          <div className="flex justify-between mb-8 px-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center relative">
                {step > 1 && (
                  <div className="absolute h-0.5 bg-gray-200 w-full top-5 -left-1/2 -z-10">
                    <div
                      className={`h-full ${
                        currentStep >= step ? "bg-darkPurple" : "bg-gray-200"
                      } transition-all duration-300`}
                      style={{ width: currentStep >= step ? "100%" : "0%" }}
                    ></div>
                  </div>
                )}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep === step
                      ? "bg-darkPurple text-white shadow-md"
                      : currentStep > step
                      ? "bg-green2 text-white"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {step}
                </div>
                <span className="text-xs mt-2 text-gray-500 font-medium">
                  {fieldGroups[step - 1].title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800 flex items-center">
              <span className="bg-purple-200 text-Purple rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                {currentStep}
              </span>
              {fieldGroups[currentStep - 1].title}
            </h3>

            <div className="space-y-4">
              {fieldGroups[currentStep - 1].fields.map((field) => (
                <motion.div
                  key={field.id}
                  whileHover={{ scale: 1.005 }}
                  className="space-y-1"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      {field.icon}
                    </div>
                    <input
                      id={field.id}
                      name={field.name}
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={
                        formData[field.name as keyof RegisterData] as string
                      }
                      onChange={handleInputChange}
                      className={`block w-full rounded-lg ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      } pl-10 pr-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#4B0082] focus:border-transparent transition-all duration-300 hover:shadow-sm border`}
                    />
                  </div>
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1 pl-2">
                      {errors[field.name]}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 ? (
              <motion.button
                type="button"
                onClick={prevStep}
                whileHover={{ x: -2 }}
                className="px-6 py-3 text-[#4B0082] font-medium rounded-3xl hover:bg-purple-50 transition-all duration-200 flex items-center border border-gray-300 hover:border-purple-200 cursor-pointer"
              >
                <FaArrowRight className="transform rotate-180 mr-2" />
                Back
              </motion.button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                whileHover={{ scale: 1.02 }}
                className="px-6 py-3 bg-darkPurple text-white font-medium rounded-3xl transition-all duration-200 flex items-center shadow-md hover:shadow-lg cursor-pointer"
              >
                Continue
                <FaArrowRight className="ml-2" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                className="px-3 py-3  bg-darkPurple text-white font-medium rounded-3xl transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </motion.button>
            )}
          </div>
        </form>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500 text-center">
            By registering, you agree to our{" "}
            <Link
              href="/terms"
              className="text-[#4B0082] hover:underline font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-[#4B0082] hover:underline font-medium"
            >
              Privacy Policy
            </Link>
            .
            <br />
            Your data is protected with enterprise-grade security.
          </p>
        </div>
      </div>
    </>
  );
};

export default UserRegister;
