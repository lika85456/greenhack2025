"use client";

import dynamic from 'next/dynamic';

import type { GeoJSONProps } from 'react-leaflet';

import { useGeoJSONCached, FeatureCollection } from '../../hooks/useGeoJSONCached';

interface LeafletGeoJSONDataProps {
  url: string;
  pathOptions?: GeoJSONProps['pathOptions'];
  processData?: (data: FeatureCollection) => FeatureCollection;
  color?: string; // Optional color prop for styling
}

export const LeafletGeoJSONData: React.FC<LeafletGeoJSONDataProps> = ({
  url, 
  pathOptions,
  processData = (data) => data, // Default processor just returns the data
  color,
}) => {
  // Use cached hook that handles both fetching and processing with caching
  const { processedData, isLoading, error } = useGeoJSONCached(url, processData);

  if (isLoading || error || !processedData) {
    return null;
  }

  // Default style with blue color if not provided
  const defaultPathOptions = {
    color: color,
    weight: 2,
    opacity: 1,
    fillColor: color,
    fillOpacity: 0.2,
    ...pathOptions,
  };

  // Dynamically import GeoJSON component to avoid SSR issues
  const GeoJSON = dynamic(async () => (await import('react-leaflet')).GeoJSON, {
    ssr: false,
  });

  return <GeoJSON data={processedData} pathOptions={defaultPathOptions} />;
};
