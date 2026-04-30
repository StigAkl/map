
import type { Feature, MultiPoint, Point } from "geojson";
import airports from "../../data/geojson/airports.json"
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { TowerControl } from "lucide-react";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useMemo } from "react";

const airportIconColor = "blue-300"

const createAirportIcon = (w?: string, h?: string) => {
  const width = w ?? "w-4";
  const height = h ?? "h-4";
  return L.divIcon({
    html: renderToStaticMarkup(
      <div className={`${width} ${height} rounded-full flex items-center justify-center shadow`}>
        <TowerControl className={`text-${airportIconColor}`} />
      </div>
    ),
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const createClusterIcon = (cluster) => {
  const count = cluster.getChildCount()

  let size = 32

  if (count > 100) {
    size = 80
  } else if (count > 50) {
    size = 70
  }
  else if (count > 30) {
    size = 60
  }
  else if (count >= 10) {
    size = 45
  }

  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        className={`
          text-white
          rounded-full
          flex
          items-center
          justify-center
          bg-${airportIconColor}/60
          font-bold
          shadow-lg
          text-${airportIconColor}
          border border-${airportIconColor}
        `}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {count}
      </div>
    ),
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

type Props = {
  enableClustering: boolean
}
const AirportsLayer = ({ enableClustering }: Props) => {
  const airportIcon = useMemo(() => createAirportIcon(), [])

  const markers = useMemo(() => {
    return airports.features.flatMap((feature, fi) => {
      if (
        feature.geometry.type !== "Point" &&
        feature.geometry.type !== "MultiPoint"
      ) {
        return []
      }

      const positions = getAirportPositions(feature as Feature<Point | MultiPoint>)

      return positions.map((position, i) => ({
        key: `${feature.properties?.iata_code ?? fi}-${i}-${feature.properties?.name}`,
        position,
        name: feature.properties?.name ?? "Unknown",
      }))
    })
  }, [])

  const mappedMarkers = markers.map((marker) => (
    <Marker
      key={marker.key}
      position={marker.position}
      icon={airportIcon}
    >
      <Popup>
        <strong>{marker.name}</strong>
      </Popup>
    </Marker>
  ))

  if (!enableClustering) return mappedMarkers

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      showCoverageOnHover={false}
      maxClusterRadius={120}
    >
      {mappedMarkers}
    </MarkerClusterGroup>
  )
}

function getAirportPositions(feature: Feature<Point | MultiPoint>) {
  if (feature.geometry.type === "Point") {
    const [lng, lat] = feature.geometry.coordinates
    return [[lat, lng] as [number, number]]
  }

  if (feature.geometry.type === "MultiPoint") {
    return feature.geometry.coordinates.map(([lng, lat]) => {
      return [lat, lng] as [number, number]
    })
  }

  return []
}

export default AirportsLayer;