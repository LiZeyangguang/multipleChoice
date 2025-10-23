import { describe, it, expect } from '@jest/globals';

describe('Hello World Tests', () => {
    it('should return true for true', () => {
        expect(true).toBe(true);
    });

    it('should return the sum of two numbers', () => {
        const sum = (a, b) => a + b;
        expect(sum(1, 2)).toBe(3);
    });
});