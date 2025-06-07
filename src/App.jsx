import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChangePassword from "./components/ChangePassword";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./guards/ProtectedRoute";
import AuthenticatedRoute from "./guards/AuthenticatedRoute";
import ClientTableUI from "./components/LeadGeneration/ClientTableUI";
import UploadMeterFile from "./components/UploadFile/UploadMeterFile";
import ViewClients from "./components/LeadGeneration/ViewClients";
import Dashboard from "./components/Dashboard/Dashboard";
import ClientDetails from "./components/LeadGeneration/ClientDetails";
import MonthlyGeneration from "./components/Reports/MonthlyGeneration";
import DailyGeneration from "./components/Reports/DailyGeneration";
import TotalGeneration from "./components/Reports/TotalGeneration";
import UploadLoggerFile from "./components/UploadFile/UploadLoggerFile";
import ClientProgressReport from "./components/ClientProgress/ClientProgressReport";
import YearlyGeneration from "./components/Reports/YearlyGeneration";

const App = () => {
  return (
    <Routes>
      {/* Prevent logged-in users from accessing login & forgot-password */}
      <Route element={<AuthenticatedRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes - Only accessible if logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="lead" element={<ClientTableUI />} />
          <Route path="allclients" element={<ViewClients />} />
          <Route path="clients/:id/details" element={<ClientDetails />} />
          <Route path="meter-data" element={<UploadMeterFile />} />
          <Route path="logger-data" element={<UploadLoggerFile />} />
          <Route path="loss-calculation-file" element={<MonthlyGeneration />} />
          <Route path="daily-generation" element={<DailyGeneration />} />
          <Route path="total-generation" element={<TotalGeneration />} />
          <Route path="yearly-generation" element={<YearlyGeneration />} />
          <Route path="client-progress" element={<ClientProgressReport />} />
        </Route>
        <Route path="/change-password" element={<ChangePassword />} />
      </Route>

      {/* Redirect to login if no valid route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;