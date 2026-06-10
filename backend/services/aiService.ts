import { prisma } from "../lib/db";
import { rateLimit } from "../lib/security/rate-limit";

interface AIResponse {
  suggestionText: string;
  impactCategory: string;
}

export class AIService {
  /**
   * Simulates calling an external AI API (e.g., OpenAI/Gemini)
   * In a real application, this would use the respective SDK.
   */
  private static async fetchFromAI(footprintData: any): Promise<AIResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simple deterministic response for simulation purposes based on highest emission category
    const { travelCo2e, electricityCo2e, foodCo2e, shoppingCo2e } = footprintData;
    const max = Math.max(travelCo2e, electricityCo2e, foodCo2e, shoppingCo2e);

    if (max === travelCo2e && travelCo2e > 0) {
      return {
        impactCategory: "TRAVEL",
        suggestionText: "Your travel emissions are your highest contributor. Consider switching 20% of your driving miles to public transit to reduce your footprint significantly.",
      };
    } else if (max === foodCo2e && foodCo2e > 0) {
      return {
        impactCategory: "FOOD",
        suggestionText: "Dietary choices are impacting your footprint. Swapping 2 beef meals per week for vegan alternatives can lower this category by up to 30%.",
      };
    } else if (max === electricityCo2e && electricityCo2e > 0) {
      return {
        impactCategory: "ELECTRICITY",
        suggestionText: "Your electricity usage is high. Opting into a green energy program with your utility provider could drastically reduce these emissions.",
      };
    } else {
      return {
        impactCategory: "GENERAL",
        suggestionText: "You have a balanced footprint. Focus on incremental reductions across all categories, like buying fewer new clothes and driving efficiently.",
      };
    }
  }

  /**
   * Gets personalized recommendations with strict caching and rate limiting
   */
  static async getRecommendations(userId: string, footprintId: string) {
    // 1. Rate Limiting Check (max 5 AI calls per minute per user)
    const rateLimitResult = rateLimit(`ai_coach_${userId}`, 5, 60000);
    if (!rateLimitResult.success) {
      throw new Error("Rate limit exceeded for AI Coach. Please try again later.");
    }

    // 2. Fetch the footprint
    const footprint = await prisma.carbonFootprint.findUnique({
      where: { id: footprintId },
    });

    if (!footprint || footprint.userId !== userId) {
      throw new Error("Footprint not found or unauthorized");
    }

    // 3. Check AI Cache (Database)
    // We cache AI responses based on the footprint's inputSignature to avoid redundant external API calls
    const cachedRecommendation = await prisma.aIRecommendation.findFirst({
      where: {
        userId,
        footprintSignature: footprint.inputSignature,
      },
    });

    if (cachedRecommendation) {
      return cachedRecommendation;
    }

    // 4. Call external AI service
    const aiResponse = await this.fetchFromAI(footprint);

    // 5. Store result in cache
    const newRecommendation = await prisma.aIRecommendation.create({
      data: {
        userId,
        footprintSignature: footprint.inputSignature,
        suggestionText: aiResponse.suggestionText,
        impactCategory: aiResponse.impactCategory,
      },
    });

    return newRecommendation;
  }
}
