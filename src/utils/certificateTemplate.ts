/**
 * Certificate Template Utilities
 * Provides functions for working with HTML certificate templates
 */

export interface CertificateData {
  ourRef: string;
  yourRef: string;
  date: string;
  certificateNumber: string;
  bearerName: string;
  nativeOf: string;
  village: string;
  qrCode?: string;
}

/**
 * Loads the certificate template from the public folder
 * @returns Promise<string> - The HTML template as a string
 */
export async function loadCertificateTemplate(): Promise<string> {
  try {
    const response = await fetch('/certificate-template.html');
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading certificate template:', error);
    throw error;
  }
}

/**
 * Populates the certificate template with data using DOM manipulation
 * @param templateHTML - The HTML template string
 * @param data - Certificate data object
 * @returns string - The populated HTML
 */
export function populateTemplate(templateHTML: string, data: CertificateData): string {
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateHTML, 'text/html');

  // Populate text fields
  const fields = {
    'our_ref': data.ourRef,
    'your_ref': data.yourRef,
    'date': data.date,
    'certificate_number': data.certificateNumber,
    'bearer_name': data.bearerName,
    'native_of': data.nativeOf,
    'village': data.village
  };

  // Update each field
  Object.entries(fields).forEach(([id, value]) => {
    const element = doc.getElementById(id);
    if (element && value) {
      element.textContent = value;
      element.classList.remove('placeholder');
    }
  });

  // Handle QR code if provided
  if (data.qrCode) {
    const qrContainer = doc.getElementById('qr_code_placeholder');
    if (qrContainer) {
      qrContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code for Certificate Verification" style="width: 100%; height: 100%; object-fit: contain;" />`;
    }
  }

  // Return the modified HTML
  return doc.documentElement.outerHTML;
}

/**
 * Creates a complete certificate HTML with populated data
 * @param data - Certificate data object
 * @returns Promise<string> - The complete populated HTML
 */
export async function createCertificateHTML(data: CertificateData): Promise<string> {
  const template = await loadCertificateTemplate();
  return populateTemplate(template, data);
}

/**
 * Opens a new window with the certificate for printing
 * @param html - The complete certificate HTML
 */
export function printCertificate(html: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    
    // Fallback for browsers that don't support onload
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
  } else {
    console.error('Failed to open print window. Please check popup blocker settings.');
  }
}

/**
 * Downloads the certificate as an HTML file
 * @param html - The complete certificate HTML
 * @param filename - The filename for the download
 */
export function downloadCertificateHTML(html: string, filename: string = 'certificate.html'): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}