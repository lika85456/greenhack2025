"use client";

import React, { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { FeatureCollection } from '../../hooks/useGeoJSON';
import * as turf from '@turf/turf';
import { Feature, Geometry } from 'geojson'; // Import standard GeoJSON types
import { LayerConfig } from '../../lib/LayerConfig'; // Added import for LayerConfig

interface EnvironmentInfoProps {
  clickedPosition: LatLng | null;
  riversData: FeatureCollection | null;
  parksData: FeatureCollection | null;
  fieldsData: FeatureCollection | null;
  layers: LayerConfig[]; // Added layers prop
}

const calculateEnvironmentIndex = (
  clickedPosition: LatLng | null,
  riversStrength: number,
  parksStrength: number,
  distanceToRiver: number | string,
  distanceToPark: number | string
): number => {
  if (!clickedPosition) return 0;
  let index = (riversStrength * 0.05) + (parksStrength * 0.03);
  // Add penalty for being too close to a river or park
  if (typeof distanceToRiver === 'number' && distanceToRiver < 0.1) { // less than 100m
    index -= (1 - distanceToRiver / 0.1) * 10; // Penalty up to 10
  }
  if (typeof distanceToPark === 'number' && distanceToPark < 0.5) { // less than 500m
    index -= (1 - distanceToPark / 0.5) * 5; // Penalty up to 5
  }
  // Add bonus for latitude/longitude (simple placeholder)
  index += (clickedPosition.lat + clickedPosition.lng) / 200;
  return Math.max(0, Math.min(100, index)); // Ensure index is between 0 and 100
};

const calculateDistanceToNearestFeature = (
  point: LatLng | null,
  featuresCollection: FeatureCollection | null
): number | string => {
  if (!point || !featuresCollection || !featuresCollection.features || featuresCollection.features.length === 0) {
    return 'N/A';
  }
  const from = turf.point([point.lng, point.lat]);
  let minDistance = Infinity;

  featuresCollection.features.forEach((feature: Feature<Geometry>) => {
    if (feature && feature.geometry) {
      try {
        let distance;
        // turf.distance should handle various feature types as the second argument
        // as long as the first is a Point.
        // The issue might be with specific feature geometries or types within your GeoJSON.
        // Let's ensure the feature itself is valid before passing to turf.distance
        if (feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
            distance = turf.distance(from, feature, { units: 'kilometers' });
            if (distance < minDistance) {
              minDistance = distance;
            }
        } else if (feature.geometry && feature.geometry.type === 'GeometryCollection' && feature.geometry.geometries) {
            // Handle GeometryCollection by iterating its geometries
            (feature.geometry as turf.GeometryCollection).geometries.forEach(geom => {
                // Create a temporary feature for each geometry to calculate distance
                const tempFeature = turf.feature(geom);
                const distToGeom = turf.distance(from, tempFeature, { units: 'kilometers' });
                if (distToGeom < minDistance) {
                    minDistance = distToGeom;
                }
            });
        }
      } catch (e) {
        console.error("Error calculating distance to feature:", feature, e);
      }
    }
  });

  return minDistance === Infinity ? 'N/A' : minDistance;
};

export const EnvironmentInfo: React.FC<EnvironmentInfoProps> = ({
  clickedPosition,
  riversData,
  parksData,
  fieldsData,
  layers, // Destructure new prop
}) => {
  const [riversStrength, setRiversStrength] = useState(50);
  const [parksStrength, setParksStrength] = useState(50);

  const [distanceToRiver, setDistanceToRiver] = useState<number | string>('N/A');
  const [distanceToPark, setDistanceToPark] = useState<number | string>('N/A');
  const [distanceToFields, setDistanceToFields] = useState<number | string>('N/A'); // Added state for fields distance

  useEffect(() => {
    setDistanceToRiver(calculateDistanceToNearestFeature(clickedPosition, riversData));
    setDistanceToPark(calculateDistanceToNearestFeature(clickedPosition, parksData));

    const fieldsLayer = layers.find(layer => layer.id === 'fields');
    if (fieldsLayer?.visible && fieldsData && clickedPosition) {
      setDistanceToFields(calculateDistanceToNearestFeature(clickedPosition, fieldsData));
    } else {
      setDistanceToFields('N/A');
    }
  }, [clickedPosition, riversData, parksData, fieldsData, layers]); // Added fieldsData and layers to dependency array

  const environmentIndex = calculateEnvironmentIndex(
    clickedPosition,
    riversStrength,
    parksStrength,
    distanceToRiver,
    distanceToPark
  );

  if (!clickedPosition) {
    return (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs w-full">
            <h3 className="text-lg font-semibold mb-3">Environment Info</h3>
            <p className="text-sm text-gray-500">Click on the map to see details.</p>
        </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs w-full">
      <h3 className="text-lg font-semibold mb-3">Environment Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Clicked Position:</strong> {clickedPosition.lat.toFixed(5)}, {clickedPosition.lng.toFixed(5)}
        </div>
        <div>
          <strong>Distance to closest river:</strong> {typeof distanceToRiver === 'number' ? `${(distanceToRiver * 1000).toFixed(0)} m` : distanceToRiver}
        </div>
        <div>
          <strong>Distance to closest national park:</strong> {typeof distanceToPark === 'number' ? `${distanceToPark.toFixed(2)} km` : distanceToPark}
        </div>
        {distanceToFields !== 'N/A' && ( // Conditionally render distance to fields
          <div>
            <strong>Distance to closest field:</strong> {typeof distanceToFields === 'number' ? `${(distanceToFields * 1000).toFixed(0)} m` : distanceToFields}
          </div>
        )}
        <div className="pt-2">
          <label htmlFor="riversStrength" className="block mb-1">Rivers Influence: {riversStrength}</label>
          <input
            type="range"
            id="riversStrength"
            min="0"
            max="100"
            value={riversStrength}
            onChange={(e) => setRiversStrength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor="parksStrength" className="block mb-1">Parks Influence: {parksStrength}</label>
          <input
            type="range"
            id="parksStrength"
            min="0"
            max="100"
            value={parksStrength}
            onChange={(e) => setParksStrength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="pt-2 font-semibold">
          <strong>Environment Index:</strong> {environmentIndex.toFixed(2)} / 100
        </div>
      </div>
    </div>
  );
};