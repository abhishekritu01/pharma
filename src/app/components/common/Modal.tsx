"use client";
import React from "react";
import Button from "./Button";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  message: string;
  secondaryMessage?: string;
  bgClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onConfirm, onCancel, secondaryMessage, bgClassName}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur -sm z-50"
      onClick={onCancel} 
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full space-y-6"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <div>
            <Image
              src="/TiamedsIcon.svg"
              alt="Company Logo"
              width={30}
              height={30}
            />
          </div>
          <div className="text-lg font-semibold">{secondaryMessage}</div>
          </div>
          <div>
          <XMarkIcon aria-hidden="true" className="size-5 cursor-pointer" onClick={onCancel}/>
          </div>
          
        </div>
        <p className="text-center text-sm">{message}</p>
        <div className="flex justify-end space-x-4">
          <Button
            onClick={onCancel}
            label="Cancle"
            value=""
            className="w-40 h-11"
          ></Button>

          <Button
            onClick={onConfirm}
            label="Yes, Confirm"
            value=""
            className={`w-40 text-white h-11 ${bgClassName ?? ""}`}
          ></Button>

        </div>
      </div>
    </div>
  );
};

export default Modal;
