const API_URL = "http://localhost:8000/api/pubs/";
const SAO_PAULO_CENTER = [-23.5505, -46.6333];
const DEFAULT_RADIUS = 5;
const ZOOM_LEVEL = 13;

let map;
let markers = [];
let isLoading = false;

function initMap() {
  map = L.map("map").setView(SAO_PAULO_CENTER, ZOOM_LEVEL);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }
  ).addTo(map);

  map.on("moveend", handleMapMove);
  map.on("zoomend", handleMapMove);

  fetchPubs();
}

function handleMapMove() {
  if (!isLoading) {
    fetchPubs();
  }
}

async function fetchPubs() {
  const center = map.getCenter();
  const radius = calculateRadius();

  setLoading(true);

  try {
    const url = `${API_URL}?lat=${center.lat}&lng=${center.lng}&radius=${radius}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    updateMarkers(data);
    updateInfoPanel(data.length, radius);
  } catch (error) {
    console.error("Error fetching pubs:", error);
    showError("Failed to load pubs");
  } finally {
    setLoading(false);
  }
}

function calculateRadius() {
  const bounds = map.getBounds();
  const center = map.getCenter();
  const edge = bounds.getNorthEast();

  const radius = center.distanceTo(edge) / 1000;

  return Math.max(1, Math.round(radius * 10) / 10);
}

function updateMarkers(pubs) {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];

  pubs.forEach((pub) => {
    const marker = L.marker([pub.latitude, pub.longitude], {
      icon: L.divIcon({
        className: "pub-marker",
        html: '<div class="marker-pin"><span class="marker-icon">🍺</span></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      }),
    });

    const popupContent = createPopupContent(pub);
    marker.bindPopup(popupContent);
    marker.addTo(map);
    markers.push(marker);
  });
}

function createPopupContent(pub) {
  const pubType = pub.pub_type.replace("_", " ");
  const rating = pub.rating ? `<p class="rating">⭐ ${pub.rating}/5</p>` : "";
  const distance = pub.distance
    ? `<p class="distance">📍 ${pub.distance} km away</p>`
    : "";

  return `
        <div class="popup-content">
            <h3>${pub.name}</h3>
            <p><small>${pub.address}</small></p>
            ${rating}
            ${distance}
            <span class="pub-type">${pubType}</span>
        </div>
    `;
}

function updateInfoPanel(count, radius) {
  document.getElementById("pub-count").textContent = count;
  document.getElementById("radius").textContent = radius.toFixed(1);
}

function setLoading(loading) {
  isLoading = loading;
  const statusEl = document.getElementById("loading-status");
  if (loading) {
    statusEl.textContent = "Loading...";
    statusEl.className = "loading";
  } else {
    statusEl.textContent = "";
    statusEl.className = "";
  }
}

function showError(message) {
  const statusEl = document.getElementById("loading-status");
  statusEl.textContent = message;
  statusEl.style.color = "#f44336";
}

document.addEventListener("DOMContentLoaded", initMap);
