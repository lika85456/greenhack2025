import { FeatureCollection } from '../../../hooks/useGeoJSON';

/**
 * Middleware to process airports GeoJSON data
 * Fixes inverted coordinates by swapping latitude and longitude
 * 
 * @param geoJSON The original GeoJSON data from airports.geojson
 * @returns The processed GeoJSON data with corrected coordinates
 */
export const airportsMiddleware = (geoJSON: FeatureCollection): FeatureCollection => {
  try {
    // Process each feature to fix inverted coordinates
    const correctedFeatures = geoJSON.features.map(feature => {
      if (!feature.geometry) {
        return feature;
      }

      // Create a deep copy of the feature to avoid mutating the original
      const correctedFeature = JSON.parse(JSON.stringify(feature));

      // Function to invert coordinates [lng, lat] -> [lat, lng]
      const invertCoordinates = (coords: any): any => {
        if (Array.isArray(coords)) {
          // Check if this is a coordinate pair [lng, lat]
          if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            return [coords[1], coords[0]]; // Swap lng and lat
          }
          // If it's an array of coordinates, recursively process each
          return coords.map(invertCoordinates);
        }
        return coords;
      };

      // Apply coordinate inversion based on geometry type
      switch (correctedFeature.geometry.type) {
        case 'Point':
          correctedFeature.geometry.coordinates = invertCoordinates(correctedFeature.geometry.coordinates);
          break;
        case 'MultiPoint':
        case 'LineString':
          correctedFeature.geometry.coordinates = invertCoordinates(correctedFeature.geometry.coordinates);
          break;
        case 'MultiLineString':
        case 'Polygon':
          correctedFeature.geometry.coordinates = invertCoordinates(correctedFeature.geometry.coordinates);
          break;
        case 'MultiPolygon':
          correctedFeature.geometry.coordinates = invertCoordinates(correctedFeature.geometry.coordinates);
          break;
        case 'GeometryCollection':
          if (correctedFeature.geometry.geometries) {
            correctedFeature.geometry.geometries = correctedFeature.geometry.geometries.map((geom: any) => {
              const tempFeature = { geometry: geom };
              const processed = airportsMiddleware({ type: 'FeatureCollection', features: [tempFeature] });
              return processed.features[0].geometry;
            });
          }
          break;
        default:
          console.warn(`Unknown geometry type: ${correctedFeature.geometry.type}`);
      }

      return correctedFeature;
    });

    // Return the corrected FeatureCollection
    return {
      type: 'FeatureCollection',
      features: correctedFeatures
    };
  } catch (error) {
    console.error('Error in airportsMiddleware:', error);
    // Return original data if processing fails
    return geoJSON;
  }
};
