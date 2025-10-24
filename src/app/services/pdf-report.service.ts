// pdf-report.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportConfig {
  title: string;
  subtitle?: string;
  fileName: string;
  orientation?: 'portrait' | 'landscape';
  columns: { header: string; dataKey: string }[];
  data: any[];
  additionalInfo?: { label: string; value: string | number }[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {
  
  constructor() {}

  /**
   * Generate a PDF report with table data
   */
  generateReport(config: ReportConfig): void {
    const doc = new jsPDF({
      orientation: config.orientation || 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Add Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add Subtitle
    if (config.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(config.subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    }

    // Add Date and Time
    doc.setFontSize(10);
    doc.setTextColor(100);
    const currentDate = new Date().toLocaleString();
    doc.text(`Generated: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add Additional Info (if provided)
    if (config.additionalInfo && config.additionalInfo.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      
      config.additionalInfo.forEach(info => {
        doc.text(`${info.label}: `, 14, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${info.value}`, 14 + doc.getTextWidth(`${info.label}: `), yPosition);
        doc.setFont('helvetica', 'bold');
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Add Table
    autoTable(doc, {
      startY: yPosition,
      head: [config.columns.map(col => col.header)],
      body: config.data.map(row => 
        config.columns.map(col => {
          const value = this.getNestedValue(row, col.dataKey);
          return value !== null && value !== undefined ? String(value) : 'N/A';
        })
      ),
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 10, left: 14, right: 14 }
    });

    // Add Footer with Page Numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(config.fileName);
  }

  /**
   * Generate Cars Report (specific implementation)
   */
  generateCarsReport(cars: any[], totalRented: number, statusFilter: string): void {
    const availableCars = cars.filter(c => !c.statusInfo?.isRented).length;
    
    const config: ReportConfig = {
      title: 'Cars Inventory Report',
      subtitle: `Status Filter: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`,
      fileName: `cars-report-${new Date().getTime()}.pdf`,
      orientation: 'landscape',
      columns: [
        { header: 'Plate Number', dataKey: 'plate' },
        { header: 'Brand', dataKey: 'brand' },
        { header: 'Class', dataKey: 'class' },
        { header: 'Model', dataKey: 'model' },
        { header: 'Color', dataKey: 'color' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Customer', dataKey: 'statusInfo.customerName' },
        { header: 'Available Date', dataKey: 'statusInfo.checkIn' }
      ],
      data: cars.map(car => ({
        ...car,
        status: car.statusInfo?.isRented ? 'Rented' : 'Available',
        'statusInfo.customerName': car.statusInfo?.customerName || '-',
        'statusInfo.checkIn': car.statusInfo?.checkIn 
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
   * Helper function to get nested object values
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}