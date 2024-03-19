import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Reference: https://github.com/vitejs/vite/issues/15305#issuecomment-1849900351
  worker: {
    format: "es",
  },
});
