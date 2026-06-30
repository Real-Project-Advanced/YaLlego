package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Fullname  string    `json:"fullname"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Driver struct {
	ID                int       `json:"id"`
	UserID            int       `json:"user_id"`
	TransportID       *int      `json:"transport_id"`
	LicenseType       string    `json:"license_type"`
	ExperienceYears   int       `json:"experience_years"`
	LicenseExpiration time.Time `json:"license_expiration"`
}

type Transport struct {
	ID       int    `json:"id"`
	Plate    string `json:"plate"`
	Model    string `json:"model"`
	Capacity int    `json:"capacity"`
	IsActive bool   `json:"is_active"`
}

type Route struct {
	ID          int    `json:"id"`
	Origin      string `json:"origin"`
	Destination string `json:"destination"`
	TransportID int    `json:"transport_id"`
}

// Location is a GPS coordinate pair.
type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// Bus is the message shape broadcast to passengers — must match the frontend Bus interface.
type Bus struct {
	ID       string   `json:"id"`
	Plate    string   `json:"plate"`
	Model    string   `json:"model"`
	Capacity int      `json:"capacity"`
	Location Location `json:"location"`
	RouteID   *int    `json:"routeId,omitempty"`
	RouteName string  `json:"routeName,omitempty"`
}

// GPSUpdate is the message a driver sends to the service.
type GPSUpdate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// Claims holds the fields extracted from the JWT access token.
type Claims struct {
	ID       int
	Email    string
	Fullname string
	Role     string
}
