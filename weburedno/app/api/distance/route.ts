import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const distanceCalculationSchema = z.object({
  address: z.string().min(3, 'Adresa je prekratka'),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

// Zagreb districts with approximate coordinates
const ZAGREB_DISTRICTS = {
  'Črnomerec': { lat: 45.8283, lng: 15.9319, postal: '10000' },
  'Donji grad': { lat: 45.8090, lng: 15.9777, postal: '10000' },
  'Gornji grad - Medveščak': { lat: 45.8333, lng: 15.9778, postal: '10000' },
  'Maksimir': { lat: 45.8267, lng: 16.0172, postal: '10000' },
  'Novi Zagreb - istok': { lat: 45.7756, lng: 15.9819, postal: '10000' },
  'Novi Zagreb - zapad': { lat: 45.7717, lng: 15.9419, postal: '10000' },
  'Pešćenica - Žitnjak': { lat: 45.8019, lng: 16.0489, postal: '10000' },
  'Podsljeme': { lat: 45.8644, lng: 15.9667, postal: '10000' },
  'Podsused - Vrapče': { lat: 45.8194, lng: 15.8669, postal: '10000' },
  'Sesvete': { lat: 45.8311, lng: 16.1161, postal: '10000' },
  'Stenjevec': { lat: 45.8089, lng: 15.8986, postal: '10000' },
  'Trešnjevka - jug': { lat: 45.7967, lng: 15.9544, postal: '10000' },
  'Trešnjevka - sjever': { lat: 45.8128, lng: 15.9544, postal: '10000' },
  'Trnje': { lat: 45.8011, lng: 15.9681, postal: '10000' },
  'Brezovica': { lat: 45.7289, lng: 15.9178, postal: '10257' },
  'Dubrava': { lat: 45.8317, lng: 16.0656, postal: '10040' }
};

// Postal code to coordinates mapping for Zagreb area
const POSTAL_CODE_COORDS: { [key: string]: { lat: number; lng: number; district: string } } = {
  '10000': { lat: 45.8150, lng: 15.9819, district: 'Zagreb - Centar' },
  '10010': { lat: 45.7756, lng: 15.9819, district: 'Zagreb - Sloboština' },
  '10020': { lat: 45.7717, lng: 15.9419, district: 'Novi Zagreb' },
  '10040': { lat: 45.8317, lng: 16.0656, district: 'Dubrava' },
  '10090': { lat: 45.8089, lng: 15.8669, district: 'Susedgrad' },
  '10110': { lat: 45.7367, lng: 15.8667, district: 'Zaprešić' },
  '10250': { lat: 45.7500, lng: 15.8167, district: 'Lučko' },
  '10255': { lat: 45.8644, lng: 16.0000, district: 'Gornja Dubrava' },
  '10257': { lat: 45.7289, lng: 15.9178, district: 'Brezovica' },
  '10290': { lat: 45.7333, lng: 15.8500, district: 'Jakovlje' },
  '10310': { lat: 45.9667, lng: 16.1500, district: 'Ivanić-Grad' },
  '10340': { lat: 45.8833, lng: 16.3833, district: 'Vrbovec' },
  '10360': { lat: 45.8311, lng: 16.1161, district: 'Sesvete' },
  '10370': { lat: 46.0333, lng: 16.2000, district: 'Dugo Selo' },
  '10380': { lat: 45.9833, lng: 16.0667, district: 'Sveti Ivan Zelina' },
  '10410': { lat: 45.6167, lng: 15.8833, district: 'Velika Gorica' },
  '10450': { lat: 45.9000, lng: 15.7167, district: 'Jastrebarsko' }
};

// Zagreb center coordinates
const ZAGREB_CENTER = {
  lat: 45.8150,
  lng: 15.9819
};

// Configuration
const DISTANCE_CONFIG = {
  FREE_RADIUS_KM: 10,
  FEE_PER_KM: 0.5, // EUR per km after free radius
  MAX_DISTANCE_KM: 50, // Maximum service distance
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || ''
};

// Calculate distance using Haversine formula
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get coordinates from postal code
function getCoordinatesFromPostalCode(postalCode: string): { lat: number; lng: number; district: string } | null {
  // Clean postal code (remove HR- prefix if present)
  const cleaned = postalCode.replace(/^HR-?/i, '').trim();

  if (POSTAL_CODE_COORDS[cleaned]) {
    return POSTAL_CODE_COORDS[cleaned];
  }

  // Check if it's a valid Zagreb postal code (starts with 10)
  if (cleaned.startsWith('10')) {
    // Default to Zagreb center for unknown Zagreb postal codes
    return { lat: ZAGREB_CENTER.lat, lng: ZAGREB_CENTER.lng, district: 'Zagreb' };
  }

  return null;
}

// Geocode address using Google Maps API (if available)
async function geocodeAddress(address: string, city?: string): Promise<{ lat: number; lng: number } | null> {
  if (!DISTANCE_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return null;
  }

  try {
    const fullAddress = city ? `${address}, ${city}, Croatia` : `${address}, Zagreb, Croatia`;
    const encodedAddress = encodeURIComponent(fullAddress);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${DISTANCE_CONFIG.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Calculate distance fee
function calculateDistanceFee(distanceKm: number): {
  distance_km: number;
  free_radius_km: number;
  billable_distance_km: number;
  fee_per_km: number;
  total_fee: number;
} {
  const billableDistance = Math.max(0, distanceKm - DISTANCE_CONFIG.FREE_RADIUS_KM);
  const totalFee = billableDistance * DISTANCE_CONFIG.FEE_PER_KM;

  return {
    distance_km: Math.round(distanceKm * 10) / 10,
    free_radius_km: DISTANCE_CONFIG.FREE_RADIUS_KM,
    billable_distance_km: Math.round(billableDistance * 10) / 10,
    fee_per_km: DISTANCE_CONFIG.FEE_PER_KM,
    total_fee: Math.round(totalFee * 100) / 100
  };
}

// POST /api/distance - Calculate distance and fee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = distanceCalculationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Neispravni podaci',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { address, postal_code, city, coordinates } = validationResult.data;

    let targetCoords: { lat: number; lng: number } | null = null;
    let locationInfo = '';

    // Priority 1: Use provided coordinates
    if (coordinates) {
      targetCoords = coordinates;
      locationInfo = 'Koordinate';
    }

    // Priority 2: Use postal code
    if (!targetCoords && postal_code) {
      const postalData = getCoordinatesFromPostalCode(postal_code);
      if (postalData) {
        targetCoords = { lat: postalData.lat, lng: postalData.lng };
        locationInfo = postalData.district;
      }
    }

    // Priority 3: Try to geocode the address
    if (!targetCoords && address) {
      const geocoded = await geocodeAddress(address, city);
      if (geocoded) {
        targetCoords = geocoded;
        locationInfo = city || 'Zagreb';
      }
    }

    // Priority 4: Check if address matches a known district
    if (!targetCoords) {
      const addressLower = address.toLowerCase();
      for (const [district, coords] of Object.entries(ZAGREB_DISTRICTS)) {
        if (addressLower.includes(district.toLowerCase())) {
          targetCoords = { lat: coords.lat, lng: coords.lng };
          locationInfo = district;
          break;
        }
      }
    }

    // If still no coordinates, return error
    if (!targetCoords) {
      return NextResponse.json(
        {
          error: 'Lokacija nije pronađena',
          message: 'Ne možemo pronaći navedenu adresu. Molimo provjerite podatke.',
          suggestion: 'Pokušajte dodati poštanski broj ili naziv kvarta.'
        },
        { status: 404 }
      );
    }

    // Calculate distance from Zagreb center
    const distance = calculateHaversineDistance(
      ZAGREB_CENTER.lat,
      ZAGREB_CENTER.lng,
      targetCoords.lat,
      targetCoords.lng
    );

    // Check if within service area
    if (distance > DISTANCE_CONFIG.MAX_DISTANCE_KM) {
      return NextResponse.json({
        success: false,
        message: `Nažalost, ne pružamo usluge na ovoj lokaciji. Maksimalna udaljenost je ${DISTANCE_CONFIG.MAX_DISTANCE_KM}km od centra Zagreba.`,
        data: {
          distance_km: Math.round(distance * 10) / 10,
          max_distance_km: DISTANCE_CONFIG.MAX_DISTANCE_KM,
          location: locationInfo
        }
      });
    }

    // Calculate fee
    const feeDetails = calculateDistanceFee(distance);

    // Prepare response
    const response = {
      success: true,
      data: {
        location: {
          address,
          postal_code,
          city: city || 'Zagreb',
          district: locationInfo,
          coordinates: targetCoords
        },
        distance: {
          from_center_km: feeDetails.distance_km,
          within_free_zone: distance <= DISTANCE_CONFIG.FREE_RADIUS_KM,
          within_service_area: true
        },
        fee: {
          ...feeDetails,
          currency: 'EUR'
        },
        messages: {
          distance: `Udaljenost od centra: ${feeDetails.distance_km} km`,
          fee: feeDetails.total_fee > 0
            ? `Naknada za udaljenost: €${feeDetails.total_fee}`
            : 'Nema naknade za udaljenost (unutar ${DISTANCE_CONFIG.FREE_RADIUS_KM}km)',
          zone: distance <= DISTANCE_CONFIG.FREE_RADIUS_KM
            ? '✅ Unutar besplatne zone'
            : `⚠️ Izvan besplatne zone (>${DISTANCE_CONFIG.FREE_RADIUS_KM}km)`
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Distance calculation error:', error);
    return NextResponse.json(
      {
        error: 'Greška pri izračunu udaljenosti',
        message: error instanceof Error ? error.message : 'Nepoznata greška'
      },
      { status: 500 }
    );
  }
}

// GET /api/distance/zones - Get service zones information
export async function GET() {
  const zones = [
    {
      name: 'Besplatna zona',
      radius_km: DISTANCE_CONFIG.FREE_RADIUS_KM,
      fee: 0,
      color: '#10b981',
      districts: Object.entries(ZAGREB_DISTRICTS)
        .filter(([_, coords]) => {
          const dist = calculateHaversineDistance(
            ZAGREB_CENTER.lat,
            ZAGREB_CENTER.lng,
            coords.lat,
            coords.lng
          );
          return dist <= DISTANCE_CONFIG.FREE_RADIUS_KM;
        })
        .map(([name]) => name)
    },
    {
      name: 'Zona s naknadom',
      radius_km: `${DISTANCE_CONFIG.FREE_RADIUS_KM + 1}-${DISTANCE_CONFIG.MAX_DISTANCE_KM}`,
      fee: DISTANCE_CONFIG.FEE_PER_KM,
      fee_unit: 'EUR/km',
      color: '#f59e0b',
      districts: Object.entries(ZAGREB_DISTRICTS)
        .filter(([_, coords]) => {
          const dist = calculateHaversineDistance(
            ZAGREB_CENTER.lat,
            ZAGREB_CENTER.lng,
            coords.lat,
            coords.lng
          );
          return dist > DISTANCE_CONFIG.FREE_RADIUS_KM && dist <= DISTANCE_CONFIG.MAX_DISTANCE_KM;
        })
        .map(([name]) => name)
    }
  ];

  return NextResponse.json({
    success: true,
    data: {
      center: {
        name: 'Zagreb - Centar',
        coordinates: ZAGREB_CENTER
      },
      zones,
      max_service_distance_km: DISTANCE_CONFIG.MAX_DISTANCE_KM,
      supported_postal_codes: Object.keys(POSTAL_CODE_COORDS).sort()
    }
  });
}