import * as XLSX from 'xlsx';
import Papa from 'papaparse';

type ExportableValue = string | number | boolean | Date | null | undefined;
type ExportData<T = Record<string, ExportableValue>> = T[];

interface ExportOptions<T = Record<string, ExportableValue>> {
  filename: string;
  headers?: Partial<Record<keyof T, string>>;
  excel?: {
    sheetName?: string;
    columnWidths?: Partial<Record<keyof T, number>>;
  };
  csv?: {
    delimiter?: string;
  };
}

class ExportAsCSVService {
  async exportData<T extends Record<string, ExportableValue>>(
    data: ExportData<T> | (() => Promise<ExportData<T>>),
    format: 'csv' | 'excel',
    options: ExportOptions<T>
  ) {
    const processedData = await this.getData(data);
    const processedWithHeaders = this.processHeaders(processedData, options.headers);

    if (format === 'csv') {
      const csv = Papa.unparse(processedWithHeaders, {
        header: true,
        delimiter: options.csv?.delimiter || ',',
      });
      this.downloadFile(csv, `${options.filename}.csv`, 'text/csv');
    } else {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(processedWithHeaders);
      
      if (options.excel?.columnWidths) {
        worksheet['!cols'] = Object.values(options.excel.columnWidths).map(width => ({
          wch: width,
        }));
      }
      
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        options.excel?.sheetName || 'Sheet1'
      );
      
      XLSX.writeFile(workbook, `${options.filename}.xlsx`);
    }
  }

  private async getData<T extends Record<string, ExportableValue>>(
    data: ExportData<T> | (() => Promise<ExportData<T>>)
  ): Promise<ExportData<T>> {
    return typeof data === 'function' ? await data() : data;
  }

  private processHeaders<T extends Record<string, ExportableValue>>(
    data: ExportData<T>,
    headers?: ExportOptions<T>['headers']
  ): ExportData<T> {
    if (!headers) return data;
    
    return data.map(item => {
      const newItem = {} as Record<string, ExportableValue>;
      Object.entries(item).forEach(([key, value]) => {
        const headerKey = headers[key as keyof T] || key;
        newItem[headerKey] = value;
      });
      return newItem as T;
    });
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportAsCSVService = new ExportAsCSVService();













// ................Uncomment the following lines if you want to use the original code snippet................




// import * as XLSX from 'xlsx';
// import Papa from 'papaparse';

// type ExportData = Record<string, unknown>[];

// interface ExportOptions {
//   filename: string;
//   headers?: Record<string, string>;
//   excel?: {
//     sheetName?: string;
//     columnWidths?: Record<string, number>;
//   };
//   csv?: {
//     delimiter?: string;
//   };
// }

// class ExportAsCSVService {
//   async exportData(
//     data: ExportData | (() => Promise<ExportData>),
//     format: 'csv' | 'excel',
//     options: ExportOptions
//   ) {
//     const processedData = await this.getData(data);
//     const processedWithHeaders = this.processHeaders(processedData, options.headers);

//     if (format === 'csv') {
//       const csv = Papa.unparse(processedWithHeaders, {
//         header: true,
//         delimiter: options.csv?.delimiter || ',',
//       });
//       this.downloadFile(csv, `${options.filename}.csv`, 'text/csv');
//     } else {
//       const workbook = XLSX.utils.book_new();
//       const worksheet = XLSX.utils.json_to_sheet(processedWithHeaders);
      
//       if (options.excel?.columnWidths) {
//         worksheet['!cols'] = Object.values(options.excel.columnWidths).map(width => ({
//           wch: width,
//         }));
//       }
      
//       XLSX.utils.book_append_sheet(
//         workbook,
//         worksheet,
//         options.excel?.sheetName || 'Sheet1'
//       );
      
//       XLSX.writeFile(workbook, `${options.filename}.xlsx`);
//     }
//   }

//   private async getData(data: ExportData | (() => Promise<ExportData>)): Promise<ExportData> {
//     return typeof data === 'function' ? await data() : data;
//   }

//   private processHeaders(data: ExportData, headers?: Record<string, string>): ExportData {
//     if (!headers) return data;
    
//     return data.map(item => {
//       const newItem: Record<string, unknown> = {};
//       Object.entries(item).forEach(([key, value]) => {
//         const headerKey = headers[key] || key;
//         newItem[headerKey] = value;
//       });
//       return newItem;
//     });
//   }

//   private downloadFile(content: string, filename: string, mimeType: string) {
//     const blob = new Blob([content], { type: mimeType });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   }
// }

// export const exportAsCSVService = new ExportAsCSVService();