import { useState, useEffect, useCallback } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { ViewportBounds } from '../lib/geoJSONUtils';

export interface MapState {
  zoom: number;
  viewport: ViewportBounds;
  center: { lat: number; lng: number };
}

/**
 * Hook to track map state changes with debouncing for performance
 */
export const useMapState = (map: LeafletMap | undefined, debounceMs: number = 300) => {
  const [mapState, setMapState] = useState<MapState | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const updateMapState = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    const center = map.getCenter();
    const zoom = map.getZoom();

    setMapState({
      zoom,
      viewport: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      center: {
        lat: center.lat,
        lng: center.lng,
      },
    });
    setIsMoving(false);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    let debounceTimer: NodeJS.Timeout;

    const handleMoveStart = () => {
      setIsMoving(true);
    };

    const handleMoveEnd = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateMapState, debounceMs);
    };

    const handleZoomEnd = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateMapState, debounceMs);
    };

    // Initial state
    updateMapState();

    // Add event listeners
    map.on('movestart', handleMoveStart);
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    return () => {
      clearTimeout(debounceTimer);
      map.off('movestart', handleMoveStart);
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, updateMapState, debounceMs]);

  return { mapState, isMoving };
};
