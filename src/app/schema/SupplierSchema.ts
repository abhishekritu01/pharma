import { z } from 'zod';

const validGSTStateCodes = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38"
];

export const supplierSchema = z.object({
  supplierName: z
    .string()
    .min(3, { message: "Supplier Name is Mandatory" })
    .max(50, { message: "Supplier Name cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Supplier Name must contain only alphabets",
    }),

  contactPerson: z
    .string()
    .min(3, { message: "Contact Person Name is Mandatory" })
    .max(50, { message: "Contact Person Name cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Contact Person Name must contain only alphabets",
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
      message: "GSTIN No. must contain both letters and numbers",
    })
    .refine((value) => validGSTStateCodes.includes(value.substring(0, 2)), {
      message: "Invalid State Code in GSTIN",
    }),


  supplierGstType: z.string().min(1, { message: 'GST Type is Mandatory' }),

  supplierEmail: z
    .string()
    .min(1, { message: "Email is mandatory" })
    .email({ message: "Enter a valid email address" }),

  supplierDlno: z
    .string()
    .min(1, { message: "DL Number is Mandatory" })
    .refine((val) => /^[A-Za-z0-9-]+$/.test(val), {
      message: "DL Number must be alphanumeric and can include '-' only.",
    })
    .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
      message: "DL Number must contain both letters and numbers.",
    }),

  supplierZip: z
    .string()
    .min(1, { message: "ZIP Code is mandatory" })
    .refine((val) => /^[1-9][0-9]{5}$/.test(val), {
      message: "Enter a valid 6-digit ZIP code",
    }),

  supplierCity: z
    .string()
    .min(3, { message: "City is Mandatory" })
    .max(50, { message: "City cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "City must contain only alphabets",
    }),

  supplierState: z
    .string()
    .min(3, { message: "State is Mandatory" })
    .max(50, { message: "State cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "State must contain only alphabets",
    }),


});