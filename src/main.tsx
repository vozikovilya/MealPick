import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./utils/debugStorage"; // Утилиты отладки localStorage

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
