import { electricalMiddleware } from "#components/Map/GeoData/electricalMiddleware";
import { riversMiddleware } from "#components/Map/GeoData/riversMiddleware";

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
  middleware?: (data: any) => any; // Optional middleware function for processing data
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
    middleware: riversMiddleware
  },
  {
    id: "chko",
    name: "National parks",
    url: "/chko.geojson",
    type: "geojson",
    visible: true,
    style: {
      color: "green",
      weight: 2,
      opacity: 1,
      fillColor: "green",
      fillOpacity: 0.2,
    },
    middleware: undefined // No middleware for this layer
  },
  {
    id: "fields",
    name: "Fields",
    url: "/fields.geojson",
    type: "geojson",
    visible: false,
    style: {
      color: "yellow",
      weight: 2,
      opacity: 1,
      fillColor: "yellow",
      fillOpacity: 0.2,
    }
  },
  {
    id:"electrical",
    name: "Electrical Infrastructure",
    url: "/electrical.geojson",
    type: "geojson",
    visible: false,
    style: {
      color: "orange",
      weight: 2,
      opacity: 1,
      fillColor: "orange",
      fillOpacity: 0.2,
    }
  },
    {
      id:"electrical_major",
      name: "Major Electrical Infrastructure",
      url: "/electrical_major.geojson",
      type: "geojson",
      visible: true,
      style: {
        color: "orange",
        weight: 2,
        opacity: 1,
        fillColor: "orange",
        fillOpacity: 0.2,
      },
      middleware: electricalMiddleware // No middleware for this layer
    },
    {
      id:"forests",
      name: "Forests",
      url: "/forests.geojson",
      type: "geojson",
      visible: true,
      style: {
        color: "brown",
        weight: 2,
        opacity: 1,
        fillColor: "brown",
        fillOpacity: 0.2,
      },
    },
    {
      id:"mines_undermined",
      name: "Mines and Undermined Areas",
      url: "/mines_undermined.geojson",
      type: "geojson",
      visible: true,
      style: {
        color: "red",
        weight: 2,
        opacity: 1,
        fillColor: "red",
        fillOpacity: 0.2,
      },
    }
]; 