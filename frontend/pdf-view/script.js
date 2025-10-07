// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Global variables
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isScrolling = false;
let scrollInterval = null;
let scrollSpeed = 0.5;
let scale = 1.5;
let baseScale = 1.5;
let scrollAccumulator = 0;
let cropTop = 0;
let cropBottom = 0;

// DOM elements
const pdfUpload = document.getElementById("pdf-upload");
const pdfCanvas = document.getElementById("pdf-canvas");
const pdfContainer = document.getElementById("pdf-container");
const playPauseBtn = document.getElementById("play-pause-btn");
const resetBtn = document.getElementById("reset-btn");
const speedSlider = document.getElementById("speed-slider");
const speedValue = document.getElementById("speed-value");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const zoomValue = document.getElementById("zoom-value");
const pageInfo = document.getElementById("page-info");
const scrollPosition = document.getElementById("scroll-position");
const fileName = document.getElementById("file-name");
const placeholder = document.querySelector(".placeholder");
const cropTopSlider = document.getElementById("crop-top-slider");
const cropTopValue = document.getElementById("crop-top-value");
const cropBottomSlider = document.getElementById("crop-bottom-slider");
const cropBottomValue = document.getElementById("crop-bottom-value");

// Event listeners
pdfUpload.addEventListener("change", handleFileSelect);
playPauseBtn.addEventListener("click", toggleScroll);
resetBtn.addEventListener("click", resetScroll);
speedSlider.addEventListener("input", updateSpeed);
zoomInBtn.addEventListener("click", () => updateZoom(0.1));
zoomOutBtn.addEventListener("click", () => updateZoom(-0.1));
pdfContainer.addEventListener("scroll", updateScrollInfo);
cropTopSlider.addEventListener("input", updateCropTop);
cropBottomSlider.addEventListener("input", updateCropBottom);

// Handle file selection
async function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Please select a valid PDF file");
    return;
  }

  fileName.textContent = file.name;

  try {
    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      await loadPDF(typedArray);
    };

    fileReader.readAsArrayBuffer(file);
  } catch (error) {
    console.error("Error loading PDF:", error);
    alert("Error loading PDF file. Please try another file.");
  }
}

// Load and render PDF
async function loadPDF(data) {
  try {
    pdfDoc = await pdfjsLib.getDocument(data).promise;
    totalPages = pdfDoc.numPages;

    // Calculate optimal scale based on container width
    await calculateOptimalScale();

    // Update UI
    pageInfo.textContent = `Page: 1/${totalPages}`;
    placeholder.style.display = "none";
    pdfCanvas.classList.add("visible");

    // Enable controls
    playPauseBtn.disabled = false;
    resetBtn.disabled = false;
    speedSlider.disabled = false;
    zoomInBtn.disabled = false;
    zoomOutBtn.disabled = false;
    cropTopSlider.disabled = false;
    cropBottomSlider.disabled = false;

    // Render all pages
    await renderAllPages();
  } catch (error) {
    console.error("Error loading PDF:", error);
    alert("Error loading PDF. Please try another file.");
  }
}

// Calculate optimal scale based on container width
async function calculateOptimalScale() {
  if (!pdfDoc) return;

  try {
    // Get the first page to calculate dimensions
    const firstPage = await pdfDoc.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1.0 });

    // Get container width (accounting for padding)
    const containerWidth = pdfContainer.clientWidth - 40; // 20px padding on each side

    // Calculate scale to fit width, with some reasonable limits
    const scaleToFit = containerWidth / viewport.width;
    baseScale = Math.min(Math.max(scaleToFit, 0.5), 3.0); // Limit between 0.5x and 3.0x
    scale = baseScale;
  } catch (error) {
    console.error("Error calculating optimal scale:", error);
    baseScale = 1.5;
    scale = baseScale;
  }
}

// Render all pages to canvas
async function renderAllPages() {
  const canvas = pdfCanvas;
  const context = canvas.getContext("2d");

  let totalHeight = 0;
  let maxWidth = 0;

  // First pass: calculate total dimensions
  const pagePromises = [];
  for (let i = 1; i <= totalPages; i++) {
    pagePromises.push(pdfDoc.getPage(i));
  }

  const pages = await Promise.all(pagePromises);
  const viewports = pages.map((page) => page.getViewport({ scale: scale }));

  viewports.forEach((viewport) => {
    // Calculate cropped height
    const cropTopPixels = (viewport.height * cropTop) / 100;
    const cropBottomPixels = (viewport.height * cropBottom) / 100;
    const croppedHeight = viewport.height - cropTopPixels - cropBottomPixels;

    totalHeight += croppedHeight + 10; // Reduced spacing for more continuous look
    maxWidth = Math.max(maxWidth, viewport.width);
  });

  // Set canvas dimensions without device pixel ratio complications
  canvas.width = maxWidth;
  canvas.height = totalHeight;

  // Set canvas style dimensions
  canvas.style.width = maxWidth + "px";
  canvas.style.height = totalHeight + "px";

  // Clear the entire canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set white background
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Second pass: render all pages
  let currentY = 0;
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const viewport = viewports[i];

    // Calculate crop values
    const cropTopPixels = (viewport.height * cropTop) / 100;
    const cropBottomPixels = (viewport.height * cropBottom) / 100;
    const croppedHeight = viewport.height - cropTopPixels - cropBottomPixels;

    // Save the current context state
    context.save();

    // Translate to the correct position for this page
    context.translate(0, currentY);

    // Create a clipping rectangle for the cropped area
    context.beginPath();
    context.rect(0, 0, viewport.width, croppedHeight);
    context.clip();

    // Translate to account for top cropping
    context.translate(0, -cropTopPixels);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    try {
      await page.render(renderContext).promise;
      console.log(
        `Rendered page ${
          i + 1
        } at position ${currentY} with crop top: ${cropTop}%, bottom: ${cropBottom}%`
      );
    } catch (error) {
      console.error(`Error rendering page ${i + 1}:`, error);
    }

    // Restore the context state
    context.restore();

    currentY += croppedHeight + 10; // Reduced spacing for more continuous look
  }

  updateZoomDisplay();
}

