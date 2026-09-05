window.addEventListener("load", function () {

  const mapElement = document.getElementById("map");

  if (!mapElement) {
    return;
  }

  const lat = parseFloat(mapElement.dataset.lat);
  const lng = parseFloat(mapElement.dataset.lng);
  const title = mapElement.dataset.title;

  console.log("Latitude:", lat);
  console.log("Longitude:", lng);
  console.log("Leaflet:", typeof L);

  if (typeof L === "undefined") {
    console.error("Leaflet is NOT loaded");
    return;
  }

  const map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(title)
    .openPopup();

});