// This code is not fucntioning (Already it is under development )



import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import Button from './Button';
import { FaPrint } from 'react-icons/fa';

interface PrintButtonProps {
  content: React.ReactElement | React.ReactElement[];
  pageSize?: { width: number; height: number };
  filename?: string;
  scale?: number;
  label?: string;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, 'label' | 'onClick' | 'type' | 'disabled'> & {
    disabled?: boolean;
  };
}

const PrintButton: React.FC<PrintButtonProps> = ({
  content,
  pageSize = { width: 210, height: 297 },
  filename = 'document.pdf',
  scale = 2,
  label = 'Print',
  buttonProps = {}
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const pages = Array.isArray(content) ? content : [content];
      const pdf = new jsPDF('p', 'mm', [pageSize.width, pageSize.height]);

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = `${pageSize.width}mm`;
        document.body.appendChild(tempDiv);

        await new Promise<void>((resolve) => {
          const root = createRoot(tempDiv);
          root.render(pages[i]);

          setTimeout(async () => {
            try {
              const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
                scale,
                useCORS: true,
                logging: false,
              });

              const imgData = canvas.toDataURL('image/png');
              const imgWidth = pageSize.width - 20;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            } finally {
              root.unmount();
              document.body.removeChild(tempDiv);
              resolve();
            }
          }, 300);
        });
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const printWindow = window.open(pdfUrl);
      if (printWindow) printWindow.onload = () => printWindow.print();
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Button
      type="button"
      label={isPrinting ? "Generating PDF..." : label}
      onClick={handlePrint}
      disabled={isPrinting || buttonProps.disabled}
      icon={<FaPrint />}
      {...buttonProps}
    />
  );
};

export default PrintButton;