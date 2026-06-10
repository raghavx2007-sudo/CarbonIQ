export interface TravelInput {
  milesDriven: number;
  carMpg: number;
  flightsTaken: number;
  publicTransitMiles: number;
}

export interface ElectricityInput {
  kwhUsed: number;
  percentageRenewable: number;
}

export interface FoodInput {
  beefMealsPerWeek: number;
  chickenMealsPerWeek: number;
  veganMealsPerWeek: number;
}

export interface ShoppingInput {
  newClothesBought: number;
  electronicsBought: number;
}

export interface CarbonInput {
  travel: TravelInput;
  electricity: ElectricityInput;
  food: FoodInput;
  shopping: ShoppingInput;
}

export interface CarbonOutput {
  totalCo2eKg: number;
  breakdown: {
    travel: number;
    electricity: number;
    food: number;
    shopping: number;
  };
}
