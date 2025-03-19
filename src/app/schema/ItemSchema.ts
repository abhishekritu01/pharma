import { z } from 'zod';  

export const itemSchema = z.object({
    itemName: z
    .string()
    .min(3, { message: "Name should be at least 3 characters long." })
    .max(100, { message: "Name cannot exceed 100 characters." }),
    
    purchaseUnit: z.number().min(1, { message: 'Purchase Unit is required' }),

    unitId: z.number().min(1, { message: 'Unit Type is required' }),
    variantId: z.number().min(1, { message: 'Variant Type is required' }),


    purchasePrice: z.number().min(1, { message: 'Purchase Price is required' }),
    mrpSalePrice: z.number().min(1, { message: 'MRP is required' }),

    purchasePricePerUnit: z.number().min(1, { message: 'Purchase Price  Per Unit is required' }),
    mrpSalePricePerUnit: z.number().min(1, { message: 'MRP Per Unit is required' }),
    
    cgstPercentage: z.number().min(1, { message: 'CGST is required' }),
    sgstPercentage: z.number().min(1, { message: 'SGST is required' }),

    hsnNo: z.string().min(1, { message: 'HSN No. is required' }),
});