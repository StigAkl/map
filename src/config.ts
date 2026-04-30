export const availableMapTiles = [
  {
    id: "dark-grey",
    name: "Dark Grey",
    baseUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  },
  {
    id: "open-street-map",
    name: "Open Street Map",
    baseUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
  {
    id: "ocean",
    name: "Ocean",
    baseUrl:
      "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
  },
  {
    id: "esri-satellite",
    name: "Satellite",
    baseUrl:
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
];
