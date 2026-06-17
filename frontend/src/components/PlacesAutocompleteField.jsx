import { useState, useRef, useCallback, useEffect } from "react";
import {
  Autocomplete as MuiAutocomplete, TextField, CircularProgress,
  Box, Typography,
} from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { ensureMapsInit } from "../utils/mapsLoader";
import { parseAddressComponents } from "../utils/parseAddressComponents";

/**
 * MUI TextField with live Google Places suggestions.
 *
 * Props:
 *   value          — controlled text string
 *   onChange       — (text: string) => void   (every keystroke)
 *   onPlaceSelect  — ({ address, city, state, pincode, lat, lng }) => void
 *   label, error, helperText, disabled, size
 */
export default function PlacesAutocompleteField({
  value = "",
  onChange,
  onPlaceSelect,
  label = "Address",
  error,
  helperText,
  disabled,
  size = "small",
}) {
  const [inputValue, setInputValue]   = useState(value);
  const [predictions, setPredictions] = useState([]);
  const [fetching, setFetching]       = useState(false);

  const svcRef   = useRef(null); // AutocompleteService
  const plcRef   = useRef(null); // PlacesService
  const attrDiv  = useRef(null); // hidden attribution div required by PlacesService
  const timerRef = useRef(null);

  // Sync controlled value from parent (e.g. when auto-detected address is set)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Load Places library and create service instances once
  useEffect(() => {
    (async () => {
      const ok = await ensureMapsInit("places");
      if (!ok) return;
      const { AutocompleteService, PlacesService } = window.google.maps.places;
      svcRef.current  = new AutocompleteService();
      attrDiv.current = attrDiv.current || document.createElement("div");
      plcRef.current  = new PlacesService(attrDiv.current);
    })();
  }, []);

  const fetchPredictions = useCallback(async (text) => {
    if (!svcRef.current || !text || text.length < 3) {
      setPredictions([]);
      return;
    }
    setFetching(true);
    try {
      const res = await svcRef.current.getPlacePredictions({
        input: text,
        componentRestrictions: { country: "in" },
      });
      setPredictions(res?.predictions || []);
    } catch {
      setPredictions([]);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleInputChange = (_, newVal, reason) => {
    setInputValue(newVal);
    if (reason === "input") {
      onChange?.(newVal);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fetchPredictions(newVal), 350);
    } else if (reason === "clear") {
      setPredictions([]);
      onChange?.("");
    }
  };

  const handleChange = (_, option) => {
    if (!option || typeof option === "string" || !plcRef.current) return;
    plcRef.current.getDetails(
      {
        placeId: option.place_id,
        fields: ["address_components", "geometry", "formatted_address"],
      },
      (place, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;
        const parsed = parseAddressComponents(place.address_components);
        const lat    = place.geometry?.location?.lat();
        const lng    = place.geometry?.location?.lng();
        const text   = parsed.address || place.formatted_address || option.description;
        setInputValue(text);
        onChange?.(text);
        onPlaceSelect?.({ ...parsed, lat, lng });
        setPredictions([]);
      }
    );
  };

  return (
    <MuiAutocomplete
      freeSolo
      disableClearable={false}
      inputValue={inputValue}
      options={predictions}
      filterOptions={(x) => x}
      getOptionLabel={(opt) => (typeof opt === "string" ? opt : (opt.description || ""))}
      getOptionKey={(opt) => (typeof opt === "string" ? opt : opt.place_id)}
      loading={fetching}
      disabled={disabled}
      onInputChange={handleInputChange}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          size={size}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {fetching && <CircularProgress color="inherit" size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, opt) => (
        <Box component="li" {...props} key={opt.place_id}>
          <LocationOnRoundedIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary", flexShrink: 0, mt: 0.3 }} />
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {opt.structured_formatting?.main_text || opt.description}
            </Typography>
            {opt.structured_formatting?.secondary_text && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {opt.structured_formatting.secondary_text}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    />
  );
}
