"use client";

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { LayerConfig } from '#lib/LayerConfig';
import useMapContext from './useMapContext';

interface LeafletPBFDataProps {
  layer: LayerConfig;
}

const LeafletPBFDataInner = ({ layer }: LeafletPBFDataProps) => {
  const { map } = useMapContext();
  const vectorTileRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !layer.visible) {
      if (vectorTileRef.current) {
        vectorTileRef.current.remove();
        vectorTileRef.current = null;
      }
      return;
    }

    const initVectorTile = async () => {
      const L = (await import('leaflet')).default;
      // @ts-ignore
      await import('leaflet.vectorgrid');

      // @ts-ignore
      const vectorTile = L.vectorGrid.protobuf(layer.url, {
        vectorTileLayerStyles: {
          ZU100: {
            fill: true,
            weight: layer.style?.weight || 1,
            fillColor: layer.style?.fillColor || '#0066cc',
            color: layer.style?.color || '#0066cc',
            fillOpacity: layer.style?.fillOpacity || 0.2,
            opacity: layer.style?.opacity || 0.8,
          },
        },
        maxZoom: layer.vectorTileOptions?.maxZoom || 18,
        minZoom: layer.vectorTileOptions?.minZoom || 0,
        tolerance: layer.vectorTileOptions?.tolerance || 3,
        extent: layer.vectorTileOptions?.extent || 4096,
      });

      vectorTileRef.current = vectorTile;
      vectorTile.addTo(map);
    };

    initVectorTile();

    return () => {
      if (vectorTileRef.current) {
        vectorTileRef.current.remove();
        vectorTileRef.current = null;
      }
    };
  }, [layer, map]);

  return null;
};

// Dynamically import the component to avoid SSR issues
const LeafletPBFData = dynamic(async () => {
  const L = (await import('leaflet')).default;
  await import('leaflet.vectorgrid');
  return LeafletPBFDataInner;
}, {
  ssr: false,
});

export { LeafletPBFData }; 