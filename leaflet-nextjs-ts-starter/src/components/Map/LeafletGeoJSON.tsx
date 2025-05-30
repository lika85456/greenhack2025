"use client";

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { GeoJSONProps } from 'react-leaflet'

// Function to fetch GeoJSON data
const fetchGeoJSON = async (url: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching GeoJSON:', error)
    return null
  }
}

interface LeafletGeoJSONProps {
  url: string
  pathOptions?: GeoJSONProps['pathOptions']
}

export const LeafletGeoJSON: React.FC<LeafletGeoJSONProps> = ({ url, pathOptions }) => {
  // Define GeoJSON FeatureCollection type
  type FeatureCollection = {
    type: 'FeatureCollection';
    features: Array<any>;
  }
  
  const [geoJSONData, setGeoJSONData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    const loadGeoJSON = async () => {
      const data = await fetchGeoJSON(url)
      setGeoJSONData(data)
    }

    loadGeoJSON()
  }, [url])

  if (!geoJSONData) {
    return null
  }

  // Default style with blue color if not provided
  const defaultPathOptions = {
    color: 'blue',
    weight: 2,
    opacity: 1,
    fillColor: 'blue',
    fillOpacity: 0.2,
    ...pathOptions,
  }

  // Dynamically import GeoJSON component to avoid SSR issues
  const GeoJSON = dynamic(async () => (await import('react-leaflet')).GeoJSON, {
    ssr: false,
  });

  return <GeoJSON data={geoJSONData} pathOptions={defaultPathOptions} />
}
