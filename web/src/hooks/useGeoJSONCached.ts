import { useState, useEffect, useMemo } from 'react';

// Define GeoJSON FeatureCollection type
export type FeatureCollection = {
  type: 'FeatureCollection';
  features: Array<any>;
}

// Cache for storing fetched and processed data
const dataCache = new Map<string, FeatureCollection>();
const processedCache = new Map<string, FeatureCollection>();

/**
 * Enhanced hook to fetch and manage GeoJSON data with caching and processing
 * @param url The URL to fetch GeoJSON data from
 * @param processData Optional function to process the data
 * @param cacheKey Optional cache key for processed data (defaults to url + processor hash)
 * @returns An object containing the GeoJSON data and loading state
 */
export const useGeoJSONCached = (
  url: string,
  processData?: (data: FeatureCollection) => FeatureCollection,
  cacheKey?: string
) => {
  const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);
  const [processedData, setProcessedData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Generate cache key for processed data
  const processCacheKey = useMemo(() => {
    if (cacheKey) return cacheKey;
    const processorHash = processData ? processData.toString().slice(0, 50) : 'none';
    return `${url}_${processorHash}`;
  }, [url, processData, cacheKey]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if processed data is already cached
        if (processedCache.has(processCacheKey)) {
          const cached = processedCache.get(processCacheKey)!;
          setGeoJSONData(cached);
          setProcessedData(cached);
          setIsLoading(false);
          return;
        }

        // Check if raw data is cached
        let rawData: FeatureCollection;
        if (dataCache.has(url)) {
          rawData = dataCache.get(url)!;
        } else {
          // Handle data URLs differently from regular URLs
          if (url.startsWith('data:')) {
            // Parse data URL
            const base64Data = url.split(',')[1];
            const jsonString = atob(base64Data);
            rawData = JSON.parse(jsonString);
          } else {
            // Fetch data from regular URL
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
            }
            rawData = await response.json();
          }
          dataCache.set(url, rawData);
        }

        setGeoJSONData(rawData);

        // Process data first if processor is provided
        let processed = rawData;
        if (processData) {
          processed = processData(rawData);
        }

        // convert all markers to small polygons
        processed.features = processed.features.map(feature => {
          if (feature.geometry?.type === 'Point') {
            // Convert Point to a small Polygon (e.g., 10m x 10m square)
            const coords = feature.geometry.coordinates;
            return {
              ...feature,
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [coords[0] - 0.0001, coords[1] - 0.0001],
                  [coords[0] + 0.0001, coords[1] - 0.0001],
                  [coords[0] + 0.0001, coords[1] + 0.0001],
                  [coords[0] - 0.0001, coords[1] + 0.0001],
                  [coords[0] - 0.0001, coords[1] - 0.0001]
                ]]
              }
            };
          }
          return feature;
        }
        );

        // Then remove all markers (Point features) from the processed data
        const processedWithoutMarkers: FeatureCollection = {
          ...processed,
          features: processed.features.filter(feature => 
            // feature.geometry?.type !== 'Point'
            true
          )
        };

        // Use the processed data without markers as final result
        processed = processedWithoutMarkers;

        // Cache processed data
        processedCache.set(processCacheKey, processed);
        setProcessedData(processed);

      } catch (err) {
        console.error('Error fetching/processing GeoJSON:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setGeoJSONData(null);
        setProcessedData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, [url, processData, processCacheKey]);

  return { 
    geoJSONData, 
    processedData: processedData || geoJSONData, 
    isLoading, 
    error 
  };
};

/**
 * Clear all cached data
 */
export const clearGeoJSONCache = () => {
  dataCache.clear();
  processedCache.clear();
};

/**
 * Clear specific cached data
 */
export const clearGeoJSONCacheForUrl = (url: string) => {
  dataCache.delete(url);
  // Clear all processed cache entries for this URL
  for (const key of processedCache.keys()) {
    if (key.startsWith(url)) {
      processedCache.delete(key);
    }
  }
};
