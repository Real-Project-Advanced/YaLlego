# Frontend Integration Guide — Go Tracking Service

This document explains how the Next.js frontend integrates with the Go real-time bus tracking microservice.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Local dev   | `ws://localhost:8080` |
| Production  | `ws://<your-server-host>:8080` |

Add this to your Next.js environment files:

```env
# .env.local
NEXT_PUBLIC_TRACKING_WS_URL=ws://localhost:8080
```

---

## WebSocket Endpoints

### `GET /ws/driver?token=<JWT>`

Used by **drivers** to send their live GPS position to the service.

| Detail | Value |
|--------|-------|
| Auth required | Yes — access token as `token` query parameter |
| Direction | Client → Server |
| Message format | JSON `GPSUpdate` (see below) |
| On connect | Service validates JWT, looks up the driver's assigned transport in the database |
| On disconnect | Bus is removed from the in-memory store; passengers receive an updated list |

### `GET /ws/passenger`

Used by **passengers** to receive real-time bus location updates.

| Detail | Value |
|--------|-------|
| Auth required | No |
| Direction | Server → Client |
| Message format | JSON array of `Bus` objects (see below) |
| On connect | Service immediately sends the current snapshot of all active buses |
| On update | Service sends the full bus array every time any bus moves |

### `GET /health`

Plain HTTP health check. Returns `200 ok`. Useful for Docker/load-balancer probes.

---

## JSON Message Formats

### Driver → Server: `GPSUpdate`

Sent by the driver client on every geolocation update.

```json
{
  "lat": 6.244203,
  "lng": -75.581212
}
```

| Field | Type | Description |
|-------|------|-------------|
| `lat` | `number` | Latitude (decimal degrees) |
| `lng` | `number` | Longitude (decimal degrees) |

### Server → Passenger: `Bus[]`

The full list of currently active buses. Sent on connection and on every GPS update.

```json
[
  {
    "id": "3",
    "plate": "ABC123",
    "model": "Chevrolet NHR",
    "capacity": 19,
    "location": {
      "lat": 6.244203,
      "lng": -75.581212
    },
    "routeId": 7
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Transport ID from the database |
| `plate` | `string` | Vehicle plate |
| `model` | `string` | Vehicle model |
| `capacity` | `number` | Passenger capacity |
| `location.lat` | `number` | Current latitude |
| `location.lng` | `number` | Current longitude |
| `routeId` | `number \| undefined` | Route ID if assigned, omitted otherwise |

This shape matches the existing `Bus` interface in `src/types/bus.ts` exactly.

---

## Authentication for WebSocket

The access token lives in an `httpOnly` cookie and cannot be read by client-side JavaScript directly. The recommended approach is to have Next.js expose the token through a lightweight API route:

```typescript
// src/app/api/auth/token/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = cookies().get('accessToken')?.value
  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  return NextResponse.json({ token })
}
```

Both snippets below call this route to obtain the token before opening the WebSocket.

---

## Driver Dashboard — Send GPS Coordinates

Create this hook and use it in the `/driver/dashboard` page.

```typescript
// src/hooks/useDriverTracking.ts
import { useEffect, useRef, useCallback } from 'react'

const WS_BASE = process.env.NEXT_PUBLIC_TRACKING_WS_URL ?? 'ws://localhost:8080'

export function useDriverTracking() {
  const wsRef      = useRef<WebSocket | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const retryRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (retryRef.current)   clearTimeout(retryRef.current)
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    wsRef.current?.close()
    wsRef.current      = null
    watchIdRef.current = null
  }, [])

  const connect = useCallback(async () => {
    // Fetch the access token from the Next.js API route
    const res = await fetch('/api/auth/token')
    if (!res.ok) {
      console.error('[tracking] could not retrieve access token')
      return
    }
    const { token } = await res.json()

    const ws = new WebSocket(`${WS_BASE}/ws/driver?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[tracking] driver connected')

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (ws.readyState !== WebSocket.OPEN) return
          ws.send(
            JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          )
        },
        (err) => console.error('[geolocation]', err.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 }
      )
    }

    ws.onclose = () => {
      console.log('[tracking] disconnected — reconnecting in 5 s')
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      retryRef.current = setTimeout(connect, 5_000)
    }

    ws.onerror = (err) => console.error('[tracking] WebSocket error', err)
  }, [])

  useEffect(() => {
    connect()
    return stop
  }, [connect, stop])
}
```

```typescript
// src/app/driver/dashboard/page.tsx  (replace the "próximamente..." placeholder)
'use client'

import { useDriverTracking } from '@/hooks/useDriverTracking'

export default function DriverDashboard() {
  useDriverTracking()

  return (
    <main>
      <h1>Driver Dashboard</h1>
      <p>Your location is being shared in real time.</p>
    </main>
  )
}
```

---

## Passenger Map — Receive Live Bus Locations

This hook replaces the mock data from `src/lib/maps/mock-buses.ts`.

```typescript
// src/hooks/useLiveBuses.ts
import { useState, useEffect, useRef } from 'react'

const WS_BASE = process.env.NEXT_PUBLIC_TRACKING_WS_URL ?? 'ws://localhost:8080'

export interface LiveBus {
  id: string
  plate: string
  model: string
  capacity: number
  location: { lat: number; lng: number }
  routeId?: number
}

export function useLiveBuses(): LiveBus[] {
  const [buses, setBuses]  = useState<LiveBus[]>([])
  const wsRef              = useRef<WebSocket | null>(null)
  const retryRef           = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(`${WS_BASE}/ws/passenger`)
      wsRef.current = ws

      ws.onopen    = () => console.log('[tracking] passenger connected')

      ws.onmessage = (event) => {
        try {
          setBuses(JSON.parse(event.data) as LiveBus[])
        } catch {
          console.error('[tracking] failed to parse bus update')
        }
      }

      ws.onclose = () => {
        console.log('[tracking] passenger disconnected — reconnecting in 5 s')
        retryRef.current = setTimeout(connect, 5_000)
      }

      ws.onerror = (err) => console.error('[tracking] error', err)
    }

    connect()

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [])

  return buses
}
```

### Plug it into the Leaflet map

```typescript
// src/components/BusMap.tsx
'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useLiveBuses } from '@/hooks/useLiveBuses'
import 'leaflet/dist/leaflet.css'

export default function BusMap() {
  const buses = useLiveBuses()   // replaces mock-buses.ts

  return (
    <MapContainer center={[6.2442, -75.5812]} zoom={13} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {buses.map((bus) => (
        <Marker key={bus.id} position={[bus.location.lat, bus.location.lng]}>
          <Popup>
            <strong>{bus.plate}</strong><br />
            {bus.model} · {bus.capacity} seats
            {bus.routeId && <><br />Route #{bus.routeId}</>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

---

## Behavior Summary

| Event | What happens |
|-------|-------------|
| Driver connects | Service validates JWT, fetches transport + route from DB, adds bus to in-memory store |
| Driver sends GPS | Location updated in memory; all passengers receive the full bus list |
| Driver disconnects | Bus removed from store; passengers receive updated list (bus disappears from map) |
| Passenger connects | Immediately receives current snapshot of all active buses |
| No drivers online | Passengers receive an empty array `[]` |
