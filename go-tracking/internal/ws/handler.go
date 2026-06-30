package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/auth"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/db"
	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/models"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins during development; restrict in production via env var if needed.
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Handler wires together the hub, database, and JWT secret for WebSocket endpoints.
type Handler struct {
	hub       *Hub
	db        *db.DB
	jwtSecret string
}

func NewHandler(hub *Hub, database *db.DB, jwtSecret string) *Handler {
	return &Handler{hub: hub, db: database, jwtSecret: jwtSecret}
}

// ServePassenger upgrades the connection and streams the live bus list to the passenger.
func (h *Handler) ServePassenger(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("passenger upgrade: %v", err)
		return
	}

	client := NewPassengerClient(h.hub, conn)
	h.hub.RegisterPassenger(client)

	go client.WritePump()
	go client.ReadPump()
}

// ServeDriver validates the driver's JWT, looks up their transport, then reads GPS updates.
// The access token must be supplied as the `token` query parameter.
func (h *Handler) ServeDriver(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	claims, err := auth.ValidateAccessToken(token, h.jwtSecret)
	if err != nil {
		http.Error(w, fmt.Sprintf("unauthorized: %v", err), http.StatusUnauthorized)
		return
	}
	if err := auth.RequireDriverRole(claims); err != nil {
		http.Error(w, "forbidden: driver role required", http.StatusForbidden)
		return
	}

	driver, transport, err := h.db.GetDriverWithTransport(claims.ID)
	if err != nil {
		log.Printf("driver lookup (user_id=%d): %v", claims.ID, err)
		http.Error(w, "no active transport assigned", http.StatusForbidden)
		return
	}

	var routeID *int
	routeName := ""
	if route, err := h.db.GetRouteByTransportID(*driver.TransportID); err != nil {
		log.Printf("route lookup (transport_id=%d): %v", *driver.TransportID, err)
	} else if route != nil {
		routeID = &route.ID
		routeName = fmt.Sprintf("%s -> %s", route.Origin, route.Destination)
	}

	bus := &models.Bus{
		ID:        fmt.Sprintf("%d", transport.ID),
		Plate:     transport.Plate,
		Model:     transport.Model,
		Capacity:  transport.Capacity,
		RouteID:   routeID,
		RouteName: routeName,
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("driver upgrade: %v", err)
		return
	}
	defer func() {
		conn.Close()
		h.hub.RemoveBus(bus.ID)
		log.Printf("driver disconnected: %s (%s)", claims.Fullname, transport.Plate)
	}()

	log.Printf("driver connected: %s (%s)", claims.Fullname, transport.Plate)
	conn.SetReadLimit(512)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("driver read (%s): %v", transport.Plate, err)
			}
			break
		}

		var gps models.GPSUpdate
		if err := json.Unmarshal(msg, &gps); err != nil {
			log.Printf("invalid GPS from %s: %v", transport.Plate, err)
			continue
		}

		bus.Location = models.Location{Lat: gps.Lat, Lng: gps.Lng}
		h.hub.UpdateBusLocation(bus)
	}
}
