import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { TestingUserProvider } from "./context/CurrentUserContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TestingUserProvider>
        <App />
      </TestingUserProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
