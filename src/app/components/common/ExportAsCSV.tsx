import React, { useState } from 'react';
import { exportAsCSVService } from "../../services/ExportAsCSVService";
import Button from './Button';
import { FaFileCsv, FaFileExcel } from 'react-icons/fa';

type ExportableValue = string | number | boolean | Date | null | undefined;

interface ExportButtonProps {
  data: Record<string, ExportableValue>[] | (() => Promise<Record<string, ExportableValue>[]>);
  exportOptions: {
    filename: string;
    headers?: Record<string, string>;
    excel?: {
      sheetName?: string;
      columnWidths?: Record<string, number>;
    };
    csv?: {
      delimiter?: string;
    };
  };
  onExportStart?: () => void;
  onExportComplete?: (format: 'csv' | 'excel') => void;
  onError?: (error: Error) => void;
  variant?: 'csv' | 'excel' | 'both';
  buttonProps?: Partial<React.ComponentProps<typeof Button>>;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  exportOptions,
  onExportStart,
  onExportComplete,
  onError,
  variant = 'both',
  buttonProps = {},
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [currentExport, setCurrentExport] = useState<'csv' | 'excel' | null>(null);

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      onExportStart?.();
      setIsExporting(true);
      setCurrentExport(format);
      
      await exportAsCSVService.exportData(data, format, exportOptions);
      onExportComplete?.(format);
    } catch (error) {
      console.error('Export failed:', error);
      onError?.(error instanceof Error ? error : new Error('Export failed'));
    } finally {
      setIsExporting(false);
      setCurrentExport(null);
    }
  };

  const renderExportButton = (format: 'csv' | 'excel') => {
    const isActive = currentExport === format && isExporting;
    const icon = format === 'csv' ? <FaFileCsv /> : <FaFileExcel />;
    const label = isActive ? 'Exporting...' : `Export ${format.toUpperCase()}`;

    return (
      <Button
        type="button"
        onClick={() => handleExport(format)}
        label={label}
        icon={icon}
        // disabled={isExporting}
        className={`${buttonProps.className || ''} ${
          isActive ? 'opacity-75' : ''
        }`}
        {...buttonProps}
      />
    );
  };

  if (variant === 'both') {
    return (
      <div className="flex gap-2">
        {renderExportButton('csv')}
        {renderExportButton('excel')}
      </div>
    );
  }

  return renderExportButton(variant);
};












// import React, { useState } from 'react';
// import { exportAsCSVService } from "../../services/ExportAsCSVService";
// import Button from './Button';
// import { FaFileCsv, FaFileExcel } from 'react-icons/fa';

// interface ExportButtonProps {
//   data: Record<string, string>[] | (() => Promise<Record<string, unknown>[]>);
//   exportOptions: {
//     filename: string;
//     headers?: Record<string, string>;
//     excel?: {
//       sheetName?: string;
//       columnWidths?: Record<string, number>;
//     };
//   };
//   onExportStart?: () => void;
//   onExportComplete?: (format: 'csv' | 'excel') => void;
//   onError?: (error: Error) => void;
//   variant?: 'csv' | 'excel' | 'both';
//   buttonProps?: Partial<React.ComponentProps<typeof Button>>;
// }

// export const ExportButton: React.FC<ExportButtonProps> = ({
//   data,
//   exportOptions,
//   onExportStart,
//   onExportComplete,
//   onError,
//   variant = 'both',
//   buttonProps = {},
// }) => {
//   const [isExporting, setIsExporting] = useState(false);
//   const [currentExport, setCurrentExport] = useState<'csv' | 'excel' | null>(null);

//   const handleExport = async (format: 'csv' | 'excel') => {
//     try {
//       onExportStart?.();
//       setIsExporting(true);
//       setCurrentExport(format);
      
//       await exportAsCSVService.exportData(data, format, exportOptions);
//       onExportComplete?.(format);
//     } catch (error) {
//       console.error('Export failed:', error);
//       onError?.(error instanceof Error ? error : new Error('Export failed'));
//     } finally {
//       setIsExporting(false);
//       setCurrentExport(null);
//     }
//   };

//   const renderExportButton = (format: 'csv' | 'excel') => {
//     const isActive = currentExport === format && isExporting;
//     const icon = format === 'csv' ? <FaFileCsv /> : <FaFileExcel />;
//     const label = isActive ? 'Exporting...' : `Export ${format.toUpperCase()}`;

//     return (
//       <Button
//         type="button"
//         onClick={() => handleExport(format)}
//         label={label}
//         icon={icon}
//         disabled={isExporting}
//         className={`${buttonProps.className || ''} ${
//           isActive ? 'opacity-75' : ''
//         }`}
//         {...buttonProps}
//       />
//     );
//   };

//   if (variant === 'both') {
//     return (
//       <div className="flex gap-2">
//         {renderExportButton('csv')}
//         {renderExportButton('excel')}
//       </div>
//     );
//   }

//   return renderExportButton(variant);
// };