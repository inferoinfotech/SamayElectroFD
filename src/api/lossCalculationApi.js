import apiClient from "./axios";

// Monthly losses calculation
export const generateLossesCalculation = async (data) => {
  try {
    const response = await apiClient.post("/losses-calculation/generate-losses-calculation", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const downloadLossesCalculation = async (id) => {
  try {
    const response = await apiClient.get(`/losses-calculation/download-losses-calculation/${id}`, {
      responseType: 'blob',
    });

    // Return both data and headers
    return {
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getLossesDataLastFourMonths = async (data) => {
  try {
    const response = await apiClient.post("/losses-calculation/get-losses-data-last-four-months", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getLatestLossesCalculation = async () => {
  try {
    const response = await apiClient.get("/losses-calculation/latest");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Total Report APIs
export const generateTotalReport = async (data) => {
  try {
    const response = await apiClient.post("/total-report/generate-total-report", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const downloadTotalReport = async (id) => {
  try {
    const response = await apiClient.get(`/total-report/download/${id}`, {
      responseType: 'blob'
    });

    // Return both data and headers to access Content-Disposition
    return {
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const downloadTotalReportPdf = async (id) => {
  try {
    const response = await apiClient.get(`/total-report/downloadPdf/${id}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });

    return {
      data: response.data,
      filename: response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
        : `Total Generation Unit Sheet ${new Date().getMonth() + 1}-${new Date().getFullYear()}.pdf`
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getLatestTotalReport = async () => {
  try {
    const response = await apiClient.get("/total-report/latest");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// Daily Report APIs
export const generateDailyReport = async (data) => {
  try {
    const response = await apiClient.post("/daily-report/generate-daily-report", data);
    return response.data;
  } catch (error) {
    // Return the entire error response data if available
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { message: error.message };
  }
};

export const downloadDailyReport = async (id) => {
  try {
    const response = await apiClient.get(`/daily-report/download/${id}`, {
      responseType: 'blob',
    });

    // Return both data and headers
    return {
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getLatestDailyReport = async () => {
  try {
    const response = await apiClient.get("/daily-report/latest");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
// Yearly Report APIs
export const generateYearlyReport = async (data) => {
  try {
    const response = await apiClient.post("/totalDataYearily/data", data, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });

    return {
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};