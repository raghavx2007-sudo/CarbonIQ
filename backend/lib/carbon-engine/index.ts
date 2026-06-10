import {
  CarbonInput,
  CarbonOutput,
  TravelInput,
  ElectricityInput,
  FoodInput,
  ShoppingInput,
} from "./types";

// Emission factors (kg CO2e)
const FACTORS = {
  GASOLINE_PER_GALLON: 8.887,
  FLIGHT_PER_FLIGHT: 250, // Approximation for a short/medium flight
  PUBLIC_TRANSIT_PER_MILE: 0.17, // Commuter rail/bus avg
  ELECTRICITY_PER_KWH: 0.385, // US average
  BEEF_MEAL: 3.5,
  CHICKEN_MEAL: 1.2,
  VEGAN_MEAL: 0.5,
  NEW_CLOTHES: 15, // Per item avg
  ELECTRONICS: 50, // Per item avg
};

export const calculateTravel = (input: TravelInput): number => {
  if (input.milesDriven < 0 || input.carMpg <= 0 || input.flightsTaken < 0 || input.publicTransitMiles < 0) {
    throw new Error("Invalid travel input values");
  }
  
  const drivingEmissions = (input.milesDriven / input.carMpg) * FACTORS.GASOLINE_PER_GALLON;
  const flightEmissions = input.flightsTaken * FACTORS.FLIGHT_PER_FLIGHT;
  const transitEmissions = input.publicTransitMiles * FACTORS.PUBLIC_TRANSIT_PER_MILE;

  return drivingEmissions + flightEmissions + transitEmissions;
};

export const calculateElectricity = (input: ElectricityInput): number => {
  if (input.kwhUsed < 0 || input.percentageRenewable < 0 || input.percentageRenewable > 100) {
    throw new Error("Invalid electricity input values");
  }

  const nonRenewableFraction = 1 - (input.percentageRenewable / 100);
  return input.kwhUsed * nonRenewableFraction * FACTORS.ELECTRICITY_PER_KWH;
};

export const calculateFood = (input: FoodInput): number => {
  if (input.beefMealsPerWeek < 0 || input.chickenMealsPerWeek < 0 || input.veganMealsPerWeek < 0) {
    throw new Error("Invalid food input values");
  }

  // Multiply by 52 for annual, but let's assume the calculation is for a weekly footprint baseline 
  // or maybe it's just the exact footprint for a week. We'll stick to weekly footprint scale.
  return (
    input.beefMealsPerWeek * FACTORS.BEEF_MEAL +
    input.chickenMealsPerWeek * FACTORS.CHICKEN_MEAL +
    input.veganMealsPerWeek * FACTORS.VEGAN_MEAL
  );
};

export const calculateShopping = (input: ShoppingInput): number => {
  if (input.newClothesBought < 0 || input.electronicsBought < 0) {
    throw new Error("Invalid shopping input values");
  }

  return (
    input.newClothesBought * FACTORS.NEW_CLOTHES +
    input.electronicsBought * FACTORS.ELECTRONICS
  );
};

export const calculateTotalFootprint = (input: CarbonInput): CarbonOutput => {
  const travel = calculateTravel(input.travel);
  const electricity = calculateElectricity(input.electricity);
  const food = calculateFood(input.food);
  const shopping = calculateShopping(input.shopping);

  const totalCo2eKg = travel + electricity + food + shopping;

  return {
    totalCo2eKg: parseFloat(totalCo2eKg.toFixed(2)),
    breakdown: {
      travel: parseFloat(travel.toFixed(2)),
      electricity: parseFloat(electricity.toFixed(2)),
      food: parseFloat(food.toFixed(2)),
      shopping: parseFloat(shopping.toFixed(2)),
    },
  };
};
