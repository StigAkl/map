
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { oslo } from "../../data/test_coordinates"
import { availableMapTiles } from "../../config";
import { useMemo, useState } from "react";
import MapTileSelector from "./MapTileSelector";
import SubmarineCablesLayer from "../MapsLayer/SubmarineCablesLayer";
import AirportsLayer from "../MapsLayer/AirportsLayer";

const LeafletMap = () => {

  const [selectedTileId, setSelectedTileId] = useState(availableMapTiles[0].id)
  const [showSubmarineCables, setShowSubmarineCables] = useState(false);
  const [enableClustering, setEnableClustering] = useState(true);

  const selectedTile = useMemo(() => {
    return (
      availableMapTiles.find((tile) => tile.id === selectedTileId) ?? availableMapTiles[0]
    )
  }, [selectedTileId])

  return (
    <div className="h-screen w-full">
      <MapContainer center={oslo} zoom={5} className="h-full w-full">
        <TileLayer
          className="relative"
          url={selectedTile.baseUrl}
        />

        {showSubmarineCables && <SubmarineCablesLayer />}
        <AirportsLayer enableClustering={enableClustering} />
        <MapTileSelector onChange={setSelectedTileId} selectedTileId={selectedTileId} />
        <div className="flex flex-col gap-2 absolute top-10 right-3 z-400">
          <div className="text-white flex gap-2 items-center mt-2">
            <input id="submarine-cables" className="bg-amber-400" type="checkbox" onChange={() => setShowSubmarineCables(!showSubmarineCables)} />
            <label htmlFor="submarine-cables">Vis undervannskabler</label>
          </div>
          <div className="text-white flex gap-2 items-center mt-2">
            <input id="enable-airport-clusters" className="bg-amber-400" checked={enableClustering} type="checkbox" onChange={() => setEnableClustering(!enableClustering)} />
            <label htmlFor="enable-airport-clusters">Cluster Flyplasser</label>
          </div>
        </div>
      </MapContainer>


    </div>
  )
}

export default LeafletMap;