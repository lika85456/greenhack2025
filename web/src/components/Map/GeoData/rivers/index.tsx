"use client";

import { LeafletGeoJSONData } from '../../LeafletGeoJSONData';
import { processRiverData } from './riversMiddleware';
import type { GeoJSONProps } from 'react-leaflet';

interface LeafletRiversProps {
  url: string;
  pathOptions?: GeoJSONProps['pathOptions'];
}

/**
 * A specialized component for rendering river GeoJSON data with buffer zones
 * Uses the riversMiddleware to process the data
 */
const LeafletRivers: React.FC<LeafletRiversProps> = (props) => {
  return <LeafletGeoJSONData {...props} processData={processRiverData} />;
};

export default LeafletRivers;
