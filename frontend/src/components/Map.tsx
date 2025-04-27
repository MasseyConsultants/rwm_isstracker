import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ISSPosition } from '../types/iss.types';

interface MapProps {
    position: ISSPosition;
}

const Map: React.FC<MapProps> = ({ position }) => {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Initialize map
    const initializeMap = () => {
        if (!mapContainerRef.current || !isLeafletLoaded || isInitialized) return;

        try {
            // Create map
            const map = L.map(mapContainerRef.current, {
                center: [position.Latitude, position.Longitude],
                zoom: 5,
                zoomControl: true,
                attributionControl: true
            });
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                subdomains: 'abc',
                maxZoom: 19
            }).addTo(map);

            // Add center control button
            const centerButton = new L.Control({ position: 'topleft' });
            centerButton.onAdd = () => {
                const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                div.innerHTML = `
                    <a href="#" title="Center on ISS" style="width: 30px; height: 30px; line-height: 30px; text-align: center; display: block; background: white; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.65);">
                        <span style="font-size: 18px;">🎯</span>
                    </a>
                `;
                div.onclick = (e) => {
                    e.preventDefault();
                    if (map) {
                        map.setView([position.Latitude, position.Longitude]);
                    }
                };
                return div;
            };
            centerButton.addTo(map);

            // Create ISS marker
            const issIcon = L.icon({
                iconUrl: 'https://img.icons8.com/color/20/000000/satellite.png',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            const marker = L.marker([position.Latitude, position.Longitude], { icon: issIcon })
                .addTo(map);

            // Create footprint circle
            const circle = L.circle([position.Latitude, position.Longitude], {
                radius: position.Footprint_Radius * 1000,
                color: 'black',
                weight: 2,
                fillColor: 'green',
                fillOpacity: 0.5
            }).addTo(map);

            // Store references
            mapRef.current = map;
            markerRef.current = marker;
            circleRef.current = circle;

            // Force a resize event
            setTimeout(() => {
                map.invalidateSize();
            }, 100);

            setIsInitialized(true);
            setMapError(null);
        } catch (error) {
            console.error('Map initialization error:', error);
            setMapError('Failed to initialize map. Please refresh the page.');
        }
    };

    // Check for Leaflet
    useEffect(() => {
        if (typeof window !== 'undefined' && window.L) {
            setIsLeafletLoaded(true);
        } else {
            const checkLeaflet = setInterval(() => {
                if (typeof window !== 'undefined' && window.L) {
                    setIsLeafletLoaded(true);
                    clearInterval(checkLeaflet);
                }
            }, 100);

            return () => clearInterval(checkLeaflet);
        }
    }, []);

    // Initialize map when Leaflet is loaded
    useEffect(() => {
        if (isLeafletLoaded) {
            initializeMap();
        }
    }, [isLeafletLoaded]);

    // Update ISS position
    useEffect(() => {
        if (!isLeafletLoaded || !isInitialized || !mapRef.current) return;

        try {
            // Update marker position
            if (markerRef.current) {
                markerRef.current.setLatLng([position.Latitude, position.Longitude]);
            }

            // Update footprint circle
            if (circleRef.current) {
                circleRef.current.setLatLng([position.Latitude, position.Longitude]);
                circleRef.current.setRadius(position.Footprint_Radius * 1000);
            }
        } catch (error) {
            console.error('Position update error:', error);
        }
    }, [position, isLeafletLoaded, isInitialized]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative h-[600px] w-full">
            <div ref={mapContainerRef} className="h-full w-full" />
            {mapError && (
                <div className="absolute top-0 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {mapError}
                </div>
            )}
        </div>
    );
};

export default Map; 