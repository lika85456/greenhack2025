import Leaflet from 'leaflet'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useResizeDetector } from 'react-resize-detector'

import MapTopBar from '#components/TopBar'
import { AppConfig } from '#lib/AppConfig'

import LeafleftMapContextProvider from './LeafletMapContextProvider'
import useMapContext from './useMapContext'

const LeafletMapContainer = dynamic(async () => (await import('./LeafletMapContainer')).LeafletMapContainer, {
  ssr: false,
})

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

  const isLoading = !map || !viewportWidth || !viewportHeight

  // Default map center and zoom level
  const defaultCenter = AppConfig.baseCenter
  const defaultZoom = AppConfig.minZoom

  return (
    <div className="absolute h-full w-full overflow-hidden" ref={viewportRef}>
      <MapTopBar />
      <div
        className={`absolute left-0 w-full transition-opacity ${isLoading ? 'opacity-0' : 'opacity-1 '}`}
        style={{
          top: AppConfig.ui.topBarHeight,
          width: viewportWidth ?? '100%',
          height: viewportHeight ? viewportHeight - AppConfig.ui.topBarHeight : '100%',
        }}
      >
        <LeafletMapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          maxZoom={AppConfig.maxZoom}
          minZoom={AppConfig.minZoom}
        >
          {/* Plain simple map with no markers */}
          {!isLoading ? (
            <></>
          ) : (
            // we have to spawn at least one element to keep it happy
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <></>
          )}
        </LeafletMapContainer>
      </div>
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
