import { prisma } from "../lib/db";
import { calculateTotalFootprint } from "../lib/carbon-engine";
import { ValidatedCarbonInput } from "../lib/validators/carbon";
import * as crypto from "crypto";

export class CarbonService {
  /**
   * Generates a deterministic signature for the footprint input
   */
  private static generateSignature(input: ValidatedCarbonInput): string {
    const stringified = JSON.stringify(input, Object.keys(input).sort());
    return crypto.createHash("sha256").update(stringified).digest("hex");
  }

  /**
   * Submits a new carbon footprint or returns a cached one if inputs are identical
   */
  static async submitFootprint(userId: string, input: ValidatedCarbonInput) {
    const signature = this.generateSignature(input);

    // 1. Check Cache (Database for identical input)
    const existing = await prisma.carbonFootprint.findFirst({
      where: {
        userId,
        inputSignature: signature,
      },
    });

    if (existing) {
      return existing; // Return cached result, preventing redundant calculation/insert
    }

    // 2. Calculate using pure engine
    const output = calculateTotalFootprint(input);

    // 3. Save to database
    const record = await prisma.carbonFootprint.create({
      data: {
        userId,
        inputData: JSON.stringify(input),
        inputSignature: signature,
        totalCo2eKg: output.totalCo2eKg,
        travelCo2e: output.breakdown.travel,
        electricityCo2e: output.breakdown.electricity,
        foodCo2e: output.breakdown.food,
        shoppingCo2e: output.breakdown.shopping,
      },
    });

    return record;
  }

  /**
   * Fetches the user's history of footprints
   */
  static async getUserHistory(userId: string) {
    return prisma.carbonFootprint.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Fetches the latest footprint
   */
  static async getLatestFootprint(userId: string) {
    return prisma.carbonFootprint.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
