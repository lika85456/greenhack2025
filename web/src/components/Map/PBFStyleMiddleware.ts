import { PathOptions } from 'leaflet';
import { LayerDefinition } from '@/lib/LayerConfig'; // Adjust path if necessary

export interface PBFStyleOptions {
    layerConfig: LayerDefinition;
}

// This is the function that leaflet.vectorgrid will call for each feature
export function pbfFeatureStyler(
    properties: any,
    zoom: number,
    geometryType: string, // 'Polygon', 'LineString', 'Point'
    options: PBFStyleOptions
): PathOptions {
    console.log('[PBFStyleMiddleware] pbfFeatureStyler attempting to style feature. Props:', properties, 'Zoom:', zoom, 'GeoType:', geometryType, 'Layer ID:', options.layerConfig.id);

    const { layerConfig } = options;
    const baseStyle = layerConfig.style || {};

    // Default style, ensuring fill is attempted
    const style: PathOptions = {
        stroke: baseStyle.stroke !== undefined ? baseStyle.stroke : true,
        weight: baseStyle.weight || 1,
        color: baseStyle.color || '#3388ff', // Default Leaflet blue for stroke
        opacity: baseStyle.opacity || 1.0,
        
        fill: true, // CRITICAL: Ensure fill is enabled
        fillColor: baseStyle.fillColor || '#007bff', // Default to blue, overridden below for specific layer
        fillOpacity: baseStyle.fillOpacity || 0.2, // Default fill opacity, overridden below
    };

    // Specific styling for ZU100 floodplains
    if (layerConfig.id === 'floodplains_100_year') {
        console.log('[PBFStyleMiddleware] Applying ZU100 specific style. Configured fillColor:', layerConfig.style?.fillColor);
        style.fillColor = layerConfig.style?.fillColor || '#007bff'; // Use configured blue
        style.fillOpacity = layerConfig.style?.fillOpacity || 0.6;  // Use configured opacity
        // Optional: define stroke for ZU100 if needed, e.g., make it match fill or be subtle
        style.color = layerConfig.style?.color || layerConfig.style?.fillColor || '#007bff'; // Stroke color for ZU100
        style.weight = layerConfig.style?.weight || 1;
    } else {
        // Generic handling for other PBF layers if any
        console.log(`[PBFStyleMiddleware] Applying generic PBF style for layer ID: ${layerConfig.id}`);
    }

    console.log('[PBFStyleMiddleware] Final style for feature:', style, 'Original props:', properties);
    return style;
}

// Helper to create the options structure for L.vectorGrid.protobuf
export function getVectorGridOptions(layerConfig: LayerDefinition) {
    console.log(`[PBFStyleMiddleware] getVectorGridOptions for layer: ${layerConfig.id}, URL: ${layerConfig.url}`);
    
    const pbfSpecificOptions = layerConfig.vectorTileOptions || {};

    return {
        // This function is called by vectorGrid for each layer name it finds in a PBF tile.
        // It must return the actual styling function for features within that PBF-internal layer.
        vectorTileLayerStyles: (pbfInternalLayerName: string) => {
            console.log(`[PBFStyleMiddleware] vectorTileLayerStyles: Configuring styler for PBF internal layer name: "${pbfInternalLayerName}". Our target layer ID from config: ${layerConfig.id}`);
            
            // This is the function that receives feature properties, zoom, and geometry type
            return (properties: any, zoom: number, geometryType: string) => {
                // Pass the main layerConfig (e.g., for ZU100) to the styler
                return pbfFeatureStyler(properties, zoom, geometryType, { layerConfig });
            };
        },
        interactive: true, // Ensure features are interactive and can be styled
        getFeatureId: (feature: any) => {
            // Log the whole feature to inspect its properties, especially for an ID.
            // This is crucial: if this doesn't log, features aren't being processed.
            console.log('[PBFStyleMiddleware] getFeatureId called. Feature properties:', feature?.properties);
            if (feature && feature.properties) {
                // Common ID property names from PBF/vector tiles
                const id = feature.properties.id || feature.properties.ID || feature.properties.OBJECTID || feature.properties._id || feature.properties.gid;
                if (id !== undefined) return id;
            }
            // Fallback if no standard ID found - this can cause issues with updates/events but helps logging
            const randomId = Math.random().toString(36).substring(2, 15);
            console.warn(`[PBFStyleMiddleware] getFeatureId: No standard ID found on feature, using random ID: ${randomId}. Feature props:`, feature?.properties);
            return randomId;
        },
        maxNativeZoom: pbfSpecificOptions.maxNativeZoom || 20, // Default from leaflet.vectorgrid, or from config
        minNativeZoom: pbfSpecificOptions.minNativeZoom, // from config or undefined
        // Do not specify 'layers' option here, let vectorTileLayerStyles handle all internal PBF layers
        // to aid diagnostics. If 'layers: [pbfSpecificOptions.layerName]' was used and layerName was wrong,
        // no features would be processed.
        ...pbfSpecificOptions // Spread other options from LayerConfig like attribution, etc.
    };
}
