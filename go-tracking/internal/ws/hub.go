package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/models"
)

// Hub holds the in-memory bus location store and the set of connected passenger clients.
type Hub struct {
	mu         sync.RWMutex
	passengers map[*PassengerClient]bool
	buses      map[string]*models.Bus // keyed by transport ID string
}

func NewHub() *Hub {
	return &Hub{
		passengers: make(map[*PassengerClient]bool),
		buses:      make(map[string]*models.Bus),
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
func (h *Hub) UpdateBusLocation(bus *models.Bus) {
	h.mu.Lock()
	h.buses[bus.ID] = bus
	snapshot := h.busSnapshot()
	h.mu.Unlock()

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

// RemoveBus removes a bus from the store when its driver disconnects.
func (h *Hub) RemoveBus(busID string) {
	h.mu.Lock()
	delete(h.buses, busID)
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
