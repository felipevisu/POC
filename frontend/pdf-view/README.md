# 📄 PDF Auto-Scroll Viewer

A web-based PDF viewer with automatic scrolling functionality. Load any PDF from your computer and enjoy hands-free reading with customizable scroll speed and zoom controls.

## ✨ Features

- **📁 PDF File Loading**: Load any PDF file from your computer
- **▶️ Auto-Scroll**: Automatic scrolling with play/pause functionality
- **⚡ Speed Control**: Adjustable scroll speed from 0.5x to 5.0x
- **🔍 Zoom Controls**: Zoom in/out to adjust PDF size (50% - 300%)
- **🔄 Reset Function**: Quick reset to return to the top of the document
- **📊 Real-time Info**: Display current page number and scroll position
- **🎨 Modern UI**: Beautiful gradient design with intuitive controls
- **📱 Responsive**: Works on desktop and mobile devices

## 🚀 How to Use

1. **Open the Application**

   - Open `index.html` in any modern web browser
   - No installation or server required!

2. **Load a PDF**

   - Click the "Choose PDF File" button
   - Select a PDF file from your computer
   - The PDF will automatically load and display

3. **Control Auto-Scroll**

   - **Play/Pause**: Click the Play button to start automatic scrolling, click Pause to stop
   - **Speed**: Use the speed slider to adjust scrolling speed (0.5x to 5.0x)
   - **Reset**: Click Reset to return to the top of the document

4. **Zoom Controls**

   - Click 🔍+ to zoom in
   - Click 🔍- to zoom out
   - Current zoom level is displayed between the buttons

5. **Monitor Progress**
   - View current page number in the info panel
   - Track scroll position percentage

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Structure and markup
- **CSS3**: Styling with modern gradients and flexbox
- **JavaScript (ES6+)**: Application logic and PDF handling
- **PDF.js**: Mozilla's PDF rendering library (v3.11.174)

### Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### Features Implementation

- Uses Canvas API for PDF rendering
- All pages rendered in a single continuous canvas
- Smooth scrolling with 60fps animation
- Responsive design with mobile support

## 📋 Controls Reference

| Control         | Function                          |
| --------------- | --------------------------------- |
| Choose PDF File | Load a PDF from your computer     |
| Play/Pause      | Start/stop automatic scrolling    |
| Reset           | Return to top of document         |
| Speed Slider    | Adjust scroll speed (0.5x - 5.0x) |
| 🔍+ / 🔍-       | Zoom in/out                       |
| Page Info       | Shows current page / total pages  |
| Scroll Position | Shows scroll percentage           |

## 💡 Tips

- **For Reading Long Documents**: Use slower speeds (0.5x - 1.5x) for comfortable reading
- **For Quick Preview**: Use faster speeds (2.0x - 5.0x) to quickly scan through documents
- **For Small Text**: Zoom in before starting auto-scroll
- **Mobile Users**: Landscape orientation works best for larger PDFs

## 🔧 Customization

You can customize the application by modifying:

- `style.css`: Change colors, fonts, and layout
- `script.js`: Adjust default values:
  - `scrollSpeed`: Initial scroll speed (default: 1.0)
  - `scale`: Initial zoom level (default: 1.5)
  - Frame rate: Modify the interval in `startScroll()` (default: 16ms = 60fps)

## 🐛 Troubleshooting

**PDF not loading?**

- Ensure the file is a valid PDF
- Try a different PDF file
- Check browser console for errors

**Scrolling too fast/slow?**

- Adjust the speed slider
- Modify the `scrollSpeed` variable in `script.js`

**PDF appears blurry?**

- Use the zoom controls to adjust size
- Larger PDFs may take longer to render

## 📄 License

This project is free to use and modify for personal and commercial purposes.

## 🤝 Credits

- PDF rendering powered by [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
