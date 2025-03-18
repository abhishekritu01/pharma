import axios, {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
  } from 'axios';
  
  const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add a request interceptor
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Retrieve token from cookies
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token'))?.split('=')[1];
  
      if (!token) {
        console.warn('Token not found in cookies.');
      }
  
      // Exclude /public/login and /public/register from adding Authorization header
      const excludedEndpoints = ['/public/login', '/public/register'];
      const isExcluded = excludedEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
      );
  
      if (token && !isExcluded) {
        // Add Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Add a response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => response, // Pass through successful responses
    (error) => {
      if (error.response?.status === 401) {
        console.error('Unauthorized. Redirecting...');
        // Handle token expiration or redirect to login
        // Example: window.location.href = '/login';
      }
      return Promise.reject(error); // Reject other errors
    }
  );
  
  export default api;
  