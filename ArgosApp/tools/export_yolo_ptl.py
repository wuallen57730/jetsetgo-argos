#!/usr/bin/env python3
"""
Utility script to convert a trained YOLO (or any PyTorch) model checkpoint
into a Lite Interpreter friendly .ptl artifact for Android.

Example:
    python tools/export_yolo_ptl.py \
        --weights runs/train/weights/best.pt \
        --output app/src/main/assets/yolov8s.ptl

If your checkpoint only contains a state_dict, provide --model-class so the
script can instantiate the architecture before loading the weights.
"""

import argparse
import importlib
import sys
from pathlib import Path
from typing import Any, Optional

import torch
from torch.nn import Module
from torch.serialization import add_safe_globals
from torch.utils.mobile_optimizer import optimize_for_mobile

try:
    from ultralytics.nn.tasks import DetectionModel  # type: ignore
except Exception:  # pragma: no cover - ultralytics optional
    DetectionModel = None

if DetectionModel is not None:  # pragma: no cover
    add_safe_globals([DetectionModel])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export a PyTorch YOLO checkpoint to a .ptl model for Android."
    )
    parser.add_argument(
        "--weights",
        required=True,
        type=Path,
        help="Path to the trained .pt/.pth checkpoint file.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Destination path for the .ptl file (defaults to <weights>.ptl).",
    )
    parser.add_argument(
        "--model-class",
        type=str,
        default=None,
        help=(
            "Optional fully qualified class path used to instantiate the model "
            "when the checkpoint only contains a state dict, e.g., "
            "\"models.yolo.Model\"."
        ),
    )
    parser.add_argument(
        "--state-dict-key",
        type=str,
        default=None,
        help=(
            "Checkpoint key that stores the state_dict. "
            "If omitted, the script tries 'model_state_dict', 'state_dict', "
            "or treats the entire checkpoint as a state dict."
        ),
    )
    parser.add_argument(
        "--img-size",
        type=int,
        default=640,
        help="Input resolution (square) used when tracing the model. Default: 640.",
    )
    return parser.parse_args()


def instantiate_model(class_path: str) -> Module:
    module_name, class_name = class_path.rsplit(".", maxsplit=1)
    module = importlib.import_module(module_name)
    model_class = getattr(module, class_name)
    model = model_class()
    if not isinstance(model, Module):
        raise TypeError(f"{class_path} is not a torch.nn.Module subclass")
    return model


def extract_model(
    checkpoint: Any,
    model_class: Optional[str],
    state_dict_key: Optional[str],
) -> Module:
    if isinstance(checkpoint, Module):
        return checkpoint

    if isinstance(checkpoint, dict):
        if isinstance(checkpoint.get("model"), Module):
            return checkpoint["model"]

        candidate_keys = [state_dict_key] if state_dict_key else []
        candidate_keys += ["model_state_dict", "state_dict"]

        for key in candidate_keys:
            if key and key in checkpoint:
                if not model_class:
                    raise ValueError(
                        f"Checkpoint contains '{key}' but --model-class was not provided."
                    )
                model = instantiate_model(model_class)
                model.load_state_dict(checkpoint[key])
                return model

        if model_class:
            model = instantiate_model(model_class)
            model.load_state_dict(checkpoint)
            return model

    raise ValueError(
        "Unable to recover a torch.nn.Module from the checkpoint. "
        "Provide --model-class if the file only contains a state_dict."
    )


def compile_module(model: Module, img_size: int) -> torch.jit.ScriptModule:
    try:
        return torch.jit.script(model)
    except Exception as script_error:
        print(f"[export_yolo_ptl] torch.jit.script failed, falling back to trace: {script_error}")
        example = torch.randn(1, 3, img_size, img_size)
        traced = torch.jit.trace(model, example, strict=False)
        traced = torch.jit.freeze(traced)
        return traced


def main() -> None:
    args = parse_args()

    if not args.weights.exists():
        sys.exit(f"Checkpoint not found: {args.weights}")

    output_path = args.output or args.weights.with_suffix(".ptl")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    checkpoint = torch.load(args.weights, map_location="cpu", weights_only=False)
    model = extract_model(checkpoint, args.model_class, args.state_dict_key)
    model.eval()
    model = model.float()

    scripted = compile_module(model, args.img_size)
    optimized = optimize_for_mobile(scripted)
    optimized._save_for_lite_interpreter(str(output_path))

    print(f"Saved Lite model to {output_path}")


if __name__ == "__main__":
    main()

