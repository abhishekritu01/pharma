"use client"; 

import { NavigationItem } from '@/app/types/NavigationItem'
import { MdDashboard, MdInventory, MdAssignmentReturn, MdReceiptLong, MdMedicalServices, MdAssignmentTurnedIn } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { RiMedicineBottleFill} from "react-icons/ri";
import { FaFileInvoiceDollar, FaNotesMedical, FaStore, FaSkullCrossbones, FaBan, FaHouseChimneyMedical} from "react-icons/fa6";
import { PiReceiptFill } from "react-icons/pi";
import { IoSettings } from "react-icons/io5";
import { HiUser } from "react-icons/hi";


export const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: MdDashboard, current: true },
  { name: "Supplier", href: "/dashboard/supplier", icon: IoPeople, current: true },
  { name: "Item", href: "/dashboard/item", icon: RiMedicineBottleFill, current: true },

  {
    name: "Stock",
    icon: MdInventory,
    current: false,
    children: [
      { name: "Purchase Order", href: "/dashboard/order", current: false, icon:  FaNotesMedical},
      { name: "Purchase Entry", href: "/dashboard/entry", current: false, icon: MdAssignmentTurnedIn },
      { name: "Purchase Return", href: "/dashboard/return", current: false, icon: MdAssignmentReturn },
    ],
  },

  {
    name: "Inventory",
    icon: FaStore,
    current: false,
    children: [
      { name: "Inventory Item", href: "/dashboard/test", current: false, icon: MdMedicalServices },
      { name: "Expired Stock", href: "/dashboard/package", current: false, icon: FaBan },

     
    ],
  },
 
  { name: "Billing", href: "/dashboard", icon: PiReceiptFill, current: true },
  
  {
    name: "Settings",
    icon: IoSettings,
    current: false,
    children: [
      { name: "User Profile", href: "/dashboard/profile", current: false, icon: HiUser },
      { name: "Pharmacy", href: "/dashboard/lab", current: false, icon: FaHouseChimneyMedical },
    ],
  },
  

 

];