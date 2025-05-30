"use client";

import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import type { LatLng } from 'leaflet'

import { AppConfig } from '#lib/AppConfig'
import { LayerConfig, defaultLayers } from '#lib/LayerConfig'
import { FeatureCollection, useGeoJSON } from '../../hooks/useGeoJSON'

import LeafleftMapContextProvider from './LeafletMapContextProvider'
import { LayerControl } from './LayerControl'
import { LeafletGeoJSONData } from './LeafletGeoJSONData'
import { EnvironmentInfo } from './EnvironmentInfo'
import useMapContext from './useMapContext'

// Dynamically import Leaflet components with no SSR
const LeafletMapContainer = dynamic(async () => (await import('./LeafletMapContainer')).LeafletMapContainer, {
  ssr: false,
});

const Marker = dynamic(async () => (await import('react-leaflet')).Marker, {
  ssr: false,
});

const Popup = dynamic(async () => (await import('react-leaflet')).Popup, {
  ssr: false,
});

export interface ViewState {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  zoomLevel: number
}

const getViewState = (map: any) => {
  if (!map) return undefined

  const bounds = map.getBounds()
  const zoomLevel = map.getZoom()

  return {
    minLat: bounds.getSouthWest().lat,
    minLng: bounds.getSouthWest().lng,
    maxLat: bounds.getNorthEast().lat,
    maxLng: bounds.getNorthEast().lng,
    zoomLevel,
  }
}

const LeafletMapInner = () => {
  const { map } = useMapContext()
  const [layers, setLayers] = useState<LayerConfig[]>(defaultLayers)
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null)
  const [customMarkerIcon, setCustomMarkerIcon] = useState<any>(null)
  const [viewState, setViewState] = useState(getViewState(map))

  // Fetch GeoJSON data for layers needed by EnvironmentInfo
  const { geoJSONData: riversData } = useGeoJSON('/reky.geojson')
  const { geoJSONData: parksData } = useGeoJSON('/chko.geojson')
  const { geoJSONData: fieldsData } = useGeoJSON('/fields.geojson')

  const {
    width: viewportWidth,
    height: viewportHeight,
    ref: viewportRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 200,
  })

  // Initialize custom marker icon
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      setCustomMarkerIcon(L.icon({
        iconUrl: '/marker-icon.png',
        iconSize: [41, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      }))
    }
  }, [])

  // Handle map click events
  useEffect(() => {
    if (!map) return undefined

    const handleMapClick = (e: any) => {
      setClickedPosition(e.latlng)
    }

    map.on('click', handleMapClick)
    map.on('moveend', () => {
      setViewState(getViewState(map))
    })

    return () => {
      map.off('click', handleMapClick)
      map.off('moveend')
    }
  }, [map])

  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    )
  }, [])

  const isLoading = !map || !viewportWidth || !viewportHeight

  // Default map center and zoom level
  const defaultCenter = AppConfig.baseCenter
  const defaultZoom = AppConfig.minZoom

  return (
    <div className="absolute h-full w-full overflow-hidden" ref={viewportRef}>
      <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
      <EnvironmentInfo 
        clickedPosition={clickedPosition}
        riversData={riversData}
        parksData={parksData}
        fieldsData={fieldsData} 
        layers={layers}
      />
      <LeafletMapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        maxZoom={AppConfig.maxZoom}
        minZoom={AppConfig.minZoom}
      >
        <>
          {!isLoading && layers
            .filter(layer => layer.visible && layer.type === 'geojson')
            .map(layer => (
              <LeafletGeoJSONData
                key={layer.id}
                url={layer.url}
                pathOptions={layer.style}
                processData={layer.middleware}
              />
            ))}
          {clickedPosition && customMarkerIcon && (
            <Marker position={clickedPosition} icon={customMarkerIcon}>
              <Popup>
                Clicked at: <br /> {clickedPosition.lat.toFixed(5)}, {clickedPosition.lng.toFixed(5)}
              </Popup>
            </Marker>
          )}
        </>
      </LeafletMapContainer>
    </div>
  )
}

const Map = () => (
  <LeafleftMapContextProvider>
    <LeafletMapInner />
  </LeafleftMapContextProvider>
)

export default Map
