import { z } from "zod";

export const purchaseReturnSchema = z.object({
    purchaseReturnItemDtos: z
        .array(
            z.object({
                itemId: z
                    .string({ required_error: "Item is Mandatory" })
                    .nonempty({ message: "Item is Mandatory" }),

                batchNo: z
                    .string({ required_error: "Batch Number is Mandatory" })
                    .nonempty({ message: "Batch Number is Mandatory" }),

                purchaseBillNo: z
                    .string({ required_error: "Bill Number is Mandatory" })
                    .nonempty({ message: "Bill Number is Mandatory" }),

                supplierId: z
                    .string({ required_error: "Supplier is Mandatory" })
                    .nonempty({ message: "Supplier is Mandatory" }),

                returnType: z
                    .string()
                    .nonempty({ message: "Return Type is Mandatory" })
                    .refine(
                        (val) =>
                            ["Exchange product", "Refund", "Store Credit Returns"].includes(
                                val
                            ),
                        { message: "Invalid Return Type selected" }
                    ),

                returnQuantity: z.coerce
                    .number({
                        required_error: "Return Quantity is Mandatory",
                    })
                    .positive({ message: "Return Quantity must be greater than 0" }),

                discrepancyIn: z
                    .string()
                    .nonempty({ message: "Discrepancy In is Mandatory" }),

                discrepancy: z
                    .string()
                    .nonempty({ message: "Discrepancy is Mandatory" }),
            })
        )
        .min(1, { message: "At least one return item is required" }),
});
