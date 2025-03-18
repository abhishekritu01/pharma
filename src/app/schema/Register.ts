import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(4, "Username must be at least 3 characters long").max(20, "Username must be at most 20 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one letter and one number"
    ),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must be a valid 10-digit number"
    ),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  modules: z.array(z.number()).nonempty(),
  verified: z.boolean(),
});
