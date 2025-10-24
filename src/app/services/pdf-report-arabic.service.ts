// pdf-arabic.service.ts
import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMakeInstance: any = (pdfMake as any);
pdfMakeInstance.vfs = (pdfFonts as any).vfs;

export interface PdfReportConfig {
  title: string;
  subtitle?: string;
  fileName: string;
  orientation?: 'portrait' | 'landscape';
  columns: { header: string; dataKey: string; width?: string | number }[];
  data: any[];
  additionalInfo?: { label: string; value: string | number }[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfArabicService {

  constructor() {}

  /**
   * Helper function to get nested object values
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Generate a general PDF report with full Arabic support
   */
  generateReport(config: PdfReportConfig): void {
    // Prepare table header
    const tableHeader = config.columns.map(col => ({
      text: col.header,
      style: 'tableHeader',
      alignment: 'center'
    }));

    // Prepare table body with data
    const tableBody = [
      tableHeader,
      ...config.data.map(row => 
        config.columns.map(col => {
          const value = this.getNestedValue(row, col.dataKey);
          return value !== null && value !== undefined ? String(value) : 'N/A';
        })
      )
    ];

    // Determine column widths
    const columnWidths = config.columns.map(col => col.width || 'auto');

    // Build document content
    const content: any[] = [
      // Title
      {
        text: config.title,
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      }
    ];

    // Add subtitle if provided
    if (config.subtitle) {
      content.push({
        text: config.subtitle,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      });
    }

    // Add generation date
    content.push({
      text: `Generated: ${new Date().toLocaleString()}`,
      fontSize: 10,
      color: '#666',
      alignment: 'center',
      margin: [0, 0, 0, 15]
    });

    // Add additional info if provided
    if (config.additionalInfo && config.additionalInfo.length > 0) {
      const infoColumns = config.additionalInfo.map(info => ({
        text: `${info.label}: ${info.value}`,
        bold: true,
        fontSize: 11
      }));
      
      content.push({
        columns: infoColumns,
        margin: [0, 0, 0, 15],
        columnGap: 20
      });
    }

    // Add table
    content.push({
      table: {
        headerRows: 1,
        widths: columnWidths,
        body: tableBody
      },
      layout: {
        fillColor: (rowIndex: number) => {
          return rowIndex === 0 ? '#3F51B5' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
        },
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#dddddd',
        vLineColor: () => '#dddddd',
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 3,
        paddingBottom: () => 3
      }
    });

    // Document definition
    const docDefinition: any = {
      pageOrientation: config.orientation || 'portrait',
      pageSize: 'A4',
      content: content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#333'
        },
        subheader: {
          fontSize: 12,
          color: '#666'
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#3F51B5'
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 9
      },
      footer: (currentPage: number, pageCount: number) => {
        return {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          fontSize: 8,
          color: '#666',
          margin: [0, 10, 0, 0]
        };
      }
    };

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(config.fileName);
  }

  /**
   * Generate Cars Report with Arabic support
   */
  generateCarsReport(cars: any[], totalRented: number, statusFilter: string): void {
    const availableCars = cars.filter(c => !c.statusInfo?.isRented).length;

    const config: PdfReportConfig = {
      title: 'Cars Inventory Report',
      subtitle: `Status Filter: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`,
      fileName: `cars-report-${new Date().getTime()}.pdf`,
      orientation: 'landscape',
      columns: [
        { header: 'Plate Number', dataKey: 'plate', width: 'auto' },
        { header: 'Brand', dataKey: 'brand', width: 'auto' },
        { header: 'Class', dataKey: 'class', width: 'auto' },
        { header: 'Model', dataKey: 'model', width: 'auto' },
        { header: 'Color', dataKey: 'color', width: 'auto' },
        { header: 'Status', dataKey: 'status', width: 'auto' },
        { header: 'Customer', dataKey: 'customerName', width: '*' },
        { header: 'Available Date', dataKey: 'availableDate', width: 'auto' }
      ],
      data: cars.map(car => ({
        plate: car.plate || 'N/A',
        brand: car.brand || 'N/A',
        class: car.class || 'N/A',
        model: car.model || 'N/A',
        color: car.color || 'N/A',
        status: car.statusInfo?.isRented ? 'Rented' : 'Available',
        customerName: car.statusInfo?.customerName || '-',
        availableDate: car.statusInfo?.checkIn 
          ? new Date(car.statusInfo.checkIn).toLocaleDateString() 
          : '-'
      })),
      additionalInfo: [
        { label: 'Total Cars', value: cars.length },
        { label: 'Rented Cars', value: totalRented },
        { label: 'Available Cars', value: availableCars }
      ]
    };

    this.generateReport(config);
  }

  /**
   * Generate Contracts Report
   */
  generateContractsReport(contracts: any[]): void {
    const config: PdfReportConfig = {
      title: 'Contracts Report',
      subtitle: 'Active Rental Contracts',
      fileName: `contracts-report-${new Date().getTime()}.pdf`,
      orientation: 'landscape',
      columns: [
        { header: 'ID', dataKey: 'id', width: 'auto' },
        { header: 'Customer', dataKey: 'customerName', width: '*' },
        { header: 'Car Plate', dataKey: 'carPlate', width: 'auto' },
        { header: 'Phone', dataKey: 'phoneNumber', width: 'auto' },
        { header: 'Check Out', dataKey: 'checkOut', width: 'auto' },
        { header: 'Check In', dataKey: 'checkIn', width: 'auto' },
        { header: 'Price', dataKey: 'price', width: 'auto' }
      ],
      data: contracts.map(contract => ({
        ...contract,
        checkOut: contract.checkOut ? new Date(contract.checkOut).toLocaleDateString() : 'N/A',
        checkIn: contract.checkIn ? new Date(contract.checkIn).toLocaleDateString() : 'N/A',
        price: contract.price ? `$${contract.price}` : 'N/A'
      })),
      additionalInfo: [
        { label: 'Total Contracts', value: contracts.length },
        { 
          label: 'Total Revenue', 
          value: `$${contracts.reduce((sum, c) => sum + (c.price || 0), 0).toLocaleString()}` 
        }
      ]
    };

    this.generateReport(config);
  }

  /**
   * Generate Customers Report
   */
  generateCustomersReport(customers: any[]): void {
    const config: PdfReportConfig = {
      title: 'Customers Directory',
      subtitle: 'Complete Customer List',
      fileName: `customers-report-${new Date().getTime()}.pdf`,
      orientation: 'portrait',
      columns: [
        { header: 'ID', dataKey: 'id', width: 'auto' },
        { header: 'Full Name', dataKey: 'fullName', width: '*' },
        { header: 'Phone', dataKey: 'phone', width: 'auto' },
        { header: 'Email', dataKey: 'email', width: '*' },
        { header: 'Nationality', dataKey: 'nationality', width: 'auto' }
      ],
      data: customers,
      additionalInfo: [
        { label: 'Total Customers', value: customers.length }
      ]
    };

    this.generateReport(config);
  }
}