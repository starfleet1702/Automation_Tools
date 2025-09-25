# Requirements

## Project Overview
A simple web app built with **HTML, CSS, and JavaScript** that allows users to upload multiple images, resize them into a portrait-friendly aspect ratio suitable for Instagram posts, and download the processed images.  

The empty space around the resized image should be filled with a **grey background** by default, but this should be **modifiable** for future changes.

---

## Functional Requirements

### Inputs
- User can **select multiple images** from their device gallery using a file picker (`<input type="file" multiple>`).

### Actions
- A **Convert** button will trigger the processing of all selected images.

### Processing
- Each image will be:
  - Resized to fit within a fixed **Instagram post aspect ratio** (default: 4:5 portrait).
  - Preserved without distortion (scaled proportionally).
  - Placed onto a canvas with **grey background** filling the empty space.
  - Exported as a **JPEG or PNG**.

### Outputs
- All processed images will be **automatically downloaded** back to the user’s gallery (or device storage).
- Each output image should keep its **original filename** with an added suffix (e.g., `image1_converted.jpg`).

---

## Non-Functional Requirements
- App should run fully **client-side** (no backend).
- Must work on **desktop and mobile browsers**.
- Code should be **structured and modular**, with:
  - `index.html` → UI structure
  - `style.css` → styling
  - `script.js` → logic for processing and downloads

---

## Future Modifications (Extensibility)
- Background color configurable (e.g., grey → user’s choice).
- Aspect ratio options (e.g., 1:1 square, 9:16 story).
- Batch ZIP download of processed images.
- Drag-and-drop support for uploading files.

---

## UI Wireframe (Concept)

-----------------------------------
|  Upload Images [Choose Files]   |
|                                 |
|  [ Convert ]                    |
|                                 |
|  Output: Auto-download images   |
-----------------------------------
