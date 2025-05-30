import { FeatureCollection } from '../../../hooks/useGeoJSON';
import * as turf from '@turf/turf';

/**
 * Middleware to merge connected shapes in GeoJSON data
 * Uses turf.js to merge overlapping polygons into single features
 * 
 * @param geoJSON The original GeoJSON data
 * @returns The processed GeoJSON data with merged connected shapes
 */
export const mergeShapesMiddleware = (geoJSON: FeatureCollection): FeatureCollection => {
  try {
    // Get all polygon features
    const polygons = geoJSON.features.filter(f => 
      f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
    );

    if (polygons.length <= 1) {
      return geoJSON;
    }

    // Start with the first polygon
    let result = polygons[0];

    // Merge each subsequent polygon
    for (let i = 1; i < polygons.length; i++) {
      try {
        result = turf.union(result, polygons[i]);
      } catch (error) {
        console.warn(`Failed to merge polygon ${i}:`, error);
      }
    }

    // Return the merged result
    return {
      type: 'FeatureCollection',
      features: [result]
    };
  } catch (error) {
    console.error('Error in mergeShapesMiddleware:', error);
    return geoJSON;
  }
}; 