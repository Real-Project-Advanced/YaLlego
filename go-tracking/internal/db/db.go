package db

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/models"
	_ "github.com/lib/pq"
)

type DB struct {
	conn *sql.DB
}

func Connect(databaseURL string) (*DB, error) {
	conn, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("opening db: %w", err)
	}
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("pinging db: %w", err)
	}
	log.Println("connected to postgresql")
	return &DB{conn: conn}, nil
}

func (d *DB) Close() {
	d.conn.Close()
}

// GetDriverWithTransport returns the driver and their active assigned transport for the given user ID.
func (d *DB) GetDriverWithTransport(userID int) (*models.Driver, *models.Transport, error) {
	row := d.conn.QueryRow(`
		SELECT
			dr.id, dr.user_id, dr.transport_id, dr.license_type, dr.experience_years,
			t.id,  t.plate,   t.model,          t.capacity,     t.is_active
		FROM drivers dr
		JOIN transports t ON t.id = dr.transport_id
		WHERE dr.user_id = $1
		  AND t.is_active = true
	`, userID)

	var driver models.Driver
	var transport models.Transport
	var transportID int

	err := row.Scan(
		&driver.ID, &driver.UserID, &transportID, &driver.LicenseType, &driver.ExperienceYears,
		&transport.ID, &transport.Plate, &transport.Model, &transport.Capacity, &transport.IsActive,
	)
	if err == sql.ErrNoRows {
		return nil, nil, fmt.Errorf("no active transport assigned to driver (user_id=%d)", userID)
	}
	if err != nil {
		return nil, nil, fmt.Errorf("querying driver: %w", err)
	}

	driver.TransportID = &transportID
	return &driver, &transport, nil
}

// SaveBusLocation inserts a GPS reading into bus_locations for historical persistence.
func (d *DB) SaveBusLocation(transportID int, lat float64, lng float64) error {
	_, err := d.conn.Exec(`
		INSERT INTO bus_locations (transport_id, lat, lng)
		VALUES ($1, $2, $3)
	`, transportID, lat, lng)
	if err != nil {
		return fmt.Errorf("saving bus location (transport_id=%d): %w", transportID, err)
	}
	return nil
}

// GetRouteByTransportID returns the most recently created route for the given transport, or nil if none.
func (d *DB) GetRouteByTransportID(transportID int) (*models.Route, error) {
	row := d.conn.QueryRow(`
		SELECT id, origin, destination, transport_id
		FROM routes
		WHERE transport_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`, transportID)

	var route models.Route
	err := row.Scan(&route.ID, &route.Origin, &route.Destination, &route.TransportID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("querying route: %w", err)
	}
	return &route, nil
}
