import { electricalMiddleware } from "#components/Map/GeoData/electricalMiddleware";
import { riversMiddleware } from "#components/Map/GeoData/riversMiddleware";

export interface LayerConfig {
  id: string;
  name: string;
  url: string;
  type: 'geojson' | 'wms' | 'xyz' | 'pbf'; // Added 'pbf' type
  visible: boolean;
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
    fillColor?: string;
    fillOpacity?: number;
  };
  middleware?: (data: any) => any; // Optional middleware function for processing data
  vectorTileOptions?: { // Optional options for vector tiles
    maxZoom?: number;
    minZoom?: number;
    tolerance?: number;
    extent?: number;
    layerName?: string; // Added layerName for PBF layers
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
    },
    {
      id: "floodplains_100_year", // Changed from "zu100"
      name: "100-year Floodplains", // Changed from "ZU100"
      url: "https://tiles.arcgis.com/tiles/ZszVN9lBVA5x4VmX/arcgis/rest/services/ZU100/VectorTileServer/tile/{z}/{y}/{x}.pbf",
      type: "pbf",
      visible: true,
      style: {
        color: "#007bff", // Adjusted to a blue color, more fitting for water
        weight: 1,
        opacity: 0.7,
        fillColor: "#007bff", // Adjusted to a blue color
        fillOpacity: 0.4, // Slightly increased opacity for better visibility
      },
      vectorTileOptions: {
        layerName: "ZU100", // This should match the layer name in the PBF, likely still ZU100
        maxZoom: 18, 
      }
    }
];