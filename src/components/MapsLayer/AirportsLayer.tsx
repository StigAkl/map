import type { Feature, FeatureCollection, MultiPoint, Point } from "geojson";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { TowerControl } from "lucide-react";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useMemo, useState } from "react";

const AIRPORT_ICON_COLOR = "text-blue-300";
const AIRPORT_CLUSTER_COLOR = "border-blue-300 bg-blue-300/60 text-blue-300";
const AIRPORTS_DATA_URL = (import.meta.env.BASE_URL ?? "").concat(
  "data/geojson/airports.json",
);

type AirportMarker = {
  key: string;
  name: string;
  position: [number, number];
};

type AirportCluster = {
  getChildCount: () => number;
};

type Props = {
  clusterAirports: boolean;
};

const AirportsLayer = ({ clusterAirports }: Props) => {
  const [airportData, setAirportData] = useState<FeatureCollection<
    Point | MultiPoint
  > | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    fetch(AIRPORTS_DATA_URL)
      .then((response) => response.json())
      .then((data: FeatureCollection<Point | MultiPoint>) => {
        if (!ignoreResult) {
          setAirportData(data);
        }
      });

    return () => {
      ignoreResult = true;
    };
  }, []);

  const airportIcon = useMemo(() => createAirportIcon(), []);
  const airportMarkers = useMemo(() => {
    if (!airportData) return [];

    return getAirportMarkers(airportData);
  }, [airportData]);

  const markers = airportMarkers.map((airport) => (
    <Marker key={airport.key} position={airport.position} icon={airportIcon}>
      <Popup>
        <strong>{airport.name}</strong>
      </Popup>
    </Marker>
  ));

  if (!clusterAirports) return markers;

  return (
    <MarkerClusterGroup
      chunkedLoading
      iconCreateFunction={createClusterIcon}
      showCoverageOnHover={false}
      maxClusterRadius={120}
    >
      {markers}
    </MarkerClusterGroup>
  );
};

const createAirportIcon = (widthClass = "w-4", heightClass = "h-4") => {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        className={`${widthClass} ${heightClass} flex items-center justify-center rounded-full shadow`}
      >
        <TowerControl className={AIRPORT_ICON_COLOR} />
      </div>,
    ),
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createClusterIcon = (cluster: AirportCluster) => {
  const airportCount = cluster.getChildCount();
  const iconSize = getClusterIconSize(airportCount);

  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        className={`
          text-white
          rounded-full
          flex
          items-center
          justify-center
          font-bold
          shadow-lg
          border
          ${AIRPORT_CLUSTER_COLOR}
        `}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
      >
        {airportCount}
      </div>,
    ),
    className: "",
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
};

const getClusterIconSize = (airportCount: number) => {
  if (airportCount > 100) return 80;
  if (airportCount > 50) return 70;
  if (airportCount > 30) return 60;
  if (airportCount >= 10) return 45;

  return 32;
};

const getAirportMarkers = (
  airportData: FeatureCollection<Point | MultiPoint>,
): AirportMarker[] => {
  return airportData.features.flatMap((feature, featureIndex) => {
    if (
      feature.geometry.type !== "Point" &&
      feature.geometry.type !== "MultiPoint"
    ) {
      return [];
    }

    const positions = getAirportPositions(
      feature as Feature<Point | MultiPoint>,
    );
    const airportName = feature.properties?.name ?? "Unknown airport";
    const airportCode = feature.properties?.iata_code ?? featureIndex;

    return positions.map((position, positionIndex) => ({
      key: `${airportCode}-${positionIndex}-${airportName}`,
      name: airportName,
      position,
    }));
  });
};

function getAirportPositions(feature: Feature<Point | MultiPoint>) {
  if (feature.geometry.type === "Point") {
    const [lng, lat] = feature.geometry.coordinates;
    return [[lat, lng] as [number, number]];
  }

  if (feature.geometry.type === "MultiPoint") {
    return feature.geometry.coordinates.map(([lng, lat]) => {
      return [lat, lng] as [number, number];
    });
  }

  return [];
}

export default AirportsLayer;
