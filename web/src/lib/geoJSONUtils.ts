import { FeatureCollection } from '../hooks/useGeoJSONCached';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RenderLimits {
  maxFeatures?: number;
  minZoomForPoints?: number;
  minZoomForLines?: number;
  minZoomForPolygons?: number;
  simplificationTolerance?: number;
}

/**
 * Check if a feature intersects with the viewport bounds
 */
const featureIntersectsViewport = (feature: any, bounds: ViewportBounds): boolean => {
  if (!feature.geometry) return false;

  const { geometry } = feature;
  
  switch (geometry.type) {
    case 'Point':
      const [lng, lat] = geometry.coordinates;
      return lat >= bounds.south && lat <= bounds.north && 
             lng >= bounds.west && lng <= bounds.east;
    
    case 'LineString':
    case 'MultiLineString':
      const coords = geometry.type === 'LineString' ? 
        geometry.coordinates : geometry.coordinates.flat();
      return coords.some(([lng, lat]: [number, number]) =>
        lat >= bounds.south && lat <= bounds.north && 
        lng >= bounds.west && lng <= bounds.east
      );
    
    case 'Polygon':
    case 'MultiPolygon':
      // For polygons, check if any coordinate is within bounds
      // This is a simplified check - a more accurate one would check for actual intersection
      const polyCoords = geometry.type === 'Polygon' ? 
        geometry.coordinates.flat() : geometry.coordinates.flat(2);
      return polyCoords.some(([lng, lat]: [number, number]) =>
        lat >= bounds.south && lat <= bounds.north && 
        lng >= bounds.west && lng <= bounds.east
      );
    
    default:
      return true; // Include unknown geometry types
  }
};

/**
 * Simplify geometry coordinates based on tolerance
 * This is a basic implementation - for production use consider using turf.js
 */
const simplifyCoordinates = (coordinates: number[][], tolerance: number): number[][] => {
  if (coordinates.length <= 2) return coordinates;
  
  const simplified = [coordinates[0]]; // Always keep first point
  
  for (let i = 1; i < coordinates.length - 1; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const next = coordinates[i + 1];
    
    // Calculate distance from current point to line between prev and next
    const distance = Math.abs(
      (next[1] - prev[1]) * curr[0] - (next[0] - prev[0]) * curr[1] + 
      next[0] * prev[1] - next[1] * prev[0]
    ) / Math.sqrt(Math.pow(next[1] - prev[1], 2) + Math.pow(next[0] - prev[0], 2));
    
    if (distance > tolerance) {
      simplified.push(curr);
    }
  }
  
  simplified.push(coordinates[coordinates.length - 1]); // Always keep last point
  return simplified;
};

/**
 * Apply simplification to a feature's geometry
 */
const simplifyFeatureGeometry = (feature: any, tolerance: number): any => {
  if (!feature.geometry || tolerance <= 0) return feature;
  
  const { geometry } = feature;
  
  switch (geometry.type) {
    case 'LineString':
      return {
        ...feature,
        geometry: {
          ...geometry,
          coordinates: simplifyCoordinates(geometry.coordinates, tolerance)
        }
      };
    
    case 'Polygon':
      return {
        ...feature,
        geometry: {
          ...geometry,
          coordinates: geometry.coordinates.map((ring: number[][]) => 
            simplifyCoordinates(ring, tolerance)
          )
        }
      };
    
    case 'MultiLineString':
      return {
        ...feature,
        geometry: {
          ...geometry,
          coordinates: geometry.coordinates.map((line: number[][]) => 
            simplifyCoordinates(line, tolerance)
          )
        }
      };
    
    case 'MultiPolygon':
      return {
        ...feature,
        geometry: {
          ...geometry,
          coordinates: geometry.coordinates.map((polygon: number[][][]) =>
            polygon.map((ring: number[][]) => simplifyCoordinates(ring, tolerance))
          )
        }
      };
    
    default:
      return feature;
  }
};

/**
 * Filter and limit GeoJSON features based on zoom level, viewport, and rendering limits
 */
export const limitGeoJSONFeatures = (
  data: FeatureCollection,
  zoomLevel: number,
  viewport?: ViewportBounds,
  limits: RenderLimits = {}
): FeatureCollection => {
  const {
    maxFeatures = 1000,
    minZoomForPoints = 10,
    minZoomForLines = 8,
    minZoomForPolygons = 6,
    simplificationTolerance = 0
  } = limits;

  let filteredFeatures = data.features.filter(feature => {
    if (!feature.geometry) return false;
    
    const geometryType = feature.geometry.type;
    
    // Filter by zoom level
    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
      if (zoomLevel < minZoomForPoints) return false;
    } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      if (zoomLevel < minZoomForLines) return false;
    } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      if (zoomLevel < minZoomForPolygons) return false;
    }
    
    // Filter by viewport if provided
    if (viewport && !featureIntersectsViewport(feature, viewport)) {
      return false;
    }
    
    return true;
  });

  // Limit number of features
  if (filteredFeatures.length > maxFeatures) {
    // Sort by some criteria (e.g., area for polygons, length for lines)
    // For now, just take the first N features
    filteredFeatures = filteredFeatures.slice(0, maxFeatures);
  }

  // Apply simplification if tolerance is set
  if (simplificationTolerance > 0) {
    filteredFeatures = filteredFeatures.map(feature => 
      simplifyFeatureGeometry(feature, simplificationTolerance)
    );
  }

  return {
    type: 'FeatureCollection',
    features: filteredFeatures
  };
};

/**
 * Get default render limits based on layer type
 */
export const getDefaultRenderLimits = (layerType: string): RenderLimits => {
  switch (layerType) {
    case 'rivers':
      return {
        maxFeatures: 500,
        minZoomForLines: 8,
        simplificationTolerance: 0.001
      };
    
    case 'electrical_major':
      return {
        maxFeatures: 300,
        minZoomForLines: 7,
        minZoomForPoints: 10,
        simplificationTolerance: 0.0005
      };
    
    case 'chko':
      return {
        maxFeatures: 100,
        minZoomForPolygons: 6,
        simplificationTolerance: 0.002
      };
    
    case 'fields':
      return {
        maxFeatures: 200,
        minZoomForPolygons: 9,
        simplificationTolerance: 0.003
      };
    
    default:
      return {
        maxFeatures: 500,
        minZoomForPoints: 10,
        minZoomForLines: 8,
        minZoomForPolygons: 6,
        simplificationTolerance: 0.001
      };
  }
};
