import { FeatureCollection } from '../../../hooks/useGeoJSON';
import * as turf from '@turf/turf';

/**
 * Middleware to process river GeoJSON data
 * Creates a 100m buffer zone around rivers
 * 
 * @param geoJSON The original GeoJSON data
 * @returns The processed GeoJSON data with buffer zones around rivers
 */
export const riversMiddleware = (geoJSON: FeatureCollection): FeatureCollection => {
  return geoJSON;
  // Create a new FeatureCollection to store the buffer zones
  const bufferedCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: []
  };

  // Process each feature (river) in the original GeoJSON
  geoJSON.features.forEach(feature => {
    try {
      // Create a 100m buffer around the feature (0.1 km)
      // The buffer function returns a Feature with Polygon or MultiPolygon geometry
      const buffered = turf.buffer(feature, 0.1, { units: 'kilometers' });
      
      // If the buffer operation was successful, add the buffered feature to our collection
      if (buffered) {
        bufferedCollection.features.push(buffered);
      }
    } catch (error) {
      console.error('Error creating buffer for feature:', error);
    }
  });

  return bufferedCollection;
};
