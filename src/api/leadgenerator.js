import apiClient from "./axios";

// Main Client APIs
export const addMainClient = async (clientData) => {
    try {
        const response = await apiClient.post("/mainClient/add", clientData);
        return response.data;
    } catch (error) {
        console.error("Error adding main client:", error);
        throw error;
    }
};

export const editMainClientField = async (clientId, fieldName, newValue) => {
    try {
        const response = await apiClient.put("/mainClient/edit", {
            clientId,
            fieldName,  // This should be in dot notation (e.g., "abtMainMeter.meterNumber")
            newValue,
        });
        return response.data;
    } catch (error) {
        console.error("Error editing main client field:", error);
        throw error;
    }
};

export const getAllMainClients = async () => {
    try {
        const response = await apiClient.get("/mainClient");
        return response.data.clients;
    } catch (error) {
        console.error("Error fetching main clients:", error);
        throw error;
    }
};

export const getMainClient = async (clientId) => {
    try {
        const response = await apiClient.get(`/mainClient/${clientId}`);
        return response.data.client;
    } catch (error) {
        console.error("Error fetching main client:", error);
        throw error;
    }
};

export const deleteMainClient = async (clientId) => {
    try {
        const response = await apiClient.delete(`/mainClient/${clientId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting main client:", error);
        throw error;
    }
};

// Sub Client APIs
export const addSubClient = async (subClientData) => {
    try {
        const response = await apiClient.post("/subClient/add", subClientData);
        return response.data;
    } catch (error) {
        console.error("Error adding sub client:", error);
        throw error;
    }
};

export const editSubClientField = async (clientId, fieldName, newValue) => {
    try {
        const response = await apiClient.put("/subClient/edit", {
            clientId,
            fieldName,  // Should be in dot notation (e.g., "abtMainMeter.meterNumber")
            newValue,
        });
        return response.data;
    } catch (error) {
        console.error("Error editing subclient field:", error);
        throw error;
    }
};

export const getAllSubClients = async () => {
    try {
        const response = await apiClient.get("/subClient");
        return response.data.subClients;
    } catch (error) {
        console.error("Error fetching sub clients:", error);
        throw error;
    }
};

export const getSubClient = async (subClientId) => {
    try {
        const response = await apiClient.get(`/subClient/${subClientId}`);
        return response.data.subClient;
    } catch (error) {
        console.error("Error fetching sub client:", error);
        throw error;
    }
};

export const deleteSubClient = async (subClientId) => {
    try {
        const response = await apiClient.delete(`/subClient/${subClientId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting sub client:", error);
        throw error;
    }
};

// Part Client APIs
export const addPartClientApi = async (partClientData) => {
    try {
        const response = await apiClient.post("/partClient/add", partClientData);
        return response.data;
    } catch (error) {
        console.error("Error adding part client:", error);
        throw error;
    }
};

export const editPartClientField = async (clientId, fieldName, newValue) => {
    try {
        const response = await apiClient.put("/partClient/edit", {
            clientId,
            fieldName,  // Should be in dot notation (e.g., "abtMainMeter.meterNumber")
            newValue,
        });
        return response.data;
    } catch (error) {
        console.error("Error editing partclient field:", error);
        throw error;
    }
};
export const getAllPartClients = async () => {
    try {
        const response = await apiClient.get("/partClient");
        return response.data.partClients;
    } catch (error) {
        console.error("Error fetching part clients:", error);
        throw error;
    }
};

export const getPartClients = async (clientId) => {
    try {
        const response = await apiClient.get(`/partClient/${clientId}`);
        return response.data.partClient;
    } catch (error) {
        console.error("Error fetching part client:", error);
        throw error;
    }
};

export const deletePartClient = async (clientId) => {
    try {
        const response = await apiClient.delete(`/partClient/${clientId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting part client:", error);
        throw error;
    }
};

// Helper function to transform nested fields for API submission
const transformNestedFields = (data) => {
    const transformed = { ...data };

    // Handle abtMainMeter fields
    if (data['abtMainMeter.meterNumber']) {
        transformed.abtMainMeter = transformed.abtMainMeter || {};
        transformed.abtMainMeter.meterNumber = data['abtMainMeter.meterNumber'];
        delete transformed['abtMainMeter.meterNumber'];
    }

    // Similarly handle other nested fields
    // Repeat for all nested field patterns

    return transformed;
};

// Combined save function for your form
export const saveClientHierarchy = async (formData) => {
    try {
        // 1. Save Main Client
        const mainClientData = transformNestedFields(formData.mainClient);
        const mainClient = await addMainClient(mainClientData);

        // 2. Save Sub Clients with mainClient reference
        const subClientsPromises = formData.subClients.map(async (subClient) => {
            const subClientData = {
                ...transformNestedFields(subClient),
                mainClient: mainClient._id
            };
            return await addSubClient(subClientData);
        });

        const subClients = await Promise.all(subClientsPromises);

        // 3. Save Part Clients with subClient references
        const partClientsPromises = Object.entries(formData.partClients).map(
            async ([subIndex, partClients]) => {
                const subClientId = subClients[subIndex]._id;
                return await Promise.all(
                    partClients.map(async (partClient) => {
                        const partClientData = {
                            ...transformNestedFields(partClient),
                            subClient: subClientId,
                        };
                        return await addPartClientApi(partClientData);
                    })
                );
            }
        );

        await Promise.all(partClientsPromises);

        return { success: true, mainClient, subClients, partClients: formData.partClients };
    } catch (error) {
        console.error("Error saving client hierarchy:", error);
        throw error;
    }
};

