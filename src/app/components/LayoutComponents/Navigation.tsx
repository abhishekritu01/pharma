"use client"; 

import { NavigationItem } from '@/app/types/NavigationItem'
import { MdDashboard, MdInventory, MdAssignmentReturn, MdOutlineInventory } from "react-icons/md";
import { IoPeople } from "react-icons/io5";
import { RiMedicineBottleFill} from "react-icons/ri";
import { FaNotesMedical, FaStore} from "react-icons/fa6";
import { PiReceiptFill } from "react-icons/pi";
import { FaListAlt } from 'react-icons/fa';
import { BiSolidCreditCard } from "react-icons/bi";


export const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: MdDashboard, current: true },

  {
    name: "Purchase",
    icon: MdInventory,
    current: false,
    children: [
      { name: "Purchase Order", href: "/dashboard/order", current: false, icon:  FaNotesMedical},
      { name: "Purchase Entry", href: "/dashboard/entry", current: false, icon: FaListAlt  },
      { name: "Purchase Return", href: "/dashboard/return", current: false, icon: MdAssignmentReturn },
    ],
  },

  { name: "Stock", href: "/dashboard/inventory", icon: MdOutlineInventory , current: true },


  {
    name: "Inventory Setting",
    icon: FaStore,
    current: false,
    children: [
      { name: "Supplier Master", href: "/dashboard/supplier", icon: IoPeople, current: true },
      { name: "Item Master", href: "/dashboard/item", icon: RiMedicineBottleFill, current: true },
     
    ],
  },
   { name: "Stock Inventory", href: "/dashboard/stockreport", icon: MdOutlineInventory , current: true },

 
  { name: "Billing", href: "/dashboard/billing", icon: PiReceiptFill, current: true },
  { name: "Supplier's Payment Summary", href: "/dashboard/spaymentsummary", icon: BiSolidCreditCard , current: true },
  
  // {
  //   name: "Settings",
  //   icon: IoSettings,
  //   current: false,
  //   children: [
  //     { name: "User Profile", href: "/dashboard/profile", current: false, icon: HiUser },
  //     { name: "Pharmacy", href: "/dashboard/lab", current: false, icon: FaHouseChimneyMedical },
  //   ],
  // },
];