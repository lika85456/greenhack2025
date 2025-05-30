import { FeatureCollection } from '../../../hooks/useGeoJSON';

/**
 * Middleware to process electrical GeoJSON data
 * Removes point markers from electrical_major.geojson data
 * Keeps only line and polygon features (electrical infrastructure like power lines)
 * 
 * @param geoJSON The original GeoJSON data from electrical_major.geojson
 * @returns The processed GeoJSON data with point markers removed
 */
export const electricalMiddleware = (geoJSON: FeatureCollection): FeatureCollection => {
  try {
    // Filter out Point and MultiPoint features (markers)
    // Keep LineString, MultiLineString, Polygon, and MultiPolygon features
    const filteredFeatures = geoJSON.features.filter(feature => {
      const geometryType = feature.geometry?.type;
      
      // Remove Point and MultiPoint geometries (these are typically markers)
      return geometryType !== 'Point' && geometryType !== 'MultiPoint';
    });

    // Return the filtered FeatureCollection
    return {
      type: 'FeatureCollection',
      features: filteredFeatures
    };
  } catch (error) {
    console.error('Error in electricalMiddleware:', error);
    // Return original data if processing fails
    return geoJSON;
  }
};
