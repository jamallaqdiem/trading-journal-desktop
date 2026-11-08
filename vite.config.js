import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    root: path.join(__dirname, "client"),
    base: "./",
    build: {
      outDir: path.join(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      //  VITE_PORT for Vite, fallback to 5173
      port: Number(env.VITE_PORT) || 5173,
    },
  };
});
