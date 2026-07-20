# Pixel Switch

A simple web-based tool designed for pixel artists to manipulate, swap, and adjust color palettes without breaking the balance of their artwork. Built purely with HTML, CSS, and JavaScript.

- Find pixels that are 1-2 shades off from your palette and fix instantly.
- Merge close shades into one
- Swap one specific color into a different one
- Create patterns without changing the pixel count for each of your colors.
- ! This tool is only for swapping around, not for drawing.

## Live Demo
[Click here to use online](https://fruhuszar.github.io/PixelSwitch/)

## Features & How to Use

### Color Palette & Editing
*   **Color List:** Each row displays a color, its hex code, and its pixel count. Click a color to select it for the Pen or Bucket tool. Edit the hex text to instantly update every pixel using that color across the image.
*   **Transparent Pixels:** Fully transparent pixels appear in the list with a checkered icon. They act like regular colors and can be swapped or filled. To turn any color transparent (like removing a background), simply type `transparent` into its hex code box.

### Tools & Pixel Manipulation
*   **Pen (Swap Pixels):** Select a color from the list, then click any pixel on the canvas. That pixel trades places with a random pixel of your selected color, ensuring your overall color counts never change.
*   **Lock (Strict Swap):** Click one pixel, then click a second pixel. These two specific pixels will trade colors. This gives you exact control over which pixels change, instead of using the random swap.
*   **Bucket (Fill Swap):** Select a color from the list, then click a target color on the canvas. The two colors will trade places in bulk. If one color has fewer pixels than the other, only that maximum amount will trade places, leaving the rest unchanged.

### Navigation & Export
*   **Zoom & Pan:** Use the magnifier buttons to zoom in or out. Click and drag to pan around the canvas, or pinch to zoom on touch screens.
*   **Download & Clear:** 
    *   **Download:** Saves your edited image as a crisp PNG file.
    *   **Clear:** Removes the current image so you can start fresh. *Note: This action cannot be undone.*

## Technology Stack
*   **HTML5 Canvas** - For rendering and accurate pixel manipulation.
*   **CSS3** - For a clean, pixel-art aesthetic interface.
*   **Vanilla JavaScript (ES6)** - Handles all image processing, state management, and custom color-swapping logic.
