"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { GeoJSONProps } from 'react-leaflet';

import { useGeoJSON, FeatureCollection } from '../../hooks/useGeoJSON';
import { processRiverData } from '../../lib/riversMiddleware';

interface LeafletGeoJSONDataProps {
  url: string;
  pathOptions?: GeoJSONProps['pathOptions'];
  processData?: (data: FeatureCollection) => FeatureCollection;
}

export const LeafletGeoJSONData: React.FC<LeafletGeoJSONDataProps> = ({ 
  url, 
  pathOptions,
  processData = (data) => data // Default processor just returns the data
}) => {
  const { geoJSONData, isLoading, error } = useGeoJSON(url);
  const [processedData, setProcessedData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    if (geoJSONData) {
      // Apply the data processor (could be the riversMiddleware or any other processor)
      const processed = processData(geoJSONData);
      setProcessedData(processed);
    }
  }, [geoJSONData, processData]);

  if (isLoading || error || !processedData) {
    return null;
  }

  // Default style with blue color if not provided
  const defaultPathOptions = {
    color: 'blue',
    weight: 2,
    opacity: 1,
    fillColor: 'blue',
    fillOpacity: 0.2,
    ...pathOptions,
  };

  // Dynamically import GeoJSON component to avoid SSR issues
  const GeoJSON = dynamic(async () => (await import('react-leaflet')).GeoJSON, {
    ssr: false,
  });

  return <GeoJSON data={processedData} pathOptions={defaultPathOptions} />;
};

// Convenience component specifically for rivers
export const LeafletRivers: React.FC<Omit<LeafletGeoJSONDataProps, 'processData'>> = (props) => {
  return <LeafletGeoJSONData {...props} processData={processRiverData} />;
};
