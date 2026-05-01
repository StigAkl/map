import type { FeatureCollection } from "geojson";
import { GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";

const SUBMARINE_CABLES_DATA_URL = (import.meta.env.BASE_URL ?? "").concat(
  "data/geojson/submarine_cables.json",
);

const SubmarineCablesLayer = () => {
  const [submarineCables, setSubmarineCables] =
    useState<FeatureCollection | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    fetch(SUBMARINE_CABLES_DATA_URL)
      .then((response) => response.json())
      .then((data: FeatureCollection) => {
        if (!ignoreResult) {
          setSubmarineCables(data);
        }
      });

    return () => {
      ignoreResult = true;
    };
  }, []);

  if (!submarineCables) return null;

  return (
    <GeoJSON
      data={submarineCables}
      onEachFeature={(feature, layer) => {
        const cableName = feature.properties?.name ?? "Ukjent kabel";
        const cableLength = feature.properties?.length ?? "Ukjent lengde";
        const cableOwners = feature.properties?.owners ?? "Ukjent";

        layer.bindPopup(`
            <div class="flex flex-col gap-2">
              <strong>${cableName}</strong>
              <span>Lengde: ${cableLength}</span>
              <span>Eiere: ${cableOwners}</span>
            </div>
          `);
      }}
      style={(feature) => ({
        color: feature?.properties?.color ?? "#00ff00",
        opacity: 1,
        weight: 0.7,
      })}
    />
  );
};

export default SubmarineCablesLayer;
