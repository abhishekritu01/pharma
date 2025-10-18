import { z } from "zod";

export const supplierPaymentSchema = z.object({
  paymentMode: z
    .string()
    .min(1, { message: "Payment Mode is mandatory" }),

  referenceNo: z
    .string()
    .min(1, { message: "Reference No is mandatory" })
    .refine((val) => /^[A-Za-z0-9]+$/.test(val), {
      message: "Reference No must be alphanumeric",
    }),

  amountPayable: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((num) => Number.isFinite(num), {
      message: "Amount Payable must be a number",
    })
    .refine((num) => num > 0, {
      message: "Amount Payable must be a positive number",
    }),
});

export type SupplierPaymentForm = z.infer<typeof supplierPaymentSchema>;


