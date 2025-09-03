import { z } from "zod";

export const billingSchema = z.object({
  patientName: z
    .string({ required_error: "Patient Name is Mandatory1" })
    .min(1, { message: "Patient Name is Mandatory2" }),

  patientId1: z
    .string({ required_error: "Patient ID is Mandatory1" })
    .min(1, { message: "Patient ID is Mandatory2" }),

  patientType: z
    .string({ required_error: "Patient Type is Mandatory1" })
    .min(1, { message: "Patient Type is Mandatory2" }),

  doctorId: z
    .string({ required_error: "Doctor is Mandatory1" })
    .min(1, { message: "Doctor is Mandatory2" }),

  paymentStatus: z
    .string({ required_error: "Payment Status is Mandatory1" })
    .min(1, { message: "Payment Status is Mandatory2" }),

     paymentType: z.string().optional(),
    receivedAmount: z.coerce.number().optional(),
    upi: z.coerce.number().optional(),
    cash: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentStatus === "paid" && !data.paymentType) {
      ctx.addIssue({
        path: ["paymentType"],
        code: z.ZodIssueCode.custom,
        message: "Payment Type is required when Payment Status is Paid",
      });
    }

    if (data.paymentType === "cash") {
      if (!data.receivedAmount || data.receivedAmount <= 0) {
        ctx.addIssue({
          path: ["receivedAmount"],
          code: z.ZodIssueCode.custom,
          message: "Received Amount is required for Cash payments",
        });
      }
    }

    if (data.paymentType === "upiCash") {
      if (!data.upi || data.upi <= 0) {
        ctx.addIssue({
          path: ["upi"],
          code: z.ZodIssueCode.custom,
          message: "UPI amount is required for UPI & Cash payments",
        });
      }
      if (!data.cash || data.cash <= 0) {
        ctx.addIssue({
          path: ["cash"],
          code: z.ZodIssueCode.custom,
          message: "Cash amount is required for UPI & Cash payments",
        });
      }
    }
});


export const billingItemSchema = z.object({
    itemId: z
        .string()
        .nonempty({ message: "Item is Mandatory" }),

    packageQuantity: z.coerce
        .number({
            required_error: "Package Quantity is Mandatory",
        })
        .positive({ message: "Package Quantity must be greater than 0" }),

});