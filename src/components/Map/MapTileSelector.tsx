import { availableMapTiles } from "../../config"

type Props = {
  selectedTileId: string
  onChange: (tileId: string) => void
}

const MapTileSelector = ({ selectedTileId, onChange }: Props) => {
  return (
    <div className="fixed z-400 right-5 top-2 flex flex-col gap-4 ">
      <select
        className="bg-gray-600 text-white p-2"
        value={selectedTileId}
        onChange={(e) => onChange(e.target.value)}>
        {availableMapTiles.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </div>
  )
}

export default MapTileSelector;