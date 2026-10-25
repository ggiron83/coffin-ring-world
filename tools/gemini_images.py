"""Generate region thumbnails with the Gemini API.

Prompts come from content/prompts.js (the same file the site reads).
The API key is read from the GEMINI_API_KEY environment variable.

    python tools/gemini_images.py --list-models
    python tools/gemini_images.py                 # generate missing images
    python tools/gemini_images.py --only severya --force
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROMPTS_FILE = ROOT / "content" / "prompts.js"
IMAGES_DIR = ROOT / "images"
API = "https://generativelanguage.googleapis.com/v1beta"
DEFAULT_MODEL = "gemini-3.1-flash-image"


def load_prompts():
    text = PROMPTS_FILE.read_text(encoding="utf-8")
    body = text[text.index("{"): text.rindex("}") + 1]
    return json.loads(body)


def call(url, key, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, method="POST" if data else "GET")
    req.add_header("x-goog-api-key", key)
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=180) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        raise SystemExit(f"API error {e.code}: {detail}")


def list_models(key):
    res = call(f"{API}/models?pageSize=200", key)
    for m in res.get("models", []):
        name = m["name"].removeprefix("models/")
        if "image" in name:
            print(name)


def generate(key, model, prompt, aspect):
    config = {"responseModalities": ["IMAGE"]}
    if aspect:
        config["imageConfig"] = {"aspectRatio": aspect}
    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": config}
    res = call(f"{API}/models/{model}:generateContent", key, payload)
    for cand in res.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline:
                return base64.b64decode(inline["data"])
    raise SystemExit("No image in response: " + json.dumps(res, ensure_ascii=False)[:800])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--only", nargs="*", help="region ids to generate")
    ap.add_argument("--force", action="store_true", help="overwrite existing images")
    ap.add_argument("--aspect", default="16:9", help='aspect ratio, "" to omit')
    ap.add_argument("--list-models", action="store_true")
    args = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set. Get a key at https://aistudio.google.com/apikey")

    if args.list_models:
        list_models(key)
        return

    prompts = load_prompts()
    style = prompts.pop("STYLE", "")
    prompts.pop("NEGATIVE", None)
    ids = args.only or list(prompts)
    IMAGES_DIR.mkdir(exist_ok=True)

    for rid in ids:
        if rid not in prompts:
            print(f"skip {rid}: no prompt")
            continue
        out = IMAGES_DIR / f"{rid}.png"
        if out.exists() and not args.force:
            print(f"skip {rid}: {out.name} exists (use --force)")
            continue
        print(f"generating {rid} with {args.model} ...")
        out.write_bytes(generate(key, args.model, f"{prompts[rid]} {style}".strip(), args.aspect))
        print(f"  saved {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
