import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-71.06776, 42.35816],
      zoom: 9,
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100vh' }}
    />
  );
}

export default Map;