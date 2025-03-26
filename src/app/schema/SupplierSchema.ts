import { z } from 'zod';

export const supplierSchema = z.object({
    supplierName: z
        .string()
        .min(3, { message: "Supplier Name is Mandatory" })
        .max(50, { message: "Supplier Name cannot exceed 50 characters." }),

        supplierMobile: z
        .union([z.string(), z.number()]) 
        .transform((val) => Number(val)) 
        .refine((num) => Number.isInteger(num), { message: "Mobile number must be an integer" })
        .refine((num) => num >= 1000000000 && num <= 9999999999, {
          message: "Mobile No. should be exactly 10 digits long.",
        }),
      

        supplierGstinNo: z
        .string()
        .min(1, { message: "GSTIN No. is Mandatory" }) // ✅ Ensures the field is required
        .optional()
        .refine((val) => !val || val.length === 15, {
          message: "GSTIN No. should be exactly 15 characters long.",
        }),
      

    supplierGstType: z.string().min(1, { message: 'GST Type is Mandatory' }),
});