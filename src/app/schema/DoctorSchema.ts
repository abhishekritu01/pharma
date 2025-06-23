import { z } from 'zod';

export const doctorSchema = z.object({
    doctorName: z
        .string()
        .min(3, { message: "Name is Mandatory" })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "Name must contain only alphabets",
        }),

    doctorSpeciality: z
        .string()
        .min(3, { message: "Speciality is Mandatory" })
        .max(50, { message: "Speciality cannot exceed 50 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "Speciality must contain only alphabets",
        }),

    doctorMobile: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((num) => Number.isInteger(num), { message: "Mobile number must be an integer" })
        .refine((num) => num >= 1000000000 && num <= 9999999999, {
            message: "Mobile No. should be exactly 10 digits long.",
        }),

    // doctorEmail: z
    //     .string()
    //     .min(1, { message: "Email is mandatory" })
    //     .email({ message: "Enter a valid email address" }),


    doctorQualification: z
        .string()
        .min(3, { message: "Qualification is Mandatory" })
        .max(50, { message: "Qualification cannot exceed 50 characters." })
        .refine((val) => /^[A-Za-z\s]+$/.test(val), {
            message: "Qualification must contain only alphabets",
        }),


});



