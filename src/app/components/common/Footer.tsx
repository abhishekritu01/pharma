'use client';

import React from "react";
import Image from "next/image";
import Button from "./Button";
import { useRouter } from "next/navigation";


const Footer = () => {
    const router = useRouter();
  return (
    <>
      <div className="flex justify-between">
        <div className="space-y-3">
          <div className="text-lg font-semibold flex space-x-3">
            <Image
              src="/TiamedsIcon.svg"
              alt="Company Logo"
              width={45}
              height={32}
            />
            <Image
              src="/TiamedsLogo.svg"
              alt="Company Logo"
              width={90}
              height={32}
            />
          </div>
          <div className="text-base">
            <span className="font-medium">Powered by</span>
            <span className="font-bold"> TiaMeds Technology Pvt Ltd</span>
          </div>
        </div>

        <div className="mt-9">
          <Button label="Back" value="" className="w-20 text-black h-11" onClick={() => router.back()}></Button>
        </div>
      </div>
    </>
  );
};

export default Footer;
