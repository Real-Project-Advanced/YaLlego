package ws

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)

// PassengerClient is a WebSocket connection that only receives bus location broadcasts.
type PassengerClient struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

func NewPassengerClient(hub *Hub, conn *websocket.Conn) *PassengerClient {
	return &PassengerClient{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 64),
	}
}

// WritePump pumps messages from the hub to the WebSocket connection.
// Must run in its own goroutine — only one writer per connection.
func (c *PassengerClient) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Printf("passenger write: %v", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ReadPump reads and discards messages (passengers only receive).
// Handles pong frames and triggers cleanup on disconnect.
func (c *PassengerClient) ReadPump() {
	defer func() {
		c.hub.UnregisterPassenger(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(256)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("passenger read: %v", err)
			}
			break
		}
	}
}
