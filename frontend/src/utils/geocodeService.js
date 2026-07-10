import { ensureMapsInit } from './mapsLoader';
import { parseAddressComponents } from './parseAddressComponents';

export async function reverseGeocode(lat, lng) {
  const ok = await ensureMapsInit('geocoding');
  if (!ok) return null;
  return new Promise((resolve) => {
    new window.google.maps.Geocoder().geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status !== 'OK' || !results?.[0]) { resolve(null); return; }
        resolve(parseAddressComponents(results[0].address_components));
      }
    );
  });
}
