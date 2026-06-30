package navigation

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Handler struct {
	osrmBaseURL      string
	nominatimBaseURL string
	client           *http.Client
}

type routeResponse struct {
	Coordinates [][]float64 `json:"coordinates"`
	DistanceKm  float64     `json:"distanceKm"`
	DurationMin float64     `json:"durationMin"`
	Provider    string      `json:"provider"`
}

type osrmResponse struct {
	Code   string `json:"code"`
	Routes []struct {
		Distance float64 `json:"distance"`
		Duration float64 `json:"duration"`
		Geometry struct {
			Coordinates [][]float64 `json:"coordinates"`
		} `json:"geometry"`
	} `json:"routes"`
	Message string `json:"message"`
}

type nominatimPlace struct {
	DisplayName string `json:"display_name"`
	Lat         string `json:"lat"`
	Lon         string `json:"lon"`
}

func NewHandler(osrmBaseURL string, nominatimBaseURL string) *Handler {
	return &Handler{
		osrmBaseURL:      strings.TrimRight(osrmBaseURL, "/"),
		nominatimBaseURL: strings.TrimRight(nominatimBaseURL, "/"),
		client:           &http.Client{Timeout: 8 * time.Second},
	}
}

func (h *Handler) ServeRoute(w http.ResponseWriter, r *http.Request) {
	setJSONHeaders(w)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	originLat, originLng, destinationLat, destinationLng, err := h.resolveRoutePoints(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	osrmURL := fmt.Sprintf(
		"%s/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson&steps=false",
		h.osrmBaseURL,
		originLng,
		originLat,
		destinationLng,
		destinationLat,
	)

	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, osrmURL, nil)
	if err != nil {
		http.Error(w, "could not create routing request", http.StatusInternalServerError)
		return
	}

	resp, err := h.client.Do(req)
	if err != nil {
		log.Printf("navigation route request failed: %v", err)
		http.Error(w, "routing provider unavailable", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		log.Printf("navigation route provider status: %d", resp.StatusCode)
		http.Error(w, "routing provider returned an error", http.StatusBadGateway)
		return
	}

	var payload osrmResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid routing provider response", http.StatusBadGateway)
		return
	}

	if payload.Code != "Ok" || len(payload.Routes) == 0 {
		if payload.Message != "" {
			http.Error(w, payload.Message, http.StatusBadGateway)
			return
		}
		http.Error(w, "route not found", http.StatusNotFound)
		return
	}

	route := payload.Routes[0]
	coordinates := lngLatToLatLng(route.Geometry.Coordinates)
	if len(coordinates) < 2 {
		http.Error(w, "route geometry is empty", http.StatusBadGateway)
		return
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(routeResponse{
		Coordinates: coordinates,
		DistanceKm:  route.Distance / 1000,
		DurationMin: route.Duration / 60,
		Provider:    "osrm",
	}); err != nil {
		log.Printf("navigation route response encode failed: %v", err)
	}
}

func (h *Handler) resolveRoutePoints(r *http.Request) (float64, float64, float64, float64, error) {
	values := r.URL.Query()
	originName := strings.TrimSpace(values.Get("origin"))
	destinationName := strings.TrimSpace(values.Get("destination"))

	if originName != "" && destinationName != "" {
		originLat, originLng, err := h.geocodePlace(r, originName)
		if err != nil {
			if hasCoordinateFallback(values) {
				return parseRouteCoordinates(values)
			}
			return 0, 0, 0, 0, fmt.Errorf("origin: %w", err)
		}
		destinationLat, destinationLng, err := h.geocodePlace(r, destinationName)
		if err != nil {
			if hasCoordinateFallback(values) {
				return parseRouteCoordinates(values)
			}
			return 0, 0, 0, 0, fmt.Errorf("destination: %w", err)
		}
		if samePoint(originLat, originLng, destinationLat, destinationLng) {
			return 0, 0, 0, 0, fmt.Errorf("origin and destination must be different")
		}
		return originLat, originLng, destinationLat, destinationLng, nil
	}

	return parseRouteCoordinates(values)
}

func hasCoordinateFallback(values url.Values) bool {
	return values.Get("originLat") != "" &&
		values.Get("originLng") != "" &&
		values.Get("destinationLat") != "" &&
		values.Get("destinationLng") != ""
}

func parseRouteCoordinates(values url.Values) (float64, float64, float64, float64, error) {
	originLat, err := parseCoordinate(values.Get("originLat"), "originLat", -90, 90)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	originLng, err := parseCoordinate(values.Get("originLng"), "originLng", -180, 180)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	destinationLat, err := parseCoordinate(values.Get("destinationLat"), "destinationLat", -90, 90)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	destinationLng, err := parseCoordinate(values.Get("destinationLng"), "destinationLng", -180, 180)
	if err != nil {
		return 0, 0, 0, 0, err
	}

	if samePoint(originLat, originLng, destinationLat, destinationLng) {
		return 0, 0, 0, 0, fmt.Errorf("origin and destination must be different")
	}

	return originLat, originLng, destinationLat, destinationLng, nil
}

func (h *Handler) geocodePlace(r *http.Request, value string) (float64, float64, error) {
	for _, query := range buildPlaceQueries(value) {
		params := url.Values{}
		params.Set("format", "jsonv2")
		params.Set("q", query)
		params.Set("limit", "1")
		params.Set("countrycodes", "co")
		params.Set("viewbox", "-75.689,6.346,-75.461,6.146")
		params.Set("bounded", "1")
		params.Set("addressdetails", "1")

		geocodeURL := fmt.Sprintf("%s/search?%s", h.nominatimBaseURL, params.Encode())
		req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, geocodeURL, nil)
		if err != nil {
			return 0, 0, fmt.Errorf("could not create geocoding request")
		}
		req.Header.Set("Accept-Language", "es")
		req.Header.Set("User-Agent", "YaLlego/1.0")

		resp, err := h.client.Do(req)
		if err != nil {
			return 0, 0, fmt.Errorf("geocoding provider unavailable")
		}

		var places []nominatimPlace
		decodeErr := json.NewDecoder(resp.Body).Decode(&places)
		closeErr := resp.Body.Close()
		if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
			return 0, 0, fmt.Errorf("geocoding provider returned an error")
		}
		if decodeErr != nil {
			return 0, 0, fmt.Errorf("invalid geocoding provider response")
		}
		if closeErr != nil {
			return 0, 0, fmt.Errorf("could not close geocoding response")
		}
		if len(places) == 0 {
			continue
		}

		lat, latErr := strconv.ParseFloat(places[0].Lat, 64)
		lng, lngErr := strconv.ParseFloat(places[0].Lon, 64)
		if latErr != nil || lngErr != nil {
			return 0, 0, fmt.Errorf("geocoding provider returned invalid coordinates")
		}

		return lat, lng, nil
	}

	return 0, 0, fmt.Errorf("place not found in Medellin")
}

