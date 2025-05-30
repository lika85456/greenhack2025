export interface LayerConfig {
  id: string;
  name: string;
  url: string;
  type: 'geojson' | 'wms' | 'xyz';
  visible: boolean;
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
    fillColor?: string;
    fillOpacity?: number;
  };
}

export const defaultLayers: LayerConfig[] = [
  {
    id: 'rivers',
    name: 'Rivers',
    url: '/reky.geojson',
    type: 'geojson',
    visible: true,
    style: {
      color: 'blue',
      weight: 2,
      opacity: 1,
      fillColor: 'blue',
      fillOpacity: 0.2,
    },
  },
  // Add more layers here as needed
]; 