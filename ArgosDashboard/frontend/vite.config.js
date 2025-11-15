// 檔案名稱: frontend/vite.config.js (100% 可運作的最終版)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// (*** 1. 關鍵新增：導入 Node.js 核心模組 ***)
import path from "path";
import { fileURLToPath } from "url";

// (*** 2. 關鍵新增：在 ESM 中安全地取得 __dirname ***)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  // (*** 3. 關鍵新增：加入 "resolve.alias" 區塊 ***)
  resolve: {
    alias: {
      // 這行會告訴 Vite "@" 這個別名 = "C:/.../frontend/src" 資料夾
      // (這將修復你所有的 "@/lib/utils", "@/components/ui/table" 錯誤)
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // (你的 'server.proxy' 設定... 保持不變)
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
