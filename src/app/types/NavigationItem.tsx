export interface NavigationItem {
    name: string;
    href?: string;
    icon?: React.ElementType;
    current: boolean;
    children?: (Omit<NavigationItem, "children"> & { icon?: React.ElementType })[];
} 