import type { Feature, FeatureCollection, Point } from "geojson";
import L from "leaflet";
import { Navigation2 } from "lucide-react";
import { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup } from "react-leaflet";

const AisLayer = () => {
  const [aisData, setAisData] = useState<AisFeatureCollection | null>(null)
  useEffect(() => {
    fetch(AIS_DATA_URL)
      .then((response) => response.json())
      .then((data: AisFeatureCollection) => {
        setAisData(data)
      })
  }, [])

  if (!aisData) return <div className="flex items-center justify-center text-4xl">Laster AIS data..</div>
  const latest = getLatestShipPositions(aisData)

  const markers = latest.map((ship) => {
    const [lng, lat] = ship.geometry.coordinates;
    const heading =
      ship.properties.true_heading === 511
        ? Number(ship.properties.course_over_ground)
        : ship.properties.true_heading;

    return (
      <Marker
        key={ship.properties.mmsi}
        position={[lat, lng]}
        icon={createShipIcon(SHIP_ICON_SIZES.small, heading)}
      >
        <Popup>
          <strong>MMSI: {ship.properties.mmsi}</strong>
          <br />
          Ship type: {ship.properties.ship_type}
          <br />
          Message type: {ship.properties.msg_type}
        </Popup>
      </Marker>
    )
  })

  return markers
}


/**
 * Utils 
 */

const SHIP_ICON_SIZES = {
  small: 18,
  medium: 26,
  large: 36
} as const;


type ShipIconSize = typeof SHIP_ICON_SIZES[keyof typeof SHIP_ICON_SIZES]

const createShipIcon = (size: ShipIconSize, heading = 0) => {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        className="flex items-center justify-center text-cyan-300 drop-shadow"
        style={{
          width: size,
          height: size,
          transform: `rotate(${heading}deg)`
        }}
      >
        <Navigation2 />
      </div>
    ),
    className: "",

    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

const AIS_DATA_URL = (import.meta.env.BASE_URL ?? "").concat(
  "data/ais/ais_combined.json",
);

type AisProperties = {
  mmsi: number;
  date_time_utc: string;
  longitude: number;
  latitude: number;
  speed_over_ground: string;
  course_over_ground: string;
  true_heading: number;
  ship_type: number;
  msg_type: number;
}

type AisFeature = Feature<Point, AisProperties>
type AisFeatureCollection = FeatureCollection<Point, AisProperties>;

const getLatestShipPositions = (aisData: AisFeatureCollection) => {
  const latestByMmsi = new Map<number, AisFeature>();

  for (const feature of aisData.features) {
    const existingFeature = latestByMmsi.get(feature.properties.mmsi)

    if (
      !existingFeature || new Date(feature.properties.date_time_utc) > new Date(existingFeature.properties.date_time_utc)
    ) {
      latestByMmsi.set(feature.properties.mmsi, feature)
    }
  }

  return [...latestByMmsi.values()]
}
export default AisLayer
