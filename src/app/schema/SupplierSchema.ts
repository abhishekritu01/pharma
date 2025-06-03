import { z } from 'zod';

export const supplierSchema = z.object({
  supplierName: z
    .string()
    .min(3, { message: "Supplier Name is Mandatory" })
    .max(50, { message: "Supplier Name cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Supplier Name must contain only alphabets",
    }),


  supplierMobile: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((num) => Number.isInteger(num), { message: "Mobile number must be an integer" })
    .refine((num) => num >= 1000000000 && num <= 9999999999, {
      message: "Mobile No. should be exactly 10 digits long.",
    }),


  supplierGstinNo: z
    .string()
    .min(1, { message: "GSTIN No. is Mandatory" })
    .refine((val) => /^[A-Za-z0-9]{15}$/.test(val), {
      message: "GSTIN No. must be exactly 15 alphanumeric characters",
    })
    .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
      message: "GSTIN No. must contain both letters and numbers.",
    }),

  supplierGstType: z.string().min(1, { message: 'GST Type is Mandatory' }),

  supplierEmail: z
  .string()
   .min(1, {message: "Email is mandatory" })
  .email({ message: "Enter a valid email address" }),

});