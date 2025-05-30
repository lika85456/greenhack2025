"use client";

import React, { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { FeatureCollection } from '../../hooks/useGeoJSON'; 
import * as turf from '@turf/turf';
// Import specific geometry types from turf.helpers if needed, or use geojson types
import { Feature, Geometry, GeometryCollection as GeoJsonGeometryCollection } from 'geojson'; 
import { LayerConfig } from '../../lib/LayerConfig';

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
  let minOverallDistance = Infinity;

  featuresCollection.features.forEach((feature: Feature<Geometry>) => {
    if (!feature || !feature.geometry) {
      return;
    }

    try {
      let currentMinDistanceForFeature = Infinity;
      const geom = feature.geometry;

      function getDistanceToGeometry(currentGeom: Geometry): number {
        let distance = Infinity;
        switch (currentGeom.type) {
          case 'Point':
            distance = turf.distance(from, currentGeom, { units: 'kilometers' });
            break;
          case 'MultiPoint':
            currentGeom.coordinates.forEach(coord => {
              const pt = turf.point(coord);
              const d = turf.distance(from, pt, { units: 'kilometers' });
              if (d < distance) distance = d;
            });
            break;
          case 'LineString':
            const nearestPointOnLine = turf.nearestPointOnLine(currentGeom, from, { units: 'kilometers' });
            distance = nearestPointOnLine.properties.dist ?? Infinity;
            break;
          case 'MultiLineString':
            currentGeom.coordinates.forEach(lineCoords => {
              const line = turf.lineString(lineCoords);
              const nearestPt = turf.nearestPointOnLine(line, from, { units: 'kilometers' });
              if (nearestPt.properties.dist !== undefined && nearestPt.properties.dist < distance) {
                distance = nearestPt.properties.dist;
              }
            });
            break;
          case 'Polygon':
            if (turf.booleanPointInPolygon(from, turf.feature(currentGeom))) {
              distance = 0;
            } else {
              const polygonBoundaries = turf.polygonToLine(currentGeom);
              if (polygonBoundaries) {
                if (polygonBoundaries.type === 'FeatureCollection') {
                  let minDistToBoundary = Infinity;
                  polygonBoundaries.features.forEach(lineFeature => {
                    const nearestPointOnLine = turf.nearestPointOnLine(lineFeature, from, { units: 'kilometers' });
                    if (nearestPointOnLine.properties.dist !== undefined && nearestPointOnLine.properties.dist < minDistToBoundary) {
                      minDistToBoundary = nearestPointOnLine.properties.dist;
                    }
                  });
                  distance = minDistToBoundary;
                } else { // It's a Feature<LineString | MultiLineString>
                  const nearestPointOnBoundary = turf.nearestPointOnLine(polygonBoundaries, from, { units: 'kilometers' });
                  distance = nearestPointOnBoundary.properties.dist ?? Infinity;
                }
              }
            }
            break;
          case 'MultiPolygon':
            currentGeom.coordinates.forEach(polyCoords => {
              const poly = turf.polygon(polyCoords);
              let distToSinglePoly = Infinity;
              if (turf.booleanPointInPolygon(from, poly)) {
                distToSinglePoly = 0;
              } else {
                const polyBoundaries = turf.polygonToLine(poly);
                if (polyBoundaries) {
                  if (polyBoundaries.type === 'FeatureCollection') {
                    let minDistToBoundary = Infinity;
                    polyBoundaries.features.forEach(lineFeature => {
                      const nearestPointOnLine = turf.nearestPointOnLine(lineFeature, from, { units: 'kilometers' });
                      if (nearestPointOnLine.properties.dist !== undefined && nearestPointOnLine.properties.dist < minDistToBoundary) {
                        minDistToBoundary = nearestPointOnLine.properties.dist;
                      }
                    });
                    distToSinglePoly = minDistToBoundary;
                  } else { // It's a Feature<LineString | MultiLineString>
                    const nearestPointOnBoundary = turf.nearestPointOnLine(polyBoundaries, from, { units: 'kilometers' });
                    distToSinglePoly = nearestPointOnBoundary.properties.dist ?? Infinity;
                  }
                }
              }
              if (distToSinglePoly < distance) distance = distToSinglePoly;
            });
            break;
          case 'GeometryCollection':
            const geomCollection = currentGeom as GeoJsonGeometryCollection;
            geomCollection.geometries.forEach(subGeom => {
              const d = getDistanceToGeometry(subGeom);
              if (d < distance) distance = d;
            });
            break;
          default:
            // console.warn(`Unsupported geometry type: ${(currentGeom as any).type}`);
            break;
        }
        return distance;
      }

      currentMinDistanceForFeature = getDistanceToGeometry(geom);

      if (typeof currentMinDistanceForFeature === 'number' && !isNaN(currentMinDistanceForFeature)) {
        if (currentMinDistanceForFeature < minOverallDistance) {
          minOverallDistance = currentMinDistanceForFeature;
        }
      }
    } catch (e: any) {
      console.error(`Error calculating distance for feature (type: ${feature.geometry.type}): ${e.message}`, e);
    }
  });

  return minOverallDistance === Infinity ? 'N/A' : minOverallDistance;
};

export const EnvironmentInfo: React.FC<EnvironmentInfoProps> = ({
  clickedPosition,
  riversData,
  parksData,
  fieldsData,
  layers,
}) => {
  const [riversStrength, setRiversStrength] = useState(50);
  const [parksStrength, setParksStrength] = useState(50);

  const [distanceToRiver, setDistanceToRiver] = useState<number | string>('N/A');
  const [distanceToPark, setDistanceToPark] = useState<number | string>('N/A');
  const [distanceToFields, setDistanceToFields] = useState<number | string>('N/A');

  useEffect(() => {
    setDistanceToRiver(calculateDistanceToNearestFeature(clickedPosition, riversData));
    setDistanceToPark(calculateDistanceToNearestFeature(clickedPosition, parksData));

    const fieldsLayer = layers.find(layer => layer.id === 'fields');
    if (fieldsLayer?.visible && fieldsData && clickedPosition) {
      setDistanceToFields(calculateDistanceToNearestFeature(clickedPosition, fieldsData));
    } else {
      setDistanceToFields('N/A');
    }
  }, [clickedPosition, riversData, parksData, fieldsData, layers]);

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