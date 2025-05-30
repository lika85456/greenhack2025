"use client";

import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { LayerConfig } from '#lib/LayerConfig';

export const useLayerQuery = (initialLayers: LayerConfig[]) => {
  const router = useRouter();
  const [layers, setLayers] = useState<LayerConfig[]>(initialLayers);

  // Parse query parameters to get selected layers
  const parseLayersFromQuery = useCallback((query: any): string[] => {
    const layersParam = query.layers;
    if (!layersParam) return [];
    
    if (typeof layersParam === 'string') {
      return layersParam.split(',').filter(Boolean);
    }
    
    return [];
  }, []);

  // Update URL query when layers change
  const updateQuery = useCallback((visibleLayerIds: string[]) => {
    const currentQuery = { ...router.query };
    
    if (visibleLayerIds.length > 0) {
      currentQuery.layers = visibleLayerIds.join(',');
    } else {
      delete currentQuery.layers;
    }

    router.replace(
      {
        pathname: router.pathname,
        query: currentQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  // Initialize layers from URL query on mount
  useEffect(() => {
    if (!router.isReady) return;

    const selectedLayerIds = parseLayersFromQuery(router.query);
    
    if (selectedLayerIds.length > 0) {
      setLayers(prevLayers =>
        prevLayers.map(layer => ({
          ...layer,
          visible: selectedLayerIds.includes(layer.id)
        }))
      );
    }
  }, [router.isReady, router.query, parseLayersFromQuery]);

  // Handle layer toggle
  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    setLayers(prevLayers => {
      const updatedLayers = prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      );
      
      // Update URL query with new visible layers
      const visibleLayerIds = updatedLayers
        .filter(layer => layer.visible)
        .map(layer => layer.id);
      
      updateQuery(visibleLayerIds);
      
      return updatedLayers;
    });
  }, [updateQuery]);

  return {
    layers,
    handleLayerToggle,
  };
};
