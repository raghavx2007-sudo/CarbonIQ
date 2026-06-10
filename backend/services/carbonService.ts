import { prisma } from "../lib/db";
import { calculateTotalFootprint } from "../lib/carbon-engine";
import { ValidatedCarbonInput } from "../lib/validators/carbon";
import * as crypto from "crypto";

export class CarbonService {
  /**
   * Generates a deterministic signature for the footprint input to enable caching.
   * @param {ValidatedCarbonInput} input - The validated user inputs for carbon calculation.
   * @returns {string} SHA-256 hash signature.
   */
  private static generateSignature(input: ValidatedCarbonInput): string {
    const stringified = JSON.stringify(input, Object.keys(input).sort());
    return crypto.createHash("sha256").update(stringified).digest("hex");
  }

  /**
   * Submits a new carbon footprint or returns a cached one if inputs are identical.
   * Prevents redundant database inserts and calculations.
   * @param {string} userId - The ID of the user submitting the footprint.
   * @param {ValidatedCarbonInput} input - The validated user inputs.
   * @returns {Promise<any>} The saved or cached footprint record.
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
   * Fetches the user's history of footprints, ordered by creation date ascending.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<any[]>} An array of historical footprint records.
   */
  static async getUserHistory(userId: string) {
    return prisma.carbonFootprint.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Fetches the user's most recent footprint.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<any|null>} The latest footprint record or null if none exists.
   */
  static async getLatestFootprint(userId: string) {
    return prisma.carbonFootprint.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
