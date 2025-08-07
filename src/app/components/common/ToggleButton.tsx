import React from "react";
import { BsToggle2Off, BsToggle2On } from "react-icons/bs";

interface ToggleButtonProps {
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
}


const ToggleButton: React.FC<ToggleButtonProps> = ({
  isEnabled,
  setIsEnabled,
}) => {

  return (
    <>
    <span className="text-base font-medium text-gray">
        {!isEnabled  ? "User is Inactive" : "User is Active"}
     </span>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className="text-2xl cursor-pointer"
        >
          {!isEnabled  ? (
            <BsToggle2On className="text-Red" />
          ) : (
            <BsToggle2Off className="text-green" />
          )}
        </button>

        <span className="text-sm font-medium text-gray">
          {!isEnabled ? "Activate User" : "Deactivate User"}
        </span>
      </div>
    </>
  );
};

export default ToggleButton;
