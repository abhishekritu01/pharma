import { z } from 'zod';

export const itemSchema = z.object({
  itemName: z
    .string()
    .min(3, { message: "Item Name is Mandatory" })
    .max(50, { message: "Item Name cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z0-9\s]+$/.test(val), {
      message: "Item Name must be Alphanumeric",
    }),

  purchaseUnit: z
    .number({
      invalid_type_error: "Purchase Unit must be an integer",
      required_error: "Purchase Unit is Mandatory",
    })
    .int({ message: "Purchase Unit must be an integer" })
    .min(1, { message: "Purchase Unit is Mandatory" })
    .max(999, { message: "Purchase Unit must be between 1 and 999" }),


  unitId: z.string().nonempty({ message: 'Unit Type is Mandatory' }),
  variantId: z.string().nonempty({ message: 'Variant Type is Mandatory' }),


  purchasePrice: z
    .number({
      invalid_type_error: "Purchase Price must be an integer",
      required_error: "Purchase Price is Mandatory",
    })
    .int({ message: "Purchase Price must be an integer" })
    .min(1, { message: "Purchase Price is Mandatory" })
    .max(99999, { message: "Purchase Price must be between 1 and 99999" }),

  mrpSalePrice: z
    .number({
      invalid_type_error: "MRP must be an integer",
      required_error: "MRP is Mandatory",
    })
    .int({ message: "MRP must be an integer" })
    .min(1, { message: "MRP is Mandatory" })
    .max(99999, { message: "MRP must be between 1 and 99999" }),


  gstPercentage: z
    .number({
      invalid_type_error: "GST Percentage must be an integer",
      required_error: "GST Percentage is Mandatory",
    })
    .int({ message: "GST Percentage must be an integer" })
    .min(1, { message: "GST Percentage is Mandatory" })
    .max(99, { message: "GST Percentage must be 2 digit" }),


  hsnNo: z
    .string()
    .nonempty({ message: "HSN No. is Mandatory" })
    .min(6, { message: "HSN No. must be minimum 6 digits" })
    .regex(/^\d+$/, { message: "HSN No. must contain digits only" }),


  genericName: z
    .string()
    .max(50, { message: "Generic Name cannot exceed 50 characters." })
    .refine((val) => !val || /^[A-Za-z\s]+$/.test(val), {
      message: "Generic Name must contain only alphabets",
    }),

  manufacturer: z
    .string()
    .refine((val) => !val || /^[A-Za-z\s]+$/.test(val), {
      message: "Manufacturer must contain only alphabets",
    }),
});