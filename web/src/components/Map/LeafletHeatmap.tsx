"use client";

import { useEffect, useRef, useState } from 'react';
import { FeatureCollection } from '../../hooks/useGeoJSON';
import { calculateEnvironmentIndex } from './EnvironmentInfo';
import useMapContext from './useMapContext';

interface LeafletHeatmapProps {
  riversData: FeatureCollection | null;
  parksData: FeatureCollection | null;
  forestsData: FeatureCollection | null; // Added
  q100Data: FeatureCollection | null;    // Added
  riversStrength: number;
  parksStrength: number;
  forestsStrength: number; // Added
  visible: boolean;
  animationSpeed?: number; // milliseconds between adding points
}

export const LeafletHeatmap: React.FC<LeafletHeatmapProps> = ({
  riversData,
  parksData,
  forestsData,  // Added
  q100Data,     // Added
  riversStrength,
  parksStrength,
  forestsStrength, // Added
  visible,
  animationSpeed = 50, // default 50ms between points
}) => {
  const heatLayerRef = useRef<any>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const pointsQueueRef = useRef<[number, number, number][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { map } = useMapContext();

  useEffect(() => {
    const createHeatmap = async () => {
      if (typeof window === 'undefined' || !visible || !map) {
        return;
      }

      try {
        // Load leaflet and leaflet.heat in a way that works with Next.js
        const L = (await import('leaflet')).default;
        
        // Load leaflet.heat plugin
        await import('leaflet.heat');
        
        // Check if heatLayer is available on the global L object
        const globalL = (window as any).L || L;
        if (typeof globalL.heatLayer === 'undefined') {
          console.error('leaflet.heat plugin not properly loaded');
          return;
        }

        // Remove existing heatmap
        if (heatLayerRef.current) {
          map.removeLayer(heatLayerRef.current);
          heatLayerRef.current = null;
        }

        const bounds = map.getBounds();
        const zoom = map.getZoom();
        
        // Adjust grid density based on zoom level
        const gridSize = Math.max(20, 100 - zoom * 10);
        const heatmapData: [number, number, number][] = [];

        // Generate grid points within visible bounds
        const latStep = (bounds.getNorth() - bounds.getSouth()) / gridSize;
        const lngStep = (bounds.getEast() - bounds.getWest()) / gridSize;

        for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += latStep) {
          for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += lngStep) {
            const position = new L.LatLng(lat, lng);
            // TODO: Implement actual distance calculations for heatmap accuracy
            const placeholderDistanceToRiver = 0; // Placeholder
            const placeholderDistanceToPark = 0;   // Placeholder
            const placeholderDistanceToForests = 0; // Placeholder

            const environmentIndex = calculateEnvironmentIndex(
              position,
              riversStrength,
              parksStrength,
              placeholderDistanceToRiver,    // Was riversData
              placeholderDistanceToPark,     // Was parksData
              placeholderDistanceToForests,  // Added
              q100Data,                    // Added
              forestsStrength              // Added
            );
            
            // Normalize the environment index to a value between 0 and 1 for heatmap intensity
            const intensity = environmentIndex / 100;
            
            heatmapData.push([lat, lng, intensity]);
          }
        }
        
        // Create empty heatmap layer initially
        heatLayerRef.current = globalL.heatLayer([], {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.0: 'red',
            0.2: 'orange',
            0.4: 'yellow',
            0.6: 'lime',
            0.8: 'green',
            1.0: 'darkgreen'
          }
        });

        map.addLayer(heatLayerRef.current);
        
        // Store points for animation and start adding them dynamically
        pointsQueueRef.current = heatmapData;
        startPointAnimation();
      } catch (error) {
        console.error('Error creating heatmap:', error);
      }
    };

    if (visible) {
      createHeatmap();
    } else {
      // Remove heatmap if not visible
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      setIsAnimating(false);
    };
  }, [map, riversData, parksData, forestsData, q100Data, riversStrength, parksStrength, forestsStrength, visible]); // Added new props to dependency array

  const startPointAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    setIsAnimating(true);
    let currentIndex = 0;
    
    animationRef.current = setInterval(() => {
      if (currentIndex >= pointsQueueRef.current.length || !heatLayerRef.current) {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
        setIsAnimating(false);
        return;
      }
      
      const point = pointsQueueRef.current[currentIndex];
      heatLayerRef.current.addLatLng([point[0], point[1], point[2]]);
      currentIndex++;
    }, animationSpeed);
  };

  // Stop animation when component unmounts or visibility changes
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  return null; // This component doesn't render anything directly
};
