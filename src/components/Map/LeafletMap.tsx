import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { oslo } from "../../data/test_coordinates";
import { availableMapTiles } from "../../config";
import { lazy, Suspense, useMemo, useState } from "react";
import MapTileSelector from "./MapTileSelector";

const AirportsLayer = lazy(() => import("../MapsLayer/AirportsLayer"));
const SubmarineCablesLayer = lazy(
  () => import("../MapsLayer/SubmarineCablesLayer"),
);

const LeafletMap = () => {
  const [selectedTileId, setSelectedTileId] = useState(availableMapTiles[0].id);
  const [showSubmarineCables, setShowSubmarineCables] = useState(false);
  const [clusterAirports, setClusterAirports] = useState(true);

  const selectedTileLayer = useMemo(() => {
    return (
      availableMapTiles.find((tileLayer) => tileLayer.id === selectedTileId) ??
      availableMapTiles[0]
    );
  }, [selectedTileId]);

  return (
    <div className="h-screen w-full">
      <MapContainer center={oslo} zoom={5} className="h-full w-full">
        <TileLayer className="relative" url={selectedTileLayer.baseUrl} />

        {showSubmarineCables && (
          <Suspense fallback={null}>
            <SubmarineCablesLayer />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <AirportsLayer clusterAirports={clusterAirports} />
        </Suspense>

        <MapTileSelector
          selectedTileId={selectedTileId}
          onTileChange={setSelectedTileId}
        />

        <MapOverlayControls
          showSubmarineCables={showSubmarineCables}
          clusterAirports={clusterAirports}
          onShowSubmarineCablesChange={setShowSubmarineCables}
          onClusterAirportsChange={setClusterAirports}
        />
      </MapContainer>
    </div>
  );
};

type MapOverlayControlsProps = {
  showSubmarineCables: boolean;
  clusterAirports: boolean;
  onShowSubmarineCablesChange: (showSubmarineCables: boolean) => void;
  onClusterAirportsChange: (clusterAirports: boolean) => void;
};

const MapOverlayControls = ({
  showSubmarineCables,
  clusterAirports,
  onShowSubmarineCablesChange,
  onClusterAirportsChange,
}: MapOverlayControlsProps) => {
  return (
    <div className="absolute top-10 right-3 z-400 flex flex-col gap-2">
      <label className="mt-2 flex items-center gap-2 text-white">
        <input
          className="bg-amber-400"
          type="checkbox"
          checked={showSubmarineCables}
          onChange={(event) =>
            onShowSubmarineCablesChange(event.target.checked)
          }
        />
        Vis undervannskabler
      </label>

      <label className="mt-2 flex items-center gap-2 text-white">
        <input
          className="bg-amber-400"
          type="checkbox"
          checked={clusterAirports}
          onChange={(event) => onClusterAirportsChange(event.target.checked)}
        />
        Cluster flyplasser
      </label>
    </div>
  );
};

export default LeafletMap;
