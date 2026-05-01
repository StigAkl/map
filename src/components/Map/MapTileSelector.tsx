import { availableMapTiles } from "../../config"

type Props = {
  selectedTileId: string
  onTileChange: (tileId: string) => void
}

const MapTileSelector = ({ selectedTileId, onTileChange }: Props) => {
  return (
    <div className="fixed right-5 top-2 z-400 flex flex-col gap-4">
      <select
        className="bg-gray-600 text-white p-2"
        value={selectedTileId}
        onChange={(event) => onTileChange(event.target.value)}
      >
        {availableMapTiles.map((tileLayer) => (
          <option key={tileLayer.id} value={tileLayer.id}>
            {tileLayer.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default MapTileSelector;
