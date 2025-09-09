import type {
  HeyGenListAPIResponse,
  PromptsListResponse,
} from "@/app/types/prompt";
import {
  transformKnowledgeBaseToPrompt,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/prompt-utils";
import { ERROR_MESSAGES } from "@/app/lib/error-messages";
import { HEYGEN_API_ENDPOINTS } from "@/app/lib/constants";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) {
      console.error("HEYGEN_API_KEY is missing from environment variables");
      return createErrorResponse("API configuration error", 500);
    }

    const baseApiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

    const response = await fetch(
      `${baseApiUrl}${HEYGEN_API_ENDPOINTS.KNOWLEDGE_BASE_LIST}`,
      {
        method: "GET",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );

    if (!response.ok) {
      console.error(
        `HeyGen API error: ${response.status} ${response.statusText}`,
      );

      if (response.status === 401) {
        return createErrorResponse("Invalid API key", 401);
      }

      if (response.status === 404) {
        return createErrorResponse("Endpoint not found", 404);
      }

      return createErrorResponse(ERROR_MESSAGES.FETCH_PROMPTS_FAILED, response.status);
    }

    const data: HeyGenListAPIResponse = await response.json();

    // Transform knowledge bases to prompts for frontend
    const prompts = (data.data?.list || []).map(
      transformKnowledgeBaseToPrompt,
    );

    const responseData: PromptsListResponse = { prompts };
    return createSuccessResponse(responseData);
  } catch (error) {
    console.error("Error fetching prompts from HeyGen:", error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return createErrorResponse(ERROR_MESSAGES.NETWORK_ERROR, 503);
    }

    return createErrorResponse("Internal server error", 500);
  }
}