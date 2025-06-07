import apiClient from "./axios"

// Create client progress field configuration
export const createClientProgressField = async (configData) => {
    try {
        const response = await apiClient.post("/client-progress-filed", configData)
        return response.data
    } catch (error) {
        console.error("Error creating client progress field:", error)
        throw error
    }
}

// Get all client progress field configurations
export const getAllClientProgressField = async () => {
    try {
        const response = await apiClient.get("/client-progress-filed")
        return response.data
    } catch (error) {
        console.error("Error fetching client progress fields:", error)
        throw error
    }
}

// Get client progress field by ID
export const getClientProgressFieldById = async (id) => {
    try {
        const response = await apiClient.get(`/client-progress-filed/${id}`)
        return response.data
    } catch (error) {
        console.error("Error fetching client progress field:", error)
        throw error
    }
}

// Update client progress field configuration
export const updateClientProgressField = async (id, updateData) => {
    try {
        const response = await apiClient.put(`/client-progress-filed/${id}`, updateData)
        return response.data
    } catch (error) {
        console.error("Error updating client progress field:", error)
        throw error
    }
}

// Delete client progress field configuration
export const deleteClientProgressField = async (id) => {
    try {
        const response = await apiClient.delete(`/client-progress-filed/${id}`)
        return response.data
    } catch (error) {
        console.error("Error deleting client progress field:", error)
        throw error
    }
}

// Delete client from progress field configuration
export const deleteClientFromProgressField = async (clientId) => {
    try {
        const response = await apiClient.patch(`/client-progress-filed/delete-client/${clientId}`)
        return response.data
    } catch (error) {
        console.error("Error deleting client from progress field:", error)
        throw error
    }
}
