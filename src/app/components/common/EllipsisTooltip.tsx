import React, { useEffect, useRef, useState } from "react";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  className?: string;
}

const EllipsisTooltip: React.FC<Props> = ({ text, className = "", ...rest }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const el = spanRef.current;
    if (el) {
      setShowTooltip(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <span
      ref={spanRef}
      className={`truncate ${className}`}
      title={showTooltip ? text : ""}
      {...rest}
    >
      {text}
    </span>
  );
};

export default EllipsisTooltip;
