import {
  Home,
  BriefcaseBusiness,
  GraduationCap,
  Landmark,
  Utensils,
  Building2,
  MapPin,
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

export type StopLogoId = 'home' | 'work' | 'study' | 'tourism' | 'food' | 'building' | 'public';

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

export const stopLogoOptions: Array<{
  id: StopLogoId;
  label: string;
  color: string;
  icon: typeof Home;
}> = [
  { id: 'home', label: 'Casa', color: '#bae6fd', icon: Home },
  { id: 'work', label: 'Trabajo', color: '#c7d2fe', icon: BriefcaseBusiness },
  { id: 'study', label: 'Estudio', color: '#bbf7d0', icon: GraduationCap },
  { id: 'tourism', label: 'Turismo', color: '#fde68a', icon: Landmark },
  { id: 'food', label: 'Comida', color: '#fecdd3', icon: Utensils },
  { id: 'building', label: 'Edificio', color: '#ddd6fe', icon: Building2 },
  { id: 'public', label: 'Publico', color: '#a7f3d0', icon: MapPin },
];

export const getStopLogoOption = (logoId?: string) =>
  stopLogoOptions.find((item) => item.id === logoId) ?? stopLogoOptions[0];
