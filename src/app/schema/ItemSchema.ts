import { z } from 'zod';

export const itemSchema = z.object({
  itemName: z
    .string()
    .min(3, { message: "Item Name is Mandatory" })
    .max(50, { message: "Item Name cannot exceed 50 characters." })
    .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Item Name must contain only alphabets",
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


  cgstPercentage: z
    .number({
      invalid_type_error: "CGST Percentage must be an integer",
      required_error: "CGST Percentage is Mandatory",
    })
    .int({ message: "CGST Percentage must be an integer" })
    .min(1, { message: "CGST Percentage is Mandatory" })
    .max(99, { message: "CGST Percentage must be 2 digit" }),

    sgstPercentage: z
  .number({
    invalid_type_error: "SGST Percentage must be an integer",
    required_error: "SGST Percentage is Mandatory",
  })
  .int({ message: "SGST Percentage must be an integer" })
  .min(1, { message: "SGST Percentage is Mandatory" })
  .max(99999, { message: "SGST Percentage must be 2 digit" }),


  manufacturer: z.string().min(1, { message: 'Manufacturer is Mandatory' })
  .refine((val) => /^[A-Za-z\s]+$/.test(val), {
      message: "Manufacturer must contain only alphabets",
    }),

  hsnNo: z.string().min(1, { message: 'HSN No. is Mandatory' }),
});