"use client";

import { useState } from 'react';
import { LayerConfig } from '#lib/LayerConfig';

interface LayerControlProps {
  layers: LayerConfig[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({ layers, onLayerToggle }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3">Layers</h3>
      <div className="space-y-2">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={layer.id}
              checked={layer.visible}
              onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor={layer.id} className="text-sm">
              {layer.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}; 