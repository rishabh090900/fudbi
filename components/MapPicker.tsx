'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
  city?: string;
}

// Component to add search control
function SearchControl() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
      searchLabel: 'Search for location...',
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}

// Component to handle map clicks and search results
function LocationMarker({ onLocationSelect, initialPosition }: { onLocationSelect: (lat: number, lng: number) => void; initialPosition?: [number, number] }) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);
  const map = useMap();

  // Handle map clicks
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Handle search results
  useEffect(() => {
    const handleSearchResult = (result: any) => {
      const { x, y } = result.location;
      setPosition([y, x]);
      onLocationSelect(y, x);
    };

    map.on('geosearch/showlocation', handleSearchResult);

    return () => {
      map.off('geosearch/showlocation', handleSearchResult);
    };
  }, [map, onLocationSelect]);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      map.setView(initialPosition, map.getZoom());
    }
  }, [initialPosition, map]);

  return position === null ? null : <Marker position={position} />;
}

// Get default center based on city
const getCityCoordinates = (city?: string): [number, number] => {
  const cityCoords: { [key: string]: [number, number] } = {
    delhi: [28.6139, 77.2090],
    mumbai: [19.0760, 72.8777],
    bangalore: [12.9716, 77.5946],
    kolkata: [22.5726, 88.3639],
    chennai: [13.0827, 80.2707],
    hyderabad: [17.3850, 78.4867],
    pune: [18.5204, 73.8567],
    ahmedabad: [23.0225, 72.5714],
  };

  if (city) {
    const normalizedCity = city.toLowerCase().trim();
    return cityCoords[normalizedCity] || [28.6139, 77.2090]; // Default to Delhi
  }

  return [28.6139, 77.2090]; // Default to Delhi
};

export default function MapPicker({ onLocationSelect, initialPosition, city }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const center = initialPosition || getCityCoordinates(city);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchControl />
        <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />
      </MapContainer>
    </div>
  );
}
