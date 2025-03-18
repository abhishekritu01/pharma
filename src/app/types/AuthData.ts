export interface LoginRequest {
    username: string;
    password: string;
}

export interface ErrorResponse {
    message: string;
    statusCode: number;
}

export interface Module {
    id: number;
    name: string;
}

export interface LoginResponseData {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    modules: Module[];
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    enabled: boolean;
    is_verified: boolean; // Use snake_case as per API response
}

export interface LoginResponse {
    status: string; // e.g., "OK" or "ERROR"
    message: string; // e.g., "Login successful"
    token: string; // JWT token
    data: LoginResponseData; // User data object
}



//data is null
export interface RegisterResponse {
    status: string;
    message: string;
    data: null;
}


