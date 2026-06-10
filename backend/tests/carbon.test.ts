import {
  calculateTravel,
  calculateElectricity,
  calculateFood,
  calculateShopping,
  calculateTotalFootprint,
} from "../lib/carbon-engine";

describe("Carbon Engine - Pure Functions", () => {
  describe("calculateTravel", () => {
    it("should calculate travel emissions correctly for standard inputs", () => {
      const emissions = calculateTravel({
        milesDriven: 100,
        carMpg: 25,
        flightsTaken: 1,
        publicTransitMiles: 50,
      });
      // (100/25)*8.887 + 1*250 + 50*0.17
      // = 35.548 + 250 + 8.5 = 294.048
      expect(emissions).toBeCloseTo(294.048);
    });

    it("should return zero emissions when all travel is zero", () => {
      const emissions = calculateTravel({
        milesDriven: 0,
        carMpg: 30,
        flightsTaken: 0,
        publicTransitMiles: 0,
      });
      expect(emissions).toBe(0);
    });

    it("should throw error for negative miles driven", () => {
      expect(() => {
        calculateTravel({
          milesDriven: -10,
          carMpg: 30,
          flightsTaken: 0,
          publicTransitMiles: 0,
        });
      }).toThrow("Invalid travel input values");
    });
    
    it("should throw error for negative flights", () => {
      expect(() => {
        calculateTravel({
          milesDriven: 100,
          carMpg: 30,
          flightsTaken: -1,
          publicTransitMiles: 0,
        });
      }).toThrow("Invalid travel input values");
    });
  });

  describe("calculateElectricity", () => {
    it("should calculate electricity emissions correctly", () => {
      const emissions = calculateElectricity({
        kwhUsed: 500,
        percentageRenewable: 20,
      });
      // 500 * (1 - 0.2) * 0.385 = 500 * 0.8 * 0.385 = 154
      expect(emissions).toBeCloseTo(154);
    });

    it("should return zero for 100% renewable energy", () => {
      const emissions = calculateElectricity({
        kwhUsed: 1000,
        percentageRenewable: 100,
      });
      expect(emissions).toBe(0);
    });

    it("should throw error for invalid percentage", () => {
      expect(() => {
        calculateElectricity({
          kwhUsed: 500,
          percentageRenewable: 150,
        });
      }).toThrow("Invalid electricity input values");
    });
  });

  describe("calculateFood", () => {
    it("should calculate food emissions correctly", () => {
      const emissions = calculateFood({
        beefMealsPerWeek: 2,
        chickenMealsPerWeek: 5,
        veganMealsPerWeek: 14,
      });
      // 2*3.5 + 5*1.2 + 14*0.5 = 7 + 6 + 7 = 20
      expect(emissions).toBe(20);
    });
  });

  describe("calculateShopping", () => {
    it("should calculate shopping emissions correctly", () => {
      const emissions = calculateShopping({
        newClothesBought: 3,
        electronicsBought: 1,
      });
      // 3*15 + 1*50 = 45 + 50 = 95
      expect(emissions).toBe(95);
    });
  });

  describe("calculateTotalFootprint", () => {
    it("should aggregate all categories correctly", () => {
      const result = calculateTotalFootprint({
        travel: { milesDriven: 100, carMpg: 25, flightsTaken: 0, publicTransitMiles: 0 },
        electricity: { kwhUsed: 200, percentageRenewable: 0 },
        food: { beefMealsPerWeek: 1, chickenMealsPerWeek: 0, veganMealsPerWeek: 0 },
        shopping: { newClothesBought: 1, electronicsBought: 0 },
      });

      // travel: (100/25)*8.887 = 35.548
      // electricity: 200 * 0.385 = 77
      // food: 1 * 3.5 = 3.5
      // shopping: 1 * 15 = 15
      // total = 35.548 + 77 + 3.5 + 15 = 131.048
      
      expect(result.totalCo2eKg).toBeCloseTo(131.05);
      expect(result.breakdown.travel).toBeCloseTo(35.55);
      expect(result.breakdown.electricity).toBeCloseTo(77);
      expect(result.breakdown.food).toBeCloseTo(3.5);
      expect(result.breakdown.shopping).toBeCloseTo(15);
    });
  });
});
