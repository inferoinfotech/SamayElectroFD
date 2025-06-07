import apiClient from "./axios";

export const uploadMeterCSV = async (files, month, year) => {
  const formData = new FormData();
  
  // Append each file to the form data
  files.forEach(file => {
    formData.append('csvFile', file);
  });
  
  // Add month and year
  formData.append('month', month);
  formData.append('year', year);

  try {
    const response = await apiClient.post('/meter-data/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getMeterData = async (mainClientId, month, year) => {
  try {
    const response = await apiClient.post("/meter-data/show-meter-data", {
      month,
      year,
      mainClientId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteMeterData = async (id) => {
  try {
    const response = await apiClient.delete(`/meter-data/delete-meter-data/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const uploadLoggerCSV = async (files, month, year) => {
  const formData = new FormData();
  
  // Append each file to the form data
  files.forEach(file => {
    formData.append('csvFile', file);
  });
  
  // Add month and year
  formData.append('month', month);
  formData.append('year', year);

  try {
    const response = await apiClient.post('/logger-data/upload-logger-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getLoggerData = async (month, year) => {
  try {
    const response = await apiClient.get(`/logger-data/get-logger-data/${month}/${year}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteLoggerData = async (id) => {
  try {
    const response = await apiClient.delete(`/logger-data/delete-logger-data/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const downloadCSVTemplate = async () => {
  // Create the header row with company names
  const headers = [
    "Name",
    "RACHANA ART PRINTS PVT. LTD.",
    "SWASTIK POLY PRINTS PVT. LTD.",
    "SEEMA SANJAY AGRAWAL",
    "KANISHKA PRINTS PVT. LTD.",
    "RH TEXTILES",
    "PALLAV TEXTILES",
    "S.K.WEAVING PVT. LTD.",
    "MAHAKALI STONE QUARRY",
    "BHAARAT SPINNING MILLS LLP",
    "AUMGENE BIOSCIENCES PRIVATE LIMITED",
    "HI-CHOICE PROCESSORS PRIVATE LIMITED",
    "SHREE OM SAI METAL AGGREGATE LLP",
    "ELEMENT KNITTS",
    "AMARDEEP METAL WORKS",
    "MITTAL FILAMENTS PRIVATE LIMITED",
    "SACHINAM FABRICS PRIVATE LIMITED",
    "RAVI EXPORTS LIMITED",
    "SHREE HARI TEX FAB",
    "JIGISHA FIBERS PVT. LTD.",
    "WAMPUM SYNTEX PRIVATE LIMITED",
    "DEV LIFESTYLE",
    "ANAYAA KNITWELL",
    "TRIBENI PROCESSORS PRIVATE LIMITED",
    "KADMAWALA INDUSTRIES PRIVATE LIMITED",
    "KADMAWALA DYEING AND PRINTING PRIVATE",
    "POOJA TRENDZ PRIVATE LIMITED",
    "SHRI PANCHWATI TEXTILES INDUSTRIES PRIVATE LIMITED",
    "GLOBELA PHARMA PRIVATE LIMITED",
    "EMINENT PAPER INDUSTRIES LLP",
    "SHRI MUNIVEER SPINNING MILLS"
  ];

  // Create the meter numbers row
  const meterNumbers = [
    "Date",
    "DG0260B",
    "DG0256B",
    "DG0258B",
    "DG0254B",
    "DG0252B",
    "DG0250B",
    "DG0316B",
    "DG0462B",
    "DG0464B",
    "DG0448B",
    "DG0450B",
    "DG0452B",
    "DG0454B",
    "DG0456B",
    "DG0458B",
    "DG0460B",
    "DG0470B",
    "DG0466B",
    "DG0468B",
    "DG0478B",
    "DG0472B",
    "DG0474B",
    "DG0476B",
    "DG0486B",
    "DG0484B",
    "DG0482B",
    "DG0480B",
    "DG1023B",
    "DG1047B",
    "DG1150B"
  ];

  // Create empty rows for dates (31 days)
  const dateRows = [];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  
  // Add first date row
  const firstDate = new Date(year, month - 1, 1);
  dateRows.push([firstDate.toISOString().split('T')[0], ...Array(headers.length - 1).fill('')]);
  
  // Add remaining date rows (up to 30 more)
  for (let i = 1; i < 31; i++) {
    const nextDate = new Date(year, month - 1, i + 1);
    // Stop if we've moved to the next month
    if (nextDate.getMonth() !== month - 1) break;
    dateRows.push([nextDate.toISOString().split('T')[0], ...Array(headers.length - 1).fill('')]);
  }

  // Combine all rows
  const rows = [headers, meterNumbers, ...dateRows];

  // Convert to CSV
  let csvContent = rows.map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\r\n');

  return csvContent;
};