import apiClient from "./axios";

// Create a new client progress entry
export const createClientProgress = async (clientProgressData) => {
  try {
    const response = await apiClient.post("/client-progress", clientProgressData);
    return response.data;
  } catch (error) {
    console.error("Error creating client progress:", error);
    throw error;
  }
};

// Update a client progress entry by ID
export const updateClientProgress = async (id, updateData) => {
  try {
    const response = await apiClient.put(`/client-progress/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating client progress:", error);
    throw error;
  }
};

// Get client progress entries by month and year
export const getClientProgressByMonthYear = async (month, year) => {
  try {
    const response = await apiClient.get(`/client-progress/${month}/${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching client progress:", error);
    throw error;
  }
};

// Add this function to your existing client progress API functions
export const downloadClientProgressExcel = async (month, year) => {
  try {
    const response = await apiClient.get(`/client-progress/download-excel/${month}/${year}`, {
      responseType: 'blob',
    });

    // Return both data and headers
    return {
      data: response.data,
      headers: response.headers,
      filename: response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : `ClientProgress_${month}_${year}.xlsx`
    };
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};