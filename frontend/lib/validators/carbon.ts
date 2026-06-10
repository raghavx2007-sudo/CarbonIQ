import { z } from "zod";

export const travelSchema = z.object({
  milesDriven: z.number().min(0, "Miles driven cannot be negative"),
  carMpg: z.number().min(0.1, "MPG must be greater than 0"),
  flightsTaken: z.number().int().min(0, "Flights taken cannot be negative"),
  publicTransitMiles: z.number().min(0, "Public transit miles cannot be negative"),
});

export const electricitySchema = z.object({
  kwhUsed: z.number().min(0, "kWh used cannot be negative"),
  percentageRenewable: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
});

export const foodSchema = z.object({
  beefMealsPerWeek: z.number().int().min(0, "Meals cannot be negative"),
  chickenMealsPerWeek: z.number().int().min(0, "Meals cannot be negative"),
  veganMealsPerWeek: z.number().int().min(0, "Meals cannot be negative"),
});

export const shoppingSchema = z.object({
  newClothesBought: z.number().int().min(0, "Items cannot be negative"),
  electronicsBought: z.number().int().min(0, "Items cannot be negative"),
});

export const carbonInputSchema = z.object({
  travel: travelSchema,
  electricity: electricitySchema,
  food: foodSchema,
  shopping: shoppingSchema,
});

export type ValidatedCarbonInput = z.infer<typeof carbonInputSchema>;
