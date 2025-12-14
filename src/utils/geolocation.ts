export type LocationStatus = 'captured' | 'manual' | 'denied' | 'requesting' | 'error';

export interface LocationData {
  lat: number | null;
  lng: number | null;
  label: string | null;
  status: LocationStatus;
}

export async function requestGeolocation(): Promise<LocationData> {
  if (!navigator.geolocation) {
    return {
      lat: null,
      lng: null,
      label: null,
      status: 'error'
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: null,
          status: 'captured'
        });
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        resolve({
          lat: null,
          lng: null,
          label: null,
          status: error.code === 1 ? 'denied' : 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}


