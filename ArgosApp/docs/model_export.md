# YOLO 模型匯出成 .ptl

此專案提供 `tools/export_yolo_ptl.py` 腳本，可將訓練完成的 PyTorch / YOLO 權重轉換為行動端可用的 `.ptl` 檔案，供 Android App 透過 PyTorch Lite 載入。

## 安裝需求

```bash
pip install torch ultralytics
```

> 若你的模型不是使用 Ultralytics YOLO，可移除 `ultralytics`，但必須確保能在腳本中正常載入 `torch.nn.Module`。

## 使用方式

```bash
python tools/export_yolo_ptl.py \
  --weights runs/train/weights/best.pt \
  --output app/src/main/assets/yolov8s.ptl
```

- `--weights`：訓練完成的 `.pt`／`.pth` 檔。
- `--output`：輸出 `.ptl` 位置（未指定則為 `<weights>.ptl`）。
- `--model-class`：若 checkpoint 只有 `state_dict`，需提供模型類別，例如 `models.yolo.Model`。
- `--state-dict-key`：自訂 checkpoint 中 state dict 的 key，預設會依序尋找 `model_state_dict`、`state_dict`。

## 放入 Android App

1. 將轉出的 `.ptl` 放到 `app/src/main/assets/`。
2. 更新 `YoloProcessor` 的 `MODEL_FILE_CANDIDATES` 以包含該檔名。
3. 重新組建 App，即可在行動端載入 Lite 模型。

