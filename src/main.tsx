import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Importar diagnóstico (não usado diretamente, mas disponibiliza no console)
import "./utils/testSupabaseConnection";


const rootElement = document.getElementById("root");


if (!rootElement) {
  throw new Error("Root element not found");
}

// Error boundary simples com window.onerror
window.addEventListener('error', (event) => {
  console.error('Erro capturado:', event.error);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: 50px auto;">
        <h1 style="color: #EF4444;">Erro ao carregar o app</h1>
        <p style="color: #6B7280; margin: 10px 0;"><strong>Erro:</strong> ${event.error?.message || event.message || 'Erro desconhecido'}</p>
        <p style="color: #6B7280;">Verifique o console (F12) para mais detalhes.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0066FF; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Recarregar Página
        </button>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada:', event.reason);
});

// Error boundary simples
try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error("Erro ao renderizar app:", error);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: 50px auto;">
        <h1 style="color: #EF4444;">Erro ao carregar o app</h1>
        <p style="color: #6B7280; margin: 10px 0;"><strong>Erro:</strong> ${error instanceof Error ? error.message : String(error)}</p>
        <p style="color: #6B7280;">Verifique o console (F12) para mais detalhes.</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0066FF; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Recarregar Página
        </button>
      </div>
    `;
  }
} 