func buildPlaceQueries(value string) []string {
	normalized := strings.TrimSpace(value)
	lower := strings.ToLower(normalized)
	if strings.Contains(lower, "medellin") || strings.Contains(lower, "medellín") {
		return []string{normalized}
	}
	return []string{
		fmt.Sprintf("%s, Medellín, Antioquia, Colombia", normalized),
		normalized,
	}
}

func parseCoordinate(raw string, name string, min float64, max float64) (float64, error) {
	if raw == "" {
		return 0, fmt.Errorf("%s is required", name)
	}

	value, err := strconv.ParseFloat(raw, 64)
	if err != nil || math.IsNaN(value) || math.IsInf(value, 0) {
		return 0, fmt.Errorf("%s must be a valid number", name)
	}

	if value < min || value > max {
		return 0, fmt.Errorf("%s is outside the allowed range", name)
	}

	return value, nil
}

func samePoint(originLat float64, originLng float64, destinationLat float64, destinationLng float64) bool {
	const epsilon = 0.000001
	return math.Abs(originLat-destinationLat) < epsilon && math.Abs(originLng-destinationLng) < epsilon
}

func lngLatToLatLng(coordinates [][]float64) [][]float64 {
	points := make([][]float64, 0, len(coordinates))
	for _, coordinate := range coordinates {
		if len(coordinate) < 2 {
			continue
		}
		points = append(points, []float64{coordinate[1], coordinate[0]})
	}
	return points
}

func setJSONHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
}
