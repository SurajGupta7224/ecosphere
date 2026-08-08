import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { Plus, Minus, Crosshair, AlertTriangle, Maximize2, Minimize2, Navigation } from 'lucide-react';

const LiveMap = ({
  vehicle,
  points,
  currentLocation,
  startPoint,
  destinationPoint,
  allVehicles,
  selectedVehicleId,
  onSelectVehicle,
  isDeviation,
  isFleetOverview,
  loading,
  containerClassName
}) => {
  const containerWrapperRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({}); // vehicleId -> Marker
  const startMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const remainingPolylineRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const aptMarkersRef = useRef([]);
  const activeMarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const prevPosRef = useRef(null);

  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load Google Maps API Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script-tracking';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&libraries=places`;
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      document.head.appendChild(script);
    } else {
      const checkTimer = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleLoaded(true);
          clearInterval(checkTimer);
        }
      }, 100);
      return () => clearInterval(checkTimer);
    }
  }, []);

  // Initialize Map Instance
  useEffect(() => {
    if (!googleLoaded || !mapRef.current) return;

    if (!mapInstance.current) {
      const defaultCenter = currentLocation || { lat: 12.9103, lng: 77.6384 };
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      });
    }
  }, [googleLoaded]);

  // Create Custom Svg Icon for Truck Marker
  const createTruckSvgIcon = useCallback((colorHex, darkHex, beaconHex, isSelected) => {
    const size = isSelected ? 62 : 48;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 0.65)}" viewBox="0 0 58 38">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.45"/>
        </filter>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorHex}" />
          <stop offset="100%" stop-color="${darkHex}" />
        </linearGradient>
      </defs>
      <g filter="url(#shadow)">
        <rect x="5" y="7" width="28" height="18" rx="3" fill="url(#grad)" stroke="#ffffff" stroke-width="1.4" />
        <line x1="12" y1="9" x2="12" y2="23" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
        <line x1="19" y1="9" x2="19" y2="23" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
        <line x1="26" y1="9" x2="26" y2="23" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.2" stroke-linecap="round" />
        <path d="M 5 7 L 5 25 L 1 23 L 1 9 Z" fill="${darkHex}" stroke="#ffffff" stroke-width="0.9" />
        <path d="M 33 10 L 44 10 L 51 16 L 51 25 L 33 25 Z" fill="#0f172a" stroke="#ffffff" stroke-width="1.4" />
        <path d="M 37 11.5 L 43 11.5 L 48.5 16 L 37 16 Z" fill="#38bdf8" fill-opacity="0.9" stroke="#ffffff" stroke-width="0.8" />
        <circle cx="11" cy="26" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.3" />
        <circle cx="11" cy="26" r="1.6" fill="#cbd5e1" />
        <circle cx="23" cy="26" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.3" />
        <circle cx="23" cy="26" r="1.6" fill="#cbd5e1" />
        <circle cx="44" cy="26" r="4" fill="#0f172a" stroke="#ffffff" stroke-width="1.3" />
        <circle cx="44" cy="26" r="1.6" fill="#cbd5e1" />
        <circle cx="40" cy="7.5" r="2" fill="${beaconHex}" stroke="#ffffff" stroke-width="0.8" />
      </g>
    </svg>`;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString),
      size: new window.google.maps.Size(size, Math.round(size * 0.65)),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(Math.round(size / 2), Math.round((size * 0.65) / 2)),
      scaledSize: new window.google.maps.Size(size, Math.round(size * 0.65))
    };
  }, []);

  // Update All Vehicle Markers (Ensure valid fallback coordinates so ALL trucks are visible)
  useEffect(() => {
    if (!googleLoaded || !mapInstance.current || !allVehicles) return;

    allVehicles.forEach((v) => {
      const isSelected = v.id === selectedVehicleId;
      const statusUpper = (v.status || '').toUpperCase();
      const mainColor = v.isDeviation ? '#ef4444' : statusUpper === 'IDLE' ? '#f59e0b' : statusUpper === 'STOPPED' ? '#64748b' : '#3b82f6';
      const darkColor = v.isDeviation ? '#991b1b' : statusUpper === 'IDLE' ? '#b45309' : statusUpper === 'STOPPED' ? '#334155' : '#1d4ed8';
      const beaconColor = v.isDeviation ? '#f87171' : statusUpper === 'IDLE' ? '#fbbf24' : statusUpper === 'STOPPED' ? '#94a3b8' : '#60a5fa';

      const icon = createTruckSvgIcon(mainColor, darkColor, beaconColor, isSelected);

      // Robust coordinate fallbacks for STOPPED or 0-point vehicles
      const validLat = Number(v.latitude || (v.pointsArray && v.pointsArray.length > 0 ? v.pointsArray[v.pointsArray.length - 1].lat : 0) || v.startPoint?.lat || 12.883705);
      const validLng = Number(v.longitude || (v.pointsArray && v.pointsArray.length > 0 ? v.pointsArray[v.pointsArray.length - 1].lng : 0) || v.startPoint?.lng || 77.47355);
      const position = { lat: validLat, lng: validLng };

      if (markersRef.current[v.id]) {
        const marker = markersRef.current[v.id];
        marker.setIcon(icon);
        if (!isSelected) {
          marker.setPosition(position);
        }
      } else {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          icon,
          title: `${v.vehicleNumber} (${v.driverName || 'Driver'})`,
          zIndex: isSelected ? 99999 : 100,
          clickable: true
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family: sans-serif; padding: 6px; min-width: 150px;">
            <b style="font-size: 13px; color: #0f172a;">${v.vehicleNumber}</b><br/>
            <span style="font-size: 11px; color: #475569;">Driver: ${v.driverName || 'Driver'}</span><br/>
            <span style="font-size: 11px; font-weight: bold; color: ${v.isDeviation ? '#ef4444' : '#0284c7'};">Status: ${v.status} (${v.speed} km/h)</span>
          </div>`
        });

        marker.addListener('click', () => {
          onSelectVehicle(v.id);
          infoWindow.open(mapInstance.current, marker);
        });

        markersRef.current[v.id] = marker;
      }
    });
  }, [googleLoaded, allVehicles, selectedVehicleId, createTruckSvgIcon, onSelectVehicle]);

  // Fit bounds: In Fleet Overview Mode show ALL vehicles, in Single Vehicle Mode zoom to route
  useEffect(() => {
    if (!googleLoaded || !mapInstance.current) return;

    if (isFleetOverview && allVehicles && allVehicles.length > 0) {
      const activeVeh = allVehicles.find((v) => v.id === selectedVehicleId) || allVehicles[0];
      const rawLat = Number(activeVeh?.latitude || currentLocation?.lat);
      const rawLng = Number(activeVeh?.longitude || currentLocation?.lng);
      const lat = (!isNaN(rawLat) && rawLat !== 0) ? rawLat : 12.9419702;
      const lng = (!isNaN(rawLng) && rawLng !== 0) ? rawLng : 77.5517499;

      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(16);
    } else if (currentLocation && currentLocation.lat && currentLocation.lng) {
      const targetPos = { lat: Number(currentLocation.lat), lng: Number(currentLocation.lng) };
      mapInstance.current.setCenter(targetPos);
      mapInstance.current.setZoom(16);
    }
  }, [googleLoaded, selectedVehicleId, isFleetOverview, currentLocation, allVehicles]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [smoothFollow, setSmoothFollow] = useState(true); // Auto-pan to vehicle on live update
  const prevVehicleIdRef = useRef(null);
  const lastTrackedLocationRef = useRef(null);

  // 2. Fast & Accurate Marker Positioning + Live Auto-Pan when GPS updates from Firebase
  useEffect(() => {
    if (!googleLoaded || !mapInstance.current || !selectedVehicleId || !currentLocation) return;
    const marker = markersRef.current[selectedVehicleId];
    if (!marker) return;

    const targetPos = { lat: Number(currentLocation.lat), lng: Number(currentLocation.lng) };

    // If vehicle changed or first load, instantly snap position & camera with zero delay
    if (prevVehicleIdRef.current !== selectedVehicleId) {
      prevVehicleIdRef.current = selectedVehicleId;
      lastTrackedLocationRef.current = targetPos;
      marker.setPosition(targetPos);
      marker.setZIndex(99999);
      mapInstance.current.setCenter(targetPos);
      mapInstance.current.setZoom(16);
      return;
    }

    const startPos = marker.getPosition()
      ? { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() }
      : targetPos;

    const deltaLat = targetPos.lat - startPos.lat;
    const deltaLng = targetPos.lng - startPos.lng;

    if (Math.abs(deltaLat) > 0.000001 || Math.abs(deltaLng) > 0.000001) {
      let startTime = null;
      const duration = 600; // Smooth transition for live GPS updates

      const animateMarker = (time) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * (2 - progress);

        const curLat = startPos.lat + deltaLat * easeProgress;
        const curLng = startPos.lng + deltaLng * easeProgress;

        marker.setPosition({ lat: curLat, lng: curLng });
        marker.setZIndex(99999);

        // Live auto-pan: smoothly pan map to follow vehicle while animating
        if (smoothFollow && mapInstance.current) {
          mapInstance.current.panTo({ lat: curLat, lng: curLng });
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateMarker);
        }
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animateMarker);
      lastTrackedLocationRef.current = targetPos;
    } else {
      marker.setPosition(targetPos);
      marker.setZIndex(99999);
    }
  }, [googleLoaded, selectedVehicleId, currentLocation, smoothFollow]);


  // 3. Render Route (Directions API or Fallback Polylines) & Pickup Pins (P1, P2, P3)
  useEffect(() => {
    if (!googleLoaded || !mapInstance.current || !vehicle) return;

    // In Fleet Overview mode, hide polyline route so all fleet trucks are visible cleanly
    if (isFleetOverview) {
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (remainingPolylineRef.current) remainingPolylineRef.current.setMap(null);
      aptMarkersRef.current.forEach((m) => m.setMap(null));
      aptMarkersRef.current = [];
      return;
    }

    const sPoint = startPoint || (points && points.length > 0 ? points[0] : currentLocation);
    const dPoint = destinationPoint || (points && points.length > 0 ? points[points.length - 1] : currentLocation);

    const pathCoords = points && points.length > 0
      ? points.map((p) => ({ lat: p.lat, lng: p.lng }))
      : currentLocation
        ? [{ lat: currentLocation.lat, lng: currentLocation.lng }]
        : [];

    const drawFallbackPolyline = () => {
      let curIdx = 0;
      if (currentLocation && pathCoords.length > 0) {
        let minDist = Infinity;
        pathCoords.forEach((pt, i) => {
          const d = Math.hypot(pt.lat - currentLocation.lat, pt.lng - currentLocation.lng);
          if (d < minDist) {
            minDist = d;
            curIdx = i;
          }
        });
      }

      const traveledCoords = pathCoords.slice(0, curIdx + 1);
      const remainingCoords = pathCoords.slice(curIdx);

      // Traveled Polyline (Bold Sky Blue Progress Line)
      if (polylineRef.current) {
        polylineRef.current.setPath(traveledCoords);
        polylineRef.current.setMap(mapInstance.current);
      } else if (traveledCoords.length > 0) {
        polylineRef.current = new window.google.maps.Polyline({
          path: traveledCoords,
          geodesic: true,
          strokeColor: isDeviation ? '#ef4444' : '#0284c7',
          strokeOpacity: 0.95,
          strokeWeight: 6,
          map: mapInstance.current
        });
      }

      // Remaining Polyline (Light Translucent Slate Line)
      if (remainingPolylineRef.current) {
        remainingPolylineRef.current.setPath(remainingCoords);
        remainingPolylineRef.current.setMap(mapInstance.current);
      } else if (remainingCoords.length > 0) {
        remainingPolylineRef.current = new window.google.maps.Polyline({
          path: remainingCoords,
          geodesic: true,
          strokeColor: '#94a3b8',
          strokeOpacity: 0.45,
          strokeWeight: 4,
          map: mapInstance.current
        });
      }
    };

    // Google Maps Directions API for road-way routing
    if (sPoint && dPoint && sPoint.lat && dPoint.lat && (Math.abs(sPoint.lat - dPoint.lat) > 0.0001 || Math.abs(sPoint.lng - dPoint.lng) > 0.0001)) {
      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService();
      }
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapInstance.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: isDeviation ? '#ef4444' : '#0284c7',
            strokeOpacity: 0.9,
            strokeWeight: 5
          }
        });
      } else {
        directionsRendererRef.current.setMap(mapInstance.current);
      }

      const waypoints = [];
      if (points && points.length > 2) {
        const step = Math.max(1, Math.floor(points.length / 5));
        for (let i = step; i < points.length - 1; i += step) {
          if (waypoints.length < 6) {
            waypoints.push({
              location: new window.google.maps.LatLng(points[i].lat, points[i].lng),
              stopover: false
            });
          }
        }
      }

      directionsServiceRef.current.route(
        {
          origin: new window.google.maps.LatLng(sPoint.lat, sPoint.lng),
          destination: new window.google.maps.LatLng(dPoint.lat, dPoint.lng),
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result && result.routes && result.routes[0]) {
            directionsRendererRef.current.setDirections(result);
            roadPathRef.current = result.routes[0].overview_path.map((pt) => ({ lat: pt.lat(), lng: pt.lng() }));
            if (polylineRef.current) polylineRef.current.setMap(null);
            if (remainingPolylineRef.current) remainingPolylineRef.current.setMap(null);
          } else {
            drawFallbackPolyline();
          }
        }
      );
    } else {
      drawFallbackPolyline();
    }

    // Pickup markers (P1, P2, P3) rendered exclusively in right-side GIS Panel per user preference
    aptMarkersRef.current.forEach((m) => m.setMap(null));
    aptMarkersRef.current = [];
  }, [googleLoaded, vehicle, points, currentLocation, startPoint, destinationPoint, isDeviation, isFleetOverview]);



  // Controls Handlers
  const zoomIn = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
  };

  const zoomOut = () => {
    if (mapInstance.current) mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
  };

  const recenterOnVehicle = () => {
    if (mapInstance.current && currentLocation) {
      mapInstance.current.setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
      mapInstance.current.setZoom(16);
    }
  };

  const toggleFullscreen = () => {
    const elem = containerWrapperRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // HTML5 Fullscreen change listener & map resize trigger
  useEffect(() => {
    const handleFsChange = () => {
      const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);

      if (mapInstance.current && window.google && window.google.maps) {
        setTimeout(() => {
          window.google.maps.event.trigger(mapInstance.current, 'resize');
          if (currentLocation && currentLocation.lat && currentLocation.lng) {
            mapInstance.current.setCenter({ lat: Number(currentLocation.lat), lng: Number(currentLocation.lng) });
            mapInstance.current.setZoom(16);
          }
        }, 150);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [currentLocation]);

  // Trigger Google Maps resize event whenever layout or loading changes
  useEffect(() => {
    if (mapInstance.current && window.google && window.google.maps) {
      const timer = setTimeout(() => {
        window.google.maps.event.trigger(mapInstance.current, 'resize');
        if (currentLocation && currentLocation.lat && currentLocation.lng) {
          mapInstance.current.setCenter({ lat: Number(currentLocation.lat), lng: Number(currentLocation.lng) });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [googleLoaded, currentLocation, isFullscreen]);

  return (
    <div
      ref={containerWrapperRef}
      className={`bg-white border border-slate-200 shadow-sm flex flex-col gap-3 relative overflow-hidden transition-all ${
        isFullscreen
          ? 'w-full h-full p-4 bg-white'
          : containerClassName || 'lg:col-span-5 rounded-2xl p-4'
      }`}
    >
      {/* Top Floating Fleet Summary Badge */}
      <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200 z-30 flex items-center gap-3 sm:gap-4 text-xs font-extrabold pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse" />
          <span className="text-slate-800 font-extrabold">{vehicle ? vehicle.vehicleNumber : 'Live Fleet Tracking'}</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-[10px] text-slate-500 font-bold">
          {points ? `${points.length} GPS Points` : 'Live Stream'}
        </span>
      </div>

      {/* Map Container */}
      <div className={`rounded-xl overflow-hidden relative border border-slate-200 bg-slate-100 flex-1 ${isFullscreen ? 'min-h-[90vh]' : 'min-h-[490px]'}`}>
        <div ref={mapRef} className={`w-full z-10 ${isFullscreen ? 'h-full min-h-[90vh]' : 'h-full min-h-[490px]'}`} />

        {(!googleLoaded || loading) && (
          <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="w-9 h-9 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-slate-600 text-xs font-bold">Loading Live Google Map...</p>
          </div>
        )}

        {/* Action Controls Overlay */}
        <div className="absolute top-16 right-3 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-800 font-black transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-rose-600" /> : <Maximize2 className="w-4 h-4 text-sky-600" />}
          </button>
          <button
            onClick={zoomIn}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer border-t border-slate-100 pt-1"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={recenterOnVehicle}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-sky-600 font-bold transition-colors cursor-pointer border-t border-slate-100 pt-1"
            title="Recenter Map on Active Vehicle"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          {/* Live Follow Toggle Button */}
          <button
            onClick={() => setSmoothFollow(f => !f)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer border-t border-slate-100 pt-1 ${
              smoothFollow
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'hover:bg-slate-100 text-slate-400'
            }`}
            title={smoothFollow ? 'Live Follow ON — click to disable auto-pan' : 'Live Follow OFF — click to enable auto-pan'}
          >
            <Navigation className={`w-4 h-4 ${smoothFollow ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md z-30 flex items-center gap-3 text-[11px] font-bold text-slate-700">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Destination</span>
          </div>
          {isDeviation && (
            <div className="flex items-center gap-1 text-rose-700 font-extrabold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>Deviation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(LiveMap);
