// FIX: Implemented the file service to create and download an evidence package.
import JSZip from 'jszip';
import saveAs from 'file-saver';
import type { UploadedFile, ReportData } from '../types';

/**
 * Generates an HTML string from the report data.
 * @param reportData - The accident report data.
 * @returns An HTML string representing the report.
 */
const generateReportHtml = (reportData: ReportData): string => {
  const { accident, vehicles, drivers, insurance, witnesses, signatures, diagram } = reportData;
  
  const renderVehicle = (index: number) => {
    if (!vehicles[index] || !drivers[index] || !insurance[index]) return '';
    return `
      <div class="section">
        <h3>Vehicle ${vehicles[index].label}</h3>
        <p><strong>License Plate:</strong> ${vehicles[index].plate}</p>
        <p><strong>Make/Model:</strong> ${vehicles[index].make_model}</p>
        <p><strong>Initial Impact:</strong> ${vehicles[index].first_impact}</p>
        <p><strong>Manoeuvre:</strong> ${vehicles[index].manoeuvre}</p>
      </div>
      <div class="section">
        <h3>Driver ${drivers[index].vehicle}</h3>
        <p><strong>Name:</strong> ${drivers[index].name}</p>
        <p><strong>License No:</strong> ${drivers[index].licence_no}</p>
        <p><strong>Phone:</strong> ${drivers[index].phone}</p>
        <p><strong>Statement:</strong> ${drivers[index].statement}</p>
      </div>
      <div class="section">
        <h3>Insurance ${insurance[index].vehicle}</h3>
        <p><strong>Company:</strong> ${insurance[index].company}</p>
        <p><strong>Policy No:</strong> ${insurance[index].policy_no}</p>
      </div>
    `;
  };
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Accident Report</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; color: #333; }
        h1, h2, h3 { color: #111; }
        .container { max-width: 800px; margin: auto; }
        .section { border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .signature-box { margin-top: 2rem; }
        .signature-box img { border: 1px solid #ccc; border-radius: 4px; }
        .diagram-container { margin-top: 1rem; }
        .diagram-container img, .diagram-container svg { max-width: 100%; height: auto; border: 1px solid #eee; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Accident Report</h1>
        
        <div class="section">
          <h2>General Information</h2>
          <p><strong>Date & Time:</strong> ${new Date(accident.timestamp).toLocaleString()}</p>
          <p><strong>Location:</strong> ${accident.geo.address}</p>
          <p><strong>Weather:</strong> ${accident.weather}</p>
          <p><strong>Light Conditions:</strong> ${accident.light}</p>
        </div>
        
        <h2>Parties Involved</h2>
        <div class="grid">
          <div>${renderVehicle(0)}</div>
          <div>${renderVehicle(1)}</div>
        </div>

        ${witnesses.length > 0 ? `
        <div class="section">
            <h2>Witnesses</h2>
            ${witnesses.map(w => `<p><strong>${w.name}:</strong> ${w.phone}</p>`).join('')}
        </div>
        ` : ''}

        <div class="section">
          <h2>Accident Visuals</h2>
          <div class="grid">
            <div class="diagram-container">
              <h3>AI Generated Sketch</h3>
              ${diagram.sketch_base64 ? `<img src="data:image/png;base64,${diagram.sketch_base64}" alt="AI sketch" />` : '<p>Not available</p>'}
            </div>
            <div class="diagram-container">
              <h3>Interactive Diagram</h3>
              ${diagram.svg}
            </div>
          </div>
        </div>

        <h2>Signatures</h2>
        <div class="grid">
          <div class="signature-box">
            <h3>Driver A</h3>
            ${signatures.A ? `<img src="${signatures.A}" alt="Driver A Signature" width="200" />` : '<p>Not signed</p>'}
          </div>
          <div class="signature-box">
            <h3>Driver B</h3>
            ${signatures.B ? `<img src="${signatures.B}" alt="Driver B Signature" width="200" />` : '<p>Not signed</p>'}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};


/**
 * Creates a zip file containing the report and all uploaded media files.
 * @param reportData - The finalized report data.
 * @param uploadedFiles - The array of files uploaded by the user.
 */
export const createEvidencePackage = async (reportData: ReportData, uploadedFiles: UploadedFile[]): Promise<void> => {
    const zip = new JSZip();

    // 1. Generate and add the HTML report
    const reportHtml = generateReportHtml(reportData);
    zip.file("Accident_Report.html", reportHtml);

    // 2. Add all uploaded files to a 'media' folder within the zip
    const mediaFolder = zip.folder("media");
    if (mediaFolder) {
        // Add the AI sketch as a PNG file
        if (reportData.diagram.sketch_base64) {
            mediaFolder.file("Accident_Sketch.png", reportData.diagram.sketch_base64, { base64: true });
        }
        
        for (const uploadedFile of uploadedFiles) {
            mediaFolder.file(uploadedFile.file.name, uploadedFile.file);
        }
    }

    // 3. Generate the zip file and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Accident_Evidence_Package_${new Date().toISOString().split('T')[0]}.zip`);
};