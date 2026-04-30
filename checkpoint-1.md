Jeg bygger en React + TypeScript + Leaflet kartapplikasjon, og ønsker hjelp til å videreutvikle arkitekturen steg-for-steg.

Nåværende status:

Teknologi:

- React (Vite)
- TypeScript
- Leaflet / react-leaflet
- Tailwind
- GeoJSON data
- Raster tile basemaps (OSM, Dark, Ocean, Satellite)

Funksjonalitet jeg allerede har:

1. Kart med selectable basemap:
   - Dark
   - OpenStreetMap
   - Ocean
   - Satellite

2. Toggle for å vise undervannskabler (GeoJSON)
   - Styled per feature (color fra properties)
   - Popup med navn, lengde og eiere

3. AIS-data pipeline:
   - Jeg har mottatt Parquet-filer fra Kystverket
   - Har konvertert 2 dager AIS til GeoJSON
   - Resultat: ~220 000 punkter
   - Fil ligger i:
     public/data/ais/ais_combined.json

4. Planlagt funksjonalitet:
   - Tidsbasert AIS playback
   - Vise skip som beveger seg over tid
   - Kun vise siste kjente posisjon per skip
   - Filtrere på kartutsnitt (bounds)
   - Etter hvert støtte mange ulike datatyper (kabler, skip, fly, osv.)

Eksempel på kode jeg har nå:

(Submarine cable layer)

import type { FeatureCollection } from "geojson";
import submarineCables from "../../data/submarine_cables.json"
import { GeoJSON } from "react-leaflet";

const SubmarineCablesLayer = () => {
return (
<GeoJSON
data={submarineCables as FeatureCollection}
onEachFeature={(feature, layer) => {
const name = feature.properties?.name ?? "Ukjent kabel"
const length = feature.properties?.length ?? "-1";

```
    layer.bindPopup(`
      <div>
        <strong>${name}</strong>
        <span>Lengde: ${length}</span>
        <span>Eiere: ${feature.properties?.owners ?? "Unknown"}</span>
      </div>
    `)
  }}
  style={(feature) => ({
    color: feature?.properties?.color ?? "#00ff00",
    opacity: 1,
    weight: 0.7
  })}
/>
```

)
}

Mitt neste mål:

Jeg vil implementere en enkel AIS playback-løsning som:

1. Leser AIS GeoJSON (~220k punkter)
2. Har en tids-slider
3. For valgt tidspunkt:
   - finner siste posisjon per MMSI
   - viser kun disse skipene

4. Filtrerer på kartets bounds
5. Holder performance god

Kan du hjelpe meg med å lage:

- riktig datastruktur for AIS i frontend
- en enkel playback-modell
- en første fungerende AISLayer-komponent

Vi kan ta det steg-for-steg og starte enkelt.
