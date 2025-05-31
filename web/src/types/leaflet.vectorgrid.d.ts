// src/types/leaflet.vectorgrid.d.ts
import * as L from 'leaflet';

declare module 'leaflet' {
  interface VectorGridOptions extends L.GridLayerOptions {
    interactive?: boolean;
    getFeatureId?: (feature: any) => string | number;
    vectorTileLayerStyles?: Record<string, L.PathOptions | ((properties: any, zoom: number, type?: string | number) => L.PathOptions)> | ((properties: any, zoom: number, type?: string | number) => L.PathOptions);
    minZoom?: number;
    maxZoom?: number;
    tolerance?: number;
    extent?: number;
    // Add other specific VectorGrid options if known
  }

  namespace VectorGrid {
    // tslint:disable-next-line:no-unnecessary-class
    export class Protobuf extends L.GridLayer {
      constructor(url: string, options?: ProtobufOptions);
      // Add any methods or properties of Protobuf class if needed for type checking
    }
    export function protobuf(url: string, options?: ProtobufOptions): Protobuf;

    interface ProtobufOptions extends VectorGridOptions {
      // specific options for protobuf if any
    }
  }

  // This is another common pattern for Leaflet plugins, L.vectorGrid.protobuf
  namespace vectorGrid {
    export function protobuf(url: string, options?: VectorGrid.ProtobufOptions): VectorGrid.Protobuf;
  }
}
