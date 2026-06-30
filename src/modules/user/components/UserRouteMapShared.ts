import {
  Bike,
  BriefcaseBusiness,
  Building2,
  BusFront,
  Dumbbell,
  Landmark,
  GraduationCap,
  HeartPulse,
  Home,
  MapPin,
  ShoppingBag,
  Star,
  Utensils,
} from 'lucide-react';

export type SearchRouteResult = {
  id: string;
  name: string;
  startPoint: {
    name: string;
    lat: number;
    lng: number;
  };
  endPoint: {
    name: string;
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  coordinates: [number, number][];
};

export type StopLogoId =
  | 'home'
  | 'work'
  | 'study'
  | 'tourism'
  | 'food'
  | 'building'
  | 'public'
  | 'transport'
  | 'shopping'
  | 'health'
  | 'gym'
  | 'favorite'
  | 'bike';

export type Parada = {
  id: string;
  latitud: number;
  longitud: number;
  logoId: StopLogoId;
  logoUrl?: string;
  titulo: string;
  descripcion: string;
  esFavorito: boolean;
  informacionAdicional?: string;
};

export type ActiveDriverLocation = {
  driverId?: number | null;
  driverCode: string;
  routeName: string;
  lat: number;
  lng: number;
  estimatedDuration?: number | null;
  totalDistance?: number | null;
  price?: number | null;
  isHighlighted?: boolean;
  trackingOnly?: boolean;
};

export const stopLogoOptions: Array<{
  id: StopLogoId;
  label: string;
  color: string;
  icon: typeof Home;
}> = [
  { id: 'home', label: 'Casa', color: '#7dd3fc', icon: Home },
  { id: 'work', label: 'Trabajo', color: '#a5b4fc', icon: BriefcaseBusiness },
  { id: 'study', label: 'Estudio', color: '#86efac', icon: GraduationCap },
  { id: 'tourism', label: 'Turismo', color: '#fde047', icon: Landmark },
  { id: 'food', label: 'Comida', color: '#fda4af', icon: Utensils },
  { id: 'building', label: 'Edificio', color: '#c4b5fd', icon: Building2 },
  { id: 'public', label: 'Publico', color: '#6ee7b7', icon: MapPin },
  { id: 'transport', label: 'Transporte', color: '#67e8f9', icon: BusFront },
  { id: 'shopping', label: 'Compras', color: '#f9a8d4', icon: ShoppingBag },
  { id: 'health', label: 'Salud', color: '#5eead4', icon: HeartPulse },
  { id: 'gym', label: 'Gimnasio', color: '#fdba74', icon: Dumbbell },
  { id: 'favorite', label: 'Favorito', color: '#fca5a5', icon: Star },
  { id: 'bike', label: 'Bici', color: '#bef264', icon: Bike },
];

export const getStopLogoOption = (logoId?: string) =>
  stopLogoOptions.find((item) => item.id === logoId) ?? stopLogoOptions[0];
