export interface RegisterData {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    zip: string;
    address?: string;
    state?: string;
    country?: string;
    // modules: number[];
    verified?: boolean;
    }