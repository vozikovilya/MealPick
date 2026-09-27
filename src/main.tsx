import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./utils/debugStorage"; // Утилиты отладки localStorage
import "./utils/diagnoseFamily"; // Диагностика сохранения семьи

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
