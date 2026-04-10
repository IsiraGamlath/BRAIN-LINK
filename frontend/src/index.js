import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { TestingUserProvider } from "./context/CurrentUserContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast/Toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <TestingUserProvider>
            <App />
          </TestingUserProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
reportWebVitals();
