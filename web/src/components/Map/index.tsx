"use client";

import Leaflet from 'leaflet'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'

import { AppConfig } from '#lib/AppConfig'
import { LayerConfig, defaultLayers } from '#lib/LayerConfig'

import LeafleftMapContextProvider from './LeafletMapContextProvider'
import { LayerControl } from './LayerControl'
import { LeafletGeoJSONData } from './LeafletGeoJSONData'
import useMapContext from './useMapContext'
import { LeafletRivers } from './GeoData';
import { riversMiddleware } from './GeoData/riversMiddleware';

const LeafletMapContainer = dynamic(async () => (await import('./LeafletMapContainer')).LeafletMapContainer, {
  ssr: false,
});

export interface ViewState {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
  zoomLevel: number
}

const getViewState: (map?: Leaflet.Map) => ViewState | undefined = (map?: Leaflet.Map) => {
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

  // we can use this to modify our query for locations
  const [viewState, setViewState] = useState(getViewState(map))

  const {
    width: viewportWidth,
    height: viewportHeight,
    ref: viewportRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 200,
  })

  useEffect(() => {
    if (!map) return undefined

    // you should debounce that by only changing when the map stops moving
    map?.on('moveend', () => {
      setViewState(getViewState(map))
    })

    // cleanup
    return () => {
      map.off()
    }
  }, [map])

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    )
  }

  const isLoading = !map || !viewportWidth || !viewportHeight

  // Default map center and zoom level
  const defaultCenter = AppConfig.baseCenter
  const defaultZoom = AppConfig.minZoom

  return (
    <div className="absolute h-full w-full overflow-hidden" ref={viewportRef}>
      <LayerControl layers={layers} onLayerToggle={handleLayerToggle} />
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
        </>
      </LeafletMapContainer>
    </div>
  )
}

// pass through to get context in <MapInner>
const Map = () => (
  <LeafleftMapContextProvider>
    <LeafletMapInner />
  </LeafleftMapContextProvider>
)

export default Map