// Toggle auto-scroll
function toggleScroll() {
  isScrolling = !isScrolling;

  if (isScrolling) {
    playPauseBtn.classList.add("active");
    playPauseBtn.querySelector(".icon").textContent = "⏸️";
    playPauseBtn.querySelector(".btn-text").textContent = "Pause";
    startScroll();
  } else {
    playPauseBtn.classList.remove("active");
    playPauseBtn.querySelector(".icon").textContent = "▶️";
    playPauseBtn.querySelector(".btn-text").textContent = "Play";
    stopScroll();
  }
}

// Start auto-scroll
function startScroll() {
  if (scrollInterval) return;

  // Reset accumulator when starting
  scrollAccumulator = 0;

  scrollInterval = setInterval(() => {
    const maxScroll = pdfContainer.scrollHeight - pdfContainer.clientHeight;

    if (pdfContainer.scrollTop >= maxScroll) {
      // Reached the end
      toggleScroll();
      return;
    }

    // Accumulate fractional scroll amounts
    scrollAccumulator += scrollSpeed;

    // Only scroll when we have accumulated at least 1 pixel
    if (scrollAccumulator >= 1) {
      const pixelsToScroll = Math.floor(scrollAccumulator);
      pdfContainer.scrollTop += pixelsToScroll;
      scrollAccumulator -= pixelsToScroll; // Keep the fractional part
    }
  }, 16); // ~60fps
}

// Stop auto-scroll
function stopScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

// Reset scroll to top
function resetScroll() {
  stopScroll();
  pdfContainer.scrollTop = 0;
  scrollAccumulator = 0; // Reset accumulator

  if (isScrolling) {
    playPauseBtn.classList.remove("active");
    playPauseBtn.querySelector(".icon").textContent = "▶️";
    playPauseBtn.querySelector(".btn-text").textContent = "Play";
    isScrolling = false;
  }
}

// Update scroll speed
function updateSpeed(event) {
  scrollSpeed = parseFloat(event.target.value);
  speedValue.textContent = scrollSpeed.toFixed(1);
}

// Update crop top
async function updateCropTop(event) {
  cropTop = parseInt(event.target.value);
  cropTopValue.textContent = cropTop;

  if (pdfDoc) {
    await renderAllPages();
  }
}

// Update crop bottom
async function updateCropBottom(event) {
  cropBottom = parseInt(event.target.value);
  cropBottomValue.textContent = cropBottom;

  if (pdfDoc) {
    await renderAllPages();
  }
}

// Update zoom
async function updateZoom(delta) {
  const newScale = scale + delta * baseScale * 0.2; // Make zoom increments relative to base scale

  if (newScale < 0.3 || newScale > 5) return;

  scale = newScale;

  if (pdfDoc) {
    await renderAllPages();
  }
}

// Update zoom display
function updateZoomDisplay() {
  const percentage = Math.round((scale / baseScale) * 100);
  zoomValue.textContent = `${percentage}%`;
}

// Update scroll information
function updateScrollInfo() {
  const scrollPercent = Math.round(
    (pdfContainer.scrollTop /
      (pdfContainer.scrollHeight - pdfContainer.clientHeight)) *
      100
  );

  scrollPosition.textContent = `Scroll: ${
    isNaN(scrollPercent) ? 0 : scrollPercent
  }%`;

  // Update current page (approximate based on scroll position)
  if (totalPages > 0) {
    const pageHeight = pdfContainer.scrollHeight / totalPages;
    currentPage = Math.min(
      Math.ceil(
        (pdfContainer.scrollTop + pdfContainer.clientHeight / 2) / pageHeight
      ),
      totalPages
    );
    pageInfo.textContent = `Page: ${currentPage}/${totalPages}`;
  }
}

// Handle window resize
window.addEventListener("resize", async () => {
  if (pdfDoc) {
    await calculateOptimalScale();
    await renderAllPages();
  }
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
  stopScroll();
});
