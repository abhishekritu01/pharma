import { z } from 'zod';

export const patientSchema = z.object({
    firstName: z
        .string()
        .min(3, { message: "First Name is Mandatory" })
        .max(30, { message: "First Name cannot exceed 30 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "First Name must contain only alphabets",
        }),

    lastName: z
        .string()
        .min(3, { message: "Last Name is Mandatory" })
        .max(20, { message: "Last Name cannot exceed 20 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "Last Name must contain only alphabets",
        }),

    phone: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((num) => Number.isInteger(num), { message: "Mobile number must be an integer" })
        .refine((num) => num >= 1000000000 && num <= 9999999999, {
            message: "Mobile No. should be exactly 10 digits long.",
        }),

    email: z
        .string()
        .min(1, { message: "Email is mandatory" })
        .email({ message: "Enter a valid email address" }),


    city: z
        .string()
        .min(3, { message: "City is Mandatory" })
        .max(50, { message: "City cannot exceed 50 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "City must contain only alphabets",
        }),


    state: z
        .string()
        .min(3, { message: "State is Mandatory" })
        .max(30, { message: "State cannot exceed 30 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "State must contain only alphabets",
        }),

    zip: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((num) => Number.isInteger(num), { message: "ZIP Code must be an integer" })
        .refine((num) => num >= 100000 && num <= 999999, {
            message: "ZIP Code should be exactly 6 digits long.",
        }),


    bloodGroup: z
        .string()
        .min(2, { message: "Blood Group is mandatory" })
        .max(5, { message: "Blood Group cannot exceed 5 characters." })
        .transform((val) => val.toUpperCase())
        .refine((val) => /^[ABO]{1,2}[+-]$/.test(val), {
            message: "Blood Group must be a valid type (e.g., A+, O-, AB+)",
        }),


    dateOfBirth: z.coerce.date({ required_error: "DOB is required" }),
    gender: z.string().nonempty({ message: 'Gender is Mandatory' }),
});



