export interface PharmacyData {
    pharmacyId?: number;
    name: string;
    address: string;
    city: string;
    state: string;
    description: string;
    isActive: boolean;
    gstNo?: string;
    licenseNo?: string;
    pharmaLogo?: string;
    pharmaZip?: string;
    pharmaCountry?: string;
    pharmaPhone?: string;
    pharmaEmail?: string;
    createdBy?:number;
}

