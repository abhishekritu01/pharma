import { z } from 'zod';

export const purchaseEntrySchema = z.object({

    pharmacyId: z
        .string()
        .nonempty({ message: "Pharmacy is Mandatory" }),

    purchaseBillNo: z
        .string()
        .min(1, { message: "Invoice Number is Mandatory" }),

    billDate: z
        .string()
        .nonempty({ message: "Bill Date is Mandatory" })
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Bill Date must be a valid date",
        }),

    creditPeriod: z
        .number({ required_error: "Credit Period is Mandatory" }),

    paymentDueDate: z
        .string()
        .nonempty({ message: "Payment Due Date is Mandatory" })
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Payment Due Date must be a valid date",
        }),

    supplierId: z
        .string()
        .nonempty({ message: "Supplier is Mandatory" }),


    invoiceAmount: z
        .number({
            required_error: "Invoice Amount is Mandatory",
        }),

});

export const purchaseEntryItemSchema = z.object({
    itemId: z
        .string()
        .nonempty({ message: "Item is Mandatory" }),

    batchNo: z
        .string()
        .min(1, { message: "Batch No is Mandatory" }),



    packageQuantity: z.coerce
        .number({
            required_error: "Package Quantity is Mandatory",
        })
        .positive({ message: "Package Quantity must be greater than 0" }),


    expiryDate: z
        .string()
        .nonempty({ message: "Expiry Date is Mandatory" })
        .refine((val) => !isNaN(Date.parse(val)), {
            message: "Expiry Date must be a valid date",
        }),

});
