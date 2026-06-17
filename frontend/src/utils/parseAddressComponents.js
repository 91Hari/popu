/**
 * Parse Google Maps address_components array into flat { address, city, state, pincode }.
 * Works for both Geocoder and PlacesService results.
 */
export function parseAddressComponents(components = []) {
  const get = (type) => components.find((c) => c.types.includes(type));

  const streetNo  = get("street_number")?.long_name || "";
  const route     = get("route")?.long_name || "";
  const sub1      = get("sublocality_level_1")?.long_name || get("sublocality")?.long_name || "";
  const neighbor  = get("neighborhood")?.long_name || "";
  const city      = get("locality")?.long_name || get("administrative_area_level_2")?.long_name || "";
  const state     = get("administrative_area_level_1")?.long_name || "";
  const pincode   = get("postal_code")?.long_name || "";

  const streetLine = [streetNo, route].filter(Boolean).join(" ");
  const areaLine   = sub1 || neighbor;
  const address    = [streetLine, areaLine].filter(Boolean).join(", ") || sub1 || route;

  return { address, city, state, pincode };
}
