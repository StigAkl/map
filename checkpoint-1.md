# Map System Checkpoint — Marker Rendering & Clustering

Date: 2026-05  
Project: React + TypeScript + Leaflet Map Application  
Scope: Point marker rendering and clustering  
Status: Stable  
Next Priority: Bounds filtering

---

# Purpose

This checkpoint describes the current implementation state of marker rendering and clustering.

The goal of this document is that a developer or AI can:

- Understand current architecture
- Continue development without reverse-engineering
- Reuse established patterns
- Extend the system safely

This document reflects actual implemented behavior.

---

# Technology Stack

Frontend:

- React (Vite)
- TypeScript
- Leaflet
- react-leaflet
- react-leaflet-cluster
- TailwindCSS
- lucide-react

Data formats:

- GeoJSON
- Point geometry
- MultiPoint geometry

---

# Current Map Features

Implemented:

- Basemap switching
- Submarine cable rendering (LineString)
- Airport markers
- Marker clustering
- MultiPoint geometry support
- Custom marker icons
- Custom cluster icons
- Toggleable clustering

Planned:

- AIS ship playback
- Radio tower datasets
- Aircraft datasets
- Additional POI datasets

---

# Core Marker Rendering Pipeline

All point-based layers follow this logic:

GeoJSON  
→ Normalize geometry  
→ Generate marker metadata  
→ Render markers  
→ Optionally cluster markers  

This pipeline must remain consistent for all future datasets.

---

# Reusable Components

## createAirportIcon

Creates a Leaflet divIcon used for single markers.

Used for:

- Airports
- Towers
- Future point datasets

Icons must be memoized.

```ts
export const createAirportIcon = () => {
  return L.divIcon({
    html: renderToStaticMarkup(
      <div className="
        w-6 h-6
        bg-amber-800
        border border-white/40
        rounded-full
        flex
        items-center
        justify-center
        shadow
      ">
        <TowerControl size={14} color="white" />
      </div>
    ),
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}
```

---

## createClusterIcon

Creates cluster markers using circular markers with numeric counts.

Cluster size scales based on marker count.

```ts
import type { MarkerCluster } from "leaflet"

export const createClusterIcon = (
  cluster: MarkerCluster
) => {

  const count = cluster.getChildCount()

  const size =
    count > 100 ? 48 :
    count > 50 ? 40 :
    32

  return L.divIcon({
    html: renderToStaticMarkup(
      <div
        className="
          bg-amber-600/80
          text-white
          rounded-full
          flex
          items-center
          justify-center
          font-bold
          border border-white/40
          shadow-lg
        "
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
```

---

## MaybeCluster

Reusable wrapper for clustering.

Allows clustering to be toggled globally.

```tsx
type MaybeClusterProps = {
  enabled: boolean
  children: React.ReactNode
}

export function MaybeCluster({
  enabled,
  children
}: MaybeClusterProps) {

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={30}
      showCoverageOnHover={false}
      iconCreateFunction={createClusterIcon}
    >
      {children}
    </MarkerClusterGroup>
  )
}
```

---

# Geometry Handling

Supports:

- Point
- MultiPoint

MultiPoint geometries are expanded into individual markers.

```ts
function getAirportPositions(feature) {

  if (feature.geometry.type === "Point") {

    const [lng, lat] =
      feature.geometry.coordinates

    return [[lat, lng]]

  }

  if (feature.geometry.type === "MultiPoint") {

    return feature.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    )

  }

  return []

}
```

---

# Marker Precomputation

Markers are computed using useMemo.

```tsx
const airportIcon = useMemo(
  () => createAirportIcon(),
  []
)

const markers = useMemo(() => {

  return airports.features.flatMap(
    (feature, fi) => {

      const positions =
        getAirportPositions(feature)

      return positions.map(
        (position, i) => ({

          key:
            `${feature.properties?.iata_code ?? fi}-${i}`,

          position,

          name:
            feature.properties?.name ?? "Unknown"

        })
      )

    }
  )

}, [])
```

---

# Rendering Pattern

```tsx
<MaybeCluster enabled={clusterMarkers}>

  {markers.map(marker => (

    <Marker
      key={marker.key}
      position={marker.position}
      icon={airportIcon}
    >

      <Popup>

        <strong>
          {marker.name}
        </strong>

      </Popup>

    </Marker>

  ))}

</MaybeCluster>
```

---

# Configuration

## maxClusterRadius

Controls clustering sensitivity.

```ts
maxClusterRadius = 30
```

Typical behavior:

20 → Weak clustering  
30 → Balanced clustering  
50+ → Aggressive clustering  

Current setting:

30

---

## Clustering Toggle

```tsx
const [clusterMarkers, setClusterMarkers] =
  useState(true)
```

Usage:

```tsx
<MaybeCluster enabled={clusterMarkers}>
```

---

# Visual Design Rules

Single marker:

- Small circular icon
- Icon inside marker
- Fixed size

Cluster marker:

- Circular marker
- Numeric count only
- No icon inside cluster
- Size scales with count

Color scheme:

Amber-based color palette.

Transparency:

bg-amber-600/80

Cluster size logic:

32px → small  
40px → medium  
48px → large  

---

# Performance Design

Currently implemented:

- chunkedLoading enabled
- icon memoization
- marker memoization
- MultiPoint normalization

Not yet implemented:

- Bounds filtering
- Zoom filtering
- Spatial indexing

These are required before large-scale AIS rendering.

---

# Next Required Work

## Bounds Filtering

High priority.

Only render markers inside viewport.

Expected logic:

Get map bounds  
Filter markers  
Render only visible markers  

Required for:

- AIS datasets
- Dense POI datasets
- Towers

---

## Zoom-Level Filtering

Medium priority.

Example logic:

zoom < 6 → large airports only  
zoom ≥ 8 → all airports  

---

## AIS Playback System

Planned pipeline:

AIS GeoJSON (~220k points)  
→ Group by MMSI  
→ Find latest timestamp  
→ Filter by bounds  
→ Render markers  

Existing marker pipeline will be reused.

---

# Architectural Direction

Long-term system goal:

Generic Entity-Based Map System

Future datasets:

- Airports
- Ships
- Towers
- Aircraft
- Infrastructure
- Sensors

All must use:

Unified Marker Pipeline

---

# Known Limitations

Current limitations:

- No bounds filtering
- No zoom filtering
- Cluster coverage disabled
- Cluster sizing based only on count
- No layer-specific clustering configuration

---

# System State Summary

System is stable.

Working:

- Custom marker icons
- MultiPoint-safe rendering
- Clustered markers
- Toggleable clustering
- Reusable cluster wrapper

System readiness:

Ready for Bounds Filtering Implementation