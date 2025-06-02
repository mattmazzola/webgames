/**
 * A simple seeded pseudo-random number generator.
 * Based on a linear congruential generator algorithm.
 */
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  /**
   * Returns a pseudo-random number between 0 (inclusive) and 1 (exclusive)
   * Uses Linear Congruential Generator (LCG) algorithm
   * Reference: https://en.wikipedia.org/wiki/Linear_congruential_generator
   */
  random(): number {
    // Simple LCG parameters
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    // Update seed using the LCG formula
    this.seed = (a * this.seed + c) % m;
    
    // Return a number between 0 and 1
    return this.seed / m;
  }
  
  /**
   * Returns a pseudo-random integer between min (inclusive) and max (inclusive)
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

/**
 * Creates a seed from a string
 */
export function stringToSeed(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}
