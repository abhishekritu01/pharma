import { create } from 'zustand';
import { LoginResponseData } from '../types/AuthData';

interface UserStore {
  user: LoginResponseData | null;
  setUser: (user: LoginResponseData) => void;
  initializeUser: () => void; // New method to initialize user from localStorage
}

const useUserStore = create<UserStore>((set: (arg0: { user: LoginResponseData | null; }) => void) => {
  return {
    user: null,
    setUser: (newUser: LoginResponseData) => {
      set({ user: newUser });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(newUser)); // Save to localStorage
      }
    },
    initializeUser: () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const user: LoginResponseData | null = storedUser ? JSON.parse(storedUser) : null;
        set({ user });
      }
    }
  };
});

export default useUserStore;
