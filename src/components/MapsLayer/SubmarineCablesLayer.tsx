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

        layer.bindPopup(`
            <div key=${name} class="flex flex-col gap-2">
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
      })} />
  )
}

export default SubmarineCablesLayer