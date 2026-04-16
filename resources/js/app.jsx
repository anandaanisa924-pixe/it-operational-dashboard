import React from "react";
import { createRoot } from 'react-dom/client';
import Dashboard from "./pages/Dashboard";
import "./styles/dashboard.css";

function App() {
    return <Dashboard/>;

}

createRoot (document.getElementById("app")).render(<App />);