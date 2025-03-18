import {z} from 'zod'

export const loginSchema = z.object({
    username: z.string().min(4).max(20 , {message: 'Username must be between 4 and 20 characters'})
    .regex(/^[a-zA-Z0-9]+$/, { message: 'Username must contain only letters and numbers' }),
    password: z.string().min(8, {message: 'Password must be at least 8 characters'}),
})