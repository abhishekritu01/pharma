export interface UserData {
    id: number;
    username: string;
    password: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    roles: string[];
    enabled?: boolean;
    pharmacyId?: number;
  }