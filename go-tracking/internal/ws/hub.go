package ws

import (
	"encoding/json"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/models"
)

// locationSaver persists a GPS reading; satisfied by *db.DB.
type locationSaver interface {
	SaveBusLocation(transportID int, lat float64, lng float64) error
}

// persistInterval is the minimum time between historical writes for a single bus.
const persistInterval = 10 * time.Second

// Hub holds the in-memory bus location store and the set of connected passenger clients.
// The in-memory store (buses) is the source of truth for broadcasting; the database is
// only used for throttled historical persistence.
type Hub struct {
	mu          sync.RWMutex
	passengers  map[*PassengerClient]bool
	buses       map[string]*models.Bus // keyed by transport ID string
	db          locationSaver
	lastPersist map[string]time.Time // keyed by transport ID string
}

func NewHub(db locationSaver) *Hub {
	return &Hub{
		passengers:  make(map[*PassengerClient]bool),
		buses:       make(map[string]*models.Bus),
		db:          db,
		lastPersist: make(map[string]time.Time),
	}
}

func (h *Hub) RegisterPassenger(c *PassengerClient) {
	h.mu.Lock()
	h.passengers[c] = true
	snapshot := h.busSnapshot()
	h.mu.Unlock()

	log.Printf("passenger connected (total: %d)", len(h.passengers))

	if len(snapshot) > 0 {
		data, err := json.Marshal(snapshot)
		if err == nil {
			select {
			case c.send <- data:
			default:
			}
		}
	}
}

func (h *Hub) UnregisterPassenger(c *PassengerClient) {
	h.mu.Lock()
	if _, ok := h.passengers[c]; ok {
		delete(h.passengers, c)
		close(c.send)
	}
	h.mu.Unlock()

	log.Printf("passenger disconnected (total: %d)", len(h.passengers))
}

// UpdateBusLocation stores the latest position and broadcasts the full bus list to all passengers.
// It also persists the reading to the database, throttled to one insert per persistInterval per bus.
func (h *Hub) UpdateBusLocation(bus *models.Bus) {
	h.mu.Lock()
	h.buses[bus.ID] = bus
	snapshot := h.busSnapshot()
	shouldPersist := time.Since(h.lastPersist[bus.ID]) >= persistInterval
	if shouldPersist {
		h.lastPersist[bus.ID] = time.Now()
	}
	h.mu.Unlock()

	if shouldPersist {
		h.persistLocation(bus)
	}

	data, err := json.Marshal(snapshot)
	if err != nil {
		log.Printf("marshal bus snapshot: %v", err)
		return
	}

	h.mu.RLock()
	for c := range h.passengers {
		select {
		case c.send <- data:
		default:
			// drop message for slow consumer; WritePump will clean up on next write failure
		}
	}
	h.mu.RUnlock()
}

// persistLocation writes the bus's current location to the database for historical tracking.
// Runs asynchronously so a slow/failed insert never blocks broadcasting.
func (h *Hub) persistLocation(bus *models.Bus) {
	transportID, err := strconv.Atoi(bus.ID)
	if err != nil {
		log.Printf("persist location: invalid transport id %q: %v", bus.ID, err)
		return
	}

	go func(transportID int, lat, lng float64) {
		if err := h.db.SaveBusLocation(transportID, lat, lng); err != nil {
			log.Printf("persist location: %v", err)
		}
	}(transportID, bus.Location.Lat, bus.Location.Lng)
}

// RemoveBus removes a bus from the store when its driver disconnects.
func (h *Hub) RemoveBus(busID string) {
	h.mu.Lock()
	delete(h.buses, busID)
	delete(h.lastPersist, busID)
	snapshot := h.busSnapshot()
	h.mu.Unlock()

	data, err := json.Marshal(snapshot)
	if err != nil {
		return
	}

	h.mu.RLock()
	for c := range h.passengers {
		select {
		case c.send <- data:
		default:
		}
	}
	h.mu.RUnlock()
}

// busSnapshot must be called with h.mu held (at least RLock).
func (h *Hub) busSnapshot() []*models.Bus {
	snap := make([]*models.Bus, 0, len(h.buses))
	for _, b := range h.buses {
		snap = append(snap, b)
	}
	return snap
}
