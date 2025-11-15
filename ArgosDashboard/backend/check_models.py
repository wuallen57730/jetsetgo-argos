import os
import google.generativeai as genai
import sys
from dotenv import load_dotenv

# --- (2. 在所有程式碼之前，立刻載入 .env 檔案) ---
load_dotenv()


def check_available_models():
    """
    這個腳本會連接 Google AI，
    並列出所有你的 API Key 有權限存取、
    且支援 'generateContent' 的模型。
    """
    try:
        # 1. 讀取 API Key (必須先在終端機設定)
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            print("錯誤：找不到 GOOGLE_API_KEY 環境變數。")
            print("請先在你的 Git Bash 終端機中執行:")
            print("export GOOGLE_API_KEY='你的金鑰'")
            sys.exit(1) # 退出腳本

        genai.configure(api_key=api_key)

        print("成功連線至 Google AI。正在查詢可用的 'generateContent' 模型...")
        print("=============================================================")

        found_model = False
        
        # 2. 迭代所有模型並檢查支援的方法
        for m in genai.list_models():
            # 我們只關心支援 'generateContent' 的模型
            if 'generateContent' in m.supported_generation_methods:
                print(f"✅ 模型名稱 (Name): {m.name}")
                print(f"   顯示名稱 (Display Name): {m.display_name}")
                print(f"   支援方法: {m.supported_generation_methods}")
                print("-------------------------------------------------------------")
                found_model = True

        if not found_model:
            print("錯誤：找不到任何支援 'generateContent' 的模型。")
            print("請檢查你的 Google AI Studio 專案或 API 金鑰權限。")
        else:
            print("\n查詢完畢。")
            print("👉 請複製上面列出的 '模型名稱 (Name)' (例如 'models/gemini-1.5-pro-latest')")
            print(f"👉 然後貼到 main.py 的第 146 行。")

    except Exception as e:
        print(f"\n發生錯誤：{e}")
        print("請檢查你的 API 金鑰是否正確，或網路連線。")

if __name__ == "__main__":
    check_available_models()