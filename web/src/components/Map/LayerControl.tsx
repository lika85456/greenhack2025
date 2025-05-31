"use client";

import { useState, useRef } from 'react';
import { LayerConfig } from '#lib/LayerConfig';

interface LayerControlProps {
  layers: LayerConfig[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerAdd?: (layer: LayerConfig) => void;
}

export const LayerControl: React.FC<LayerControlProps> = ({ layers, onLayerToggle, onLayerAdd }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is GeoJSON
    if (!file.name.toLowerCase().endsWith('.geojson')) {
      alert('Please upload a GeoJSON file (.geojson)');
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Validate JSON
      let geoJsonData;
      try {
        geoJsonData = JSON.parse(fileContent);
      } catch (error) {
        alert('Invalid JSON file. Please upload a valid GeoJSON file.');
        setIsUploading(false);
        return;
      }

      // Basic GeoJSON validation
      if (!geoJsonData.type || geoJsonData.type !== 'FeatureCollection') {
        alert('Invalid GeoJSON format. File must be a FeatureCollection.');
        setIsUploading(false);
        return;
      }

      // Create a data URL for the file content
      // Use encodeURIComponent and btoa to handle Unicode characters properly
      const encodedContent = encodeURIComponent(fileContent);
      const dataUrl = `data:application/json;charset=utf-8,${encodedContent}`;
      
      // Generate a unique layer ID based on filename and timestamp
      const layerId = `uploaded_${file.name.replace('.geojson', '').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      
      // Create new layer config
      const newLayer: LayerConfig = {
        id: layerId,
        name: file.name.replace('.geojson', ''),
        url: dataUrl,
        type: 'geojson',
        visible: true,
        style: {
          color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
          weight: 2,
          opacity: 1,
          fillOpacity: 0.2,
        }
      };

      // Add the new layer
      if (onLayerAdd) {
        onLayerAdd(newLayer);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3">Layers</h3>
      
      {/* Upload button */}
      <div className="mb-3">
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="w-full px-3 py-2 text-sm bg-blue-500 text-black rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload GeoJSON'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Layer list */}
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
            <div 
              className="w-4 h-4 border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: layer.style?.color || layer.style?.fillColor || '#000000' }}
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
