'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { PharmacyData } from '../types/PharmacyData';
import { UserData } from '../types/UserData';


interface PharmaContextType {
    pharma: PharmacyData[];
    setPharma: React.Dispatch<React.SetStateAction<PharmacyData[]>>;
    currentPharma: PharmacyData | null;
    setCurrentPharma: React.Dispatch<React.SetStateAction<PharmacyData | null>>;
    formData: PharmacyData;
    setFormData: React.Dispatch<React.SetStateAction<PharmacyData>>;
    refreshpharma: boolean;
    setRefreshPharma: React.Dispatch<React.SetStateAction<boolean>>;
    loginedUser: UserData;
    setLoginedUser: React.Dispatch<React.SetStateAction<UserData>>;
}

const PharmaContext = createContext<PharmaContextType | undefined>(undefined);

interface PharmaProviderProps {
    children: ReactNode;
}

const PharmaProvider = ({ children }: PharmaProviderProps) => {
    const [pharma, setPharma] = useState<PharmacyData[]>([]);
    const [currentPharma, setCurrentPharma] = useState<PharmacyData | null>(null);
    const [formData, setFormData] = useState<PharmacyData>({
        name: '',
        address: '',
        city: '',
        state: '',
        description: '',
        isActive: true,
        pharmacyId:0,
    });

    const [refreshpharma, setRefreshPharma] = useState<boolean>(false);
    const [loginedUser, setLoginedUser] = useState<UserData>({
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: [],
        modules: null,
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        id:0,
        enabled: false,
        is_verified: false,
    });


    return (
        <PharmaContext.Provider value={{
            pharma,
            setPharma,
            currentPharma,
            setCurrentPharma,
            formData,
            setFormData,
            refreshpharma,
            setRefreshPharma,
            loginedUser,
            setLoginedUser,
            

        }}>
            {children}
        </PharmaContext.Provider>
    );
};

export const usePharma = (): PharmaContextType => {
    const context = useContext(PharmaContext);
    if (!context) {
        throw new Error('usePharma must be used within a PharmaProvider');
    }
    return context;
};

export { PharmaProvider };
