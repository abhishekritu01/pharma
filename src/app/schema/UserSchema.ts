import { z } from 'zod';

export const userSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits")
        .optional(),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    city: z.string().min(2, "City must be at least 2 characters").max(50, "City must be at most 50 characters").optional(),
    roles: z.array(z.string()).nonempty("At least one role is required"),
    // password: z.string().min(8, "Password must be at least 8 characters").optional(),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number").optional(),
});