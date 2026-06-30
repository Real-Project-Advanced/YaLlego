package auth

import (
	"errors"
	"fmt"

	"github.com/Real-Project-Advanced/YaLlego/go-tracking/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token expired")
	ErrNotDriver    = errors.New("driver role required")
)

// ValidateAccessToken parses and validates an HS256 JWT, returning the claims on success.
func ValidateAccessToken(tokenString, secret string) (*models.Claims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	mc, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	claims := &models.Claims{}
	if v, ok := mc["id"].(float64); ok {
		claims.ID = int(v)
	}
	if v, ok := mc["email"].(string); ok {
		claims.Email = v
	}
	if v, ok := mc["fullname"].(string); ok {
		claims.Fullname = v
	}
	if v, ok := mc["role"].(string); ok {
		claims.Role = v
	}

	return claims, nil
}

func RequireDriverRole(claims *models.Claims) error {
	if claims.Role != "DRIVER" {
		return ErrNotDriver
	}
	return nil
}
