// 檔案名稱: frontend/src/main.jsx (還原)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// (已移除 ThemeProvider)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
