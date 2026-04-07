import { useState, useRef, useEffect, useCallback } from 'react';
import { useMapStore } from '../../store/mapStore';
import {
  suggestPlaces,
  retrievePlace,
  reverseGeocode,
  getDirections,
  resetSearchSession,
} from '../../services/mapbox';
import type { SearchSuggestion } from '../../services/mapbox';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    navigationState,
    setNavigationState,
    userLocation,
    setDestination,
    setActiveRoute,
    setAlternativeRoutes,
    map,
    destination,
    stopNavigation,
  } = useMapStore();

  const handleSuggest = useCallback(
    async (text: string) => {
      if (text.length < 2) {
        setSuggestions([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      const proximity: [number, number] | undefined = userLocation
        ? [userLocation.lng, userLocation.lat]
        : undefined;

      try {
        const results = await suggestPlaces(text, proximity);
        setSuggestions(results);
        setHasSearched(true);
      } catch {
        setSuggestions([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation],
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    setHasSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSuggest(value), 350);
  };

  const fitBoundsForRoute = (
    origin: [number, number],
    dest: [number, number],
  ) => {
    map?.fitBounds(
      [
        [Math.min(origin[0], dest[0]) - 0.01, Math.min(origin[1], dest[1]) - 0.01],
        [Math.max(origin[0], dest[0]) + 0.01, Math.max(origin[1], dest[1]) + 0.01],
      ],
      { padding: { top: 120, bottom: 200, left: 60, right: 60 }, duration: 1000 },
    );
  };

  const calculateRouteAndPreview = async (
    origin: [number, number],
    dest: [number, number],
  ) => {
    try {
      const routes = await getDirections([origin, dest]);
      if (routes.length > 0) {
        setActiveRoute(routes[0]);
        setAlternativeRoutes(routes.slice(1));
        setNavigationState('route_preview');
        fitBoundsForRoute(origin, dest);
      }
    } catch (err) {
      console.error('Lỗi tính toán tuyến đường:', err);
    }
  };

  const handleSelectSuggestion = async (suggestion: SearchSuggestion) => {
    setIsLoading(true);
    setSuggestions([]);
    setQuery(suggestion.name);

    try {
      const place = await retrievePlace(suggestion.mapboxId);
      if (!place) {
        setIsLoading(false);
        return;
      }

      setDestination({
        lng: place.center[0],
        lat: place.center[1],
        name: place.fullAddress || place.name,
      });

      setIsSearching(false);
      setHasSearched(false);
      resetSearchSession();

      if (!userLocation) {
        setIsLoading(false);
        return;
      }

      const origin: [number, number] = [userLocation.lng, userLocation.lat];
      await calculateRouteAndPreview(origin, place.center);
    } catch (err) {
      console.error('Lỗi lấy thông tin địa điểm:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSearching) inputRef.current?.focus();
  }, [isSearching]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleTapOnMapDestination = useCallback(async () => {
    if (!destination || !userLocation) return;
    const origin: [number, number] = [userLocation.lng, userLocation.lat];
    const dest: [number, number] = [destination.lng, destination.lat];

    try {
      const name = await reverseGeocode(dest);
      setDestination({ ...destination, name });
      setQuery(name);

      const routes = await getDirections([origin, dest]);
      if (routes.length > 0) {
        setActiveRoute(routes[0]);
        setAlternativeRoutes(routes.slice(1));
        setNavigationState('route_preview');
        fitBoundsForRoute(origin, dest);
      }
    } catch (err) {
      console.error('Lỗi tính toán tuyến đường:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, userLocation, map]);

  useEffect(() => {
    if (navigationState === 'route_preview' && destination && !query) {
      handleTapOnMapDestination();
    }
  }, [navigationState, destination, query, handleTapOnMapDestination]);

  if (navigationState === 'navigating') return null;

  const handleOpen = () => {
    resetSearchSession();
    setIsSearching(true);
    setNavigationState('searching');
  };

  const handleClose = () => {
    setIsSearching(false);
    setQuery('');
    setSuggestions([]);
    setHasSearched(false);
    stopNavigation();
  };

  return (
    <div className="search-bar-wrapper">
      {!isSearching && navigationState === 'idle' ? (
        <button className="search-bar-idle" onClick={handleOpen}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Bạn muốn đi đâu?</span>
        </button>
      ) : navigationState === 'route_preview' ? (
        <div className="search-bar-preview">
          <button className="search-bar-back" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="search-bar-preview__info">
            <span className="search-bar-preview__label">Đến</span>
            <span className="search-bar-preview__name">{destination?.name || query}</span>
          </div>
        </div>
      ) : (
        <div className="search-bar-active">
          <button className="search-bar-back" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <input
            ref={inputRef}
            className="search-bar-input"
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Tìm địa điểm, siêu thị, nhà hàng..."
          />
          {query && (
            <button className="search-bar-clear" onClick={() => { setQuery(''); setSuggestions([]); setHasSearched(false); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )}

      {isSearching && (
        <div className="search-dropdown">
          {isLoading && (
            <div className="search-status">Đang tìm kiếm...</div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <ul className="search-results">
              {suggestions.map((s) => (
                <li key={s.mapboxId}>
                  <button
                    className="search-result-item"
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    <svg className="search-result-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {s.featureType === 'poi' ? (
                        <>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </>
                      ) : (
                        <>
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </>
                      )}
                    </svg>
                    <div className="search-result-text">
                      <span className="search-result-name">{s.name}</span>
                      <span className="search-result-address">
                        {s.fullAddress}
                        {s.poiCategory && (
                          <span className="search-result-category"> · {s.poiCategory}</span>
                        )}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && hasSearched && suggestions.length === 0 && query.length >= 2 && (
            <div className="search-status">Không tìm thấy địa điểm nào</div>
          )}

          {!isLoading && !hasSearched && query.length < 2 && (
            <div className="search-hint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Nhập ít nhất 2 ký tự để tìm kiếm</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
