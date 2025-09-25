# Image Portrait Converter

Small client-side web app to batch-convert images into portrait-friendly canvas sizes (default 4:5 for Instagram posts). The app runs fully in the browser and requires no backend.

Files added
- `index.html` — UI and inputs
- `style.css`  — simple responsive styles
- `script.js`  — image processing and automatic downloads

How to run

1. Start a simple HTTP server from the project root (required so image blobs and downloads behave correctly):

```bash
# Python 3
python3 -m http.server 8000

# or using Node (if you have http-server installed)
npx http-server -c-1 .
```

2. Open http://localhost:8000 in your browser and use the UI.

Notes
- The app preserves image proportions and centers the scaled image inside a background canvas filled with the chosen color (default gray).
- Output files keep the original filename with a `_converted` suffix and the chosen format (JPEG/PNG).
- All processing is client-side; large images may consume memory and time in the browser.

Future improvements
- Background color picker is present; add presets and saved choices.
- Allow explicit pixel target sizes and quality settings.
- Add drag-and-drop, batch zip download, and aspect presets.
# Automation_Tools
Automation tools web app for multiple use cases
