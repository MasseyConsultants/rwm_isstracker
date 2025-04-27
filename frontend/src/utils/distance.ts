/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 [latitude, longitude] of first point
 * @param point2 [latitude, longitude] of second point
 * @returns distance in kilometers
 */
export function calculateDistance(point1: [number, number], point2: [number, number]): number {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;

    // Validate coordinates
    if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees');
    }
    if (Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees');
    }

    // Convert to radians
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Convert degrees to radians
 * @param degrees angle in degrees
 * @returns angle in radians
 */
function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
} 