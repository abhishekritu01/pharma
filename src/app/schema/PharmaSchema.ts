import { z } from 'zod';



export const pharmaFormDataSchema = z.object({
    name: z.string().min(3, "Name is required"),
    description: z.string().optional(),
    address: z.string().min(2, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pharmaZip: z.string().min(1, "Zip code is required"),
    pharmaCountry: z.string().min(1, "Country is required"),
    pharmaLogo: z.string().optional(),
    pharmaPhone: z.string().min(1, "Phone number is required"),
    pharmaEmail: z.string().email("Invalid email format").optional(),
    licenseNo: z.string().min(1, "License Number is required"),
    gstNo: z.string().min(1, "GSTIN Number is required"),
    isActive: z.boolean()
    });