import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <Toaster position="top-right"/>
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>
  </ThemeProvider>
);
