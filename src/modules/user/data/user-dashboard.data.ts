import type { Route } from '@/types/route';

export type UserRoute = Route & {
  price: string;
  frequency: string;
  status: 'Operando' | 'Alta demanda' | 'Desvio';
  tags: string[];
  transfers: number;
};

export type MobilityNews = {
  id: string;
  title: string;
  category: string;
  time: string;
  detail: string;
};

export const userRoutes: UserRoute[] = [
  {
    id: 'metro-a-poblado',
    name: 'Metro A + Integrado Poblado',
    startPoint: { name: 'Universidad de Antioquia', lat: 6.2692, lng: -75.5653 },
    endPoint: { name: 'Parque del Poblado', lat: 6.2103, lng: -75.5707 },
    distance: 8.4,
    duration: 34,
    color: '#2563eb',
    price: '$3.650',
    frequency: 'Cada 7 min',
    status: 'Operando',
    tags: ['Metro', 'Integrado', 'Baja caminata'],
    transfers: 1,
    coordinates: [
      [6.2692, -75.5653],
      [6.2648, -75.5676],
      [6.253, -75.5682],
      [6.2442, -75.5812],
      [6.229, -75.575],
      [6.2103, -75.5707],
    ],
    stops: [
      { id: 'u-de-a', name: 'Universidad', lat: 6.2692, lng: -75.5653, sequence: 1 },
      { id: 'berrio', name: 'Parque Berrio', lat: 6.2442, lng: -75.5812, sequence: 2 },
      { id: 'poblado', name: 'Poblado', lat: 6.2103, lng: -75.5707, sequence: 3 },
    ],
  },
  {
    id: 'laureles-ruta-n',
    name: 'Circular Laureles - Ruta N',
    startPoint: { name: 'Primer Parque de Laureles', lat: 6.2446, lng: -75.5967 },
    endPoint: { name: 'Ruta N', lat: 6.2647, lng: -75.5665 },
    distance: 5.9,
    duration: 28,
    color: '#059669',
    price: '$3.200',
    frequency: 'Cada 12 min',
    status: 'Alta demanda',
    tags: ['Bus urbano', 'Directa', 'Trabajo'],
    transfers: 0,
    coordinates: [
      [6.2446, -75.5967],
      [6.2497, -75.5896],
      [6.2536, -75.577],
      [6.2604, -75.5709],
      [6.2647, -75.5665],
    ],
    stops: [
      { id: 'laureles', name: 'Laureles', lat: 6.2446, lng: -75.5967, sequence: 1 },
      { id: 'estadio', name: 'Estadio', lat: 6.2536, lng: -75.577, sequence: 2 },
      { id: 'ruta-n', name: 'Ruta N', lat: 6.2647, lng: -75.5665, sequence: 3 },
    ],
  },
  {
    id: 'belen-estadio',
    name: 'Belen - Estadio directo',
    startPoint: { name: 'Parque de Belen', lat: 6.2275, lng: -75.6026 },
    endPoint: { name: 'Estadio Atanasio Girardot', lat: 6.2562, lng: -75.5902 },
    distance: 4.7,
    duration: 22,
    color: '#f97316',
    price: '$3.200',
    frequency: 'Cada 10 min',
    status: 'Operando',
    tags: ['Bus urbano', 'Sin transbordos', 'Rapida'],
    transfers: 0,
    coordinates: [
      [6.2275, -75.6026],
      [6.2367, -75.5971],
      [6.2472, -75.5948],
      [6.2562, -75.5902],
    ],
    stops: [
      { id: 'belen', name: 'Belen', lat: 6.2275, lng: -75.6026, sequence: 1 },
      { id: 'unidad-deportiva', name: 'Unidad Deportiva', lat: 6.2472, lng: -75.5948, sequence: 2 },
      { id: 'estadio-final', name: 'Estadio', lat: 6.2562, lng: -75.5902, sequence: 3 },
    ],
  },
];

export const favoriteRoutes = [userRoutes[0], userRoutes[2]];

export const mobilityNews: MobilityNews[] = [
  {
    id: 'metro-frequency',
    title: 'Metro aumenta frecuencia en hora pico',
    category: 'Metro',
    time: 'Hoy, 6:30 a.m.',
    detail: 'Intervalos menores entre Universidad, San Antonio y Poblado durante la manana.',
  },
  {
    id: 'la-80',
    title: 'Obras en corredor de la 80',
    category: 'Vias',
    time: 'Actualizado 8:10 a.m.',
    detail: 'Algunas rutas urbanas toman desvios cortos cerca de Floresta y Calasanz.',
  },
  {
    id: 'rain',
    title: 'Lluvia prevista al final de la tarde',
    category: 'Clima',
    time: 'Proximo reporte 3:00 p.m.',
    detail: 'Considera rutas con menor caminata si viajas hacia el occidente de Medellin.',
  },
];
