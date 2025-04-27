import { calculateDistance } from '../utils/distance';

describe('Distance Calculation', () => {
    it('should calculate distance between two points', () => {
        const issPos: [number, number] = [33.7490, -84.3880];  // Atlanta, GA
        const userPos: [number, number] = [34.0522, -84.0733]; // Nearby point
        const distance = calculateDistance(issPos, userPos);
        expect(distance).toBeCloseTo(37.5, 1);
    });

    it('should return 0 for same point', () => {
        const pos: [number, number] = [33.7490, -84.3880];
        const distance = calculateDistance(pos, pos);
        expect(distance).toBe(0);
    });

    it('should handle international distances', () => {
        const nyc: [number, number] = [40.7128, -74.0060];  // New York City
        const london: [number, number] = [51.5074, -0.1278]; // London
        const distance = calculateDistance(nyc, london);
        expect(distance).toBeCloseTo(5570, 0);
    });

    it('should handle edge cases', () => {
        // North Pole to South Pole
        const northPole: [number, number] = [90.0, 0.0];
        const southPole: [number, number] = [-90.0, 0.0];
        const poleDistance = calculateDistance(northPole, southPole);
        expect(poleDistance).toBeCloseTo(20015, 0);  // Earth's diameter

        // Equator points
        const point1: [number, number] = [0.0, 0.0];
        const point2: [number, number] = [0.0, 180.0];
        const equatorDistance = calculateDistance(point1, point2);
        expect(equatorDistance).toBeCloseTo(20037, 0);  // Earth's circumference
    });

    it('should throw error for invalid coordinates', () => {
        const validPos: [number, number] = [0.0, 0.0];
        const invalidLat: [number, number] = [91.0, 0.0];
        const invalidLon: [number, number] = [0.0, 181.0];

        expect(() => calculateDistance(invalidLat, validPos)).toThrow();
        expect(() => calculateDistance(validPos, invalidLon)).toThrow();
    });
}); 