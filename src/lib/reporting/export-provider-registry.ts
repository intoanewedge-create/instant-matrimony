import { Result, returnSuccess, returnFailure } from "../result";

export interface ReportProvider {
  name(): string;
  extension(): string;
  generateReport(title: string, headers: string[], rows: any[][]): Promise<Result<string>>;
}

export class CsvReportProvider implements ReportProvider {
  name() {
    return "CsvReportProvider";
  }

  extension() {
    return "csv";
  }

  async generateReport(title: string, headers: string[], rows: any[][]): Promise<Result<string>> {
    try {
      const csvLines = [
        `# Report: ${title}`,
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ];
      return returnSuccess(csvLines.join("\n"));
    } catch (e: any) {
      return returnFailure(e.message, "CSV_GENERATION_FAILED");
    }
  }
}

export class ExcelReportProvider implements ReportProvider {
  name() {
    return "ExcelReportProvider";
  }

  extension() {
    return "xlsx";
  }

  async generateReport(title: string, headers: string[], rows: any[][]): Promise<Result<string>> {
    try {
      // Mock XML Spreadsheet structure for test validation without node module overhead
      let xml = `<?xml version="1.0"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">\n`;
      xml += `  <Worksheet name="${title.replace(/[^a-zA-Z0-9]/g, "")}">\n    <Table>\n`;
      xml += `      <Row>\n` + headers.map((h) => `        <Cell><Data Type="String">${h}</Data></Cell>`).join("\n") + `\n      </Row>\n`;

      for (const row of rows) {
        xml += `      <Row>\n` + row.map((cell) => `        <Cell><Data Type="String">${String(cell)}</Data></Cell>`).join("\n") + `\n      </Row>\n`;
      }

      xml += `    </Table>\n  </Worksheet>\n</Workbook>`;
      return returnSuccess(xml);
    } catch (e: any) {
      return returnFailure(e.message, "EXCEL_GENERATION_FAILED");
    }
  }
}

export class PdfReportProvider implements ReportProvider {
  name() {
    return "PdfReportProvider";
  }

  extension() {
    return "pdf";
  }

  async generateReport(title: string, headers: string[], rows: any[][]): Promise<Result<string>> {
    try {
      // Mock PDF structure/text formatting for testing exports
      let doc = `%PDF-1.4\n1 0 obj\n<< /Title (${title}) >>\nendobj\n`;
      doc += `Headers: ${headers.join(" | ")}\n`;
      for (const row of rows) {
        doc += `Row: ${row.join(" | ")}\n`;
      }
      doc += `%%EOF`;
      return returnSuccess(doc);
    } catch (e: any) {
      return returnFailure(e.message, "PDF_GENERATION_FAILED");
    }
  }
}

export class ExportProviderRegistry {
  private providers: Map<string, ReportProvider> = new Map();
  private activeProviderName = "CsvReportProvider";

  registerProvider(provider: ReportProvider) {
    this.providers.set(provider.name(), provider);
  }

  setActiveProvider(name: string) {
    if (this.providers.has(name)) {
      this.activeProviderName = name;
    }
  }

  getActiveProvider(): ReportProvider {
    return this.providers.get(this.activeProviderName) || new CsvReportProvider();
  }

  getProvider(name: string): ReportProvider | undefined {
    return this.providers.get(name);
  }
}

export const exportProviderRegistry = new ExportProviderRegistry();
exportProviderRegistry.registerProvider(new CsvReportProvider());
exportProviderRegistry.registerProvider(new ExcelReportProvider());
exportProviderRegistry.registerProvider(new PdfReportProvider());
