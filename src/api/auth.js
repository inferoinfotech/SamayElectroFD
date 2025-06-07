import apiClient from "./axios";

export const loginUser = async (data) => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

// Logout function
export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
    sessionStorage.removeItem("token");
    return true;
  } catch (error) {
    console.error("Logout Failed:", error);
    return false;
  }
};

// Get user profile
export const getUserProfile = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

// Forgot Password - Send OTP
export const sendOTP = async (email) => {
  try {
    const response = await apiClient.post("/auth/forget-password", { email });
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await apiClient.post("/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

// Reset Password
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Change Password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = sessionStorage.getItem("token"); // Get token from sessionStorage

    const response = await apiClient.post(
      "/auth/reset-password-with-old-password",
      { oldPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Attach token in headers
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};