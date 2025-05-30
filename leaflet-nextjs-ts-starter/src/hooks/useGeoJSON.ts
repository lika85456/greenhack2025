import { useState, useEffect } from 'react';

// Define GeoJSON FeatureCollection type
export type FeatureCollection = {
  type: 'FeatureCollection';
  features: Array<any>;
}

/**
 * Custom hook to fetch and manage GeoJSON data
 * @param url The URL to fetch GeoJSON data from
 * @returns An object containing the GeoJSON data and loading state
 */
export const useGeoJSON = (url: string) => {
  const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGeoJSON = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        const data = await response.json();
        setGeoJSONData(data);
      } catch (err) {
        console.error('Error fetching GeoJSON:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setGeoJSONData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoJSON();
  }, [url]);

  return { geoJSONData, isLoading, error };
};
