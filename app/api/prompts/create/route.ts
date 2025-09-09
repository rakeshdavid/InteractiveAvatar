import type {
  CreatePromptRequest,
  HeyGenCreateAPIResponse,
  HeyGenListAPIResponse,
  PromptCreateResponse,
} from "@/app/types/prompt";
import {
  transformPromptToCreateRequest,
  transformKnowledgeBaseToPrompt,
  validatePromptData,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/prompt-utils";
import { ERROR_MESSAGES } from "@/app/lib/error-messages";
import { HEYGEN_API_ENDPOINTS } from "@/app/lib/constants";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(request: Request) {
  try {
    if (!HEYGEN_API_KEY) {
      console.error("HEYGEN_API_KEY is missing from environment variables");
      return createErrorResponse("API configuration error", 500);
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return createErrorResponse("Prompt name is required", 400);
    }

    // Validate prompt data
    const validationErrors = validatePromptData({
      name: body.name,
      openingLine: body.openingLine,
      customPrompt: body.customPrompt,
    });

    if (validationErrors.length > 0) {
      return createErrorResponse(`Validation errors: ${validationErrors.join(", ")}`, 400);
    }

    // Transform UI format to API format
    const createRequest: CreatePromptRequest = transformPromptToCreateRequest({
      name: body.name,
      openingLine: body.openingLine,
      customPrompt: body.customPrompt,
    });

    const baseApiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

    // Create the prompt via HeyGen API
    const createResponse = await fetch(
      `${baseApiUrl}${HEYGEN_API_ENDPOINTS.KNOWLEDGE_BASE_CREATE}`,
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createRequest),
      },
    );

    if (!createResponse.ok) {
      console.error(
        `HeyGen Create API error: ${createResponse.status} ${createResponse.statusText}`,
      );

      if (createResponse.status === 400) {
        return createErrorResponse("Invalid prompt data provided", 400);
      }

      if (createResponse.status === 401) {
        return createErrorResponse("Invalid API key", 401);
      }

      return createErrorResponse("Failed to create prompt", createResponse.status);
    }

    // HeyGen create API returns empty object, so we need to fetch the updated list
    // to get the newly created prompt data
    const listResponse = await fetch(
      `${baseApiUrl}${HEYGEN_API_ENDPOINTS.KNOWLEDGE_BASE_LIST}`,
      {
        method: "GET",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );

    if (!listResponse.ok) {
      console.error(
        `HeyGen List API error after create: ${listResponse.status} ${listResponse.statusText}`,
      );
      // Return success but without the created prompt data
      return createSuccessResponse(
        { message: "Prompt created successfully, but unable to retrieve details" },
        201,
      );
    }

    const listData: HeyGenListAPIResponse = await listResponse.json();
    const knowledgeBases = listData.data?.list || [];

    // Find the newly created prompt by matching the name
    // Since HeyGen doesn't return the ID, we'll get the most recent one with matching name
    const newKnowledgeBase = knowledgeBases
      .filter((kb) => kb.name === body.name)
      .pop(); // Get the last one (most recently created)

    if (!newKnowledgeBase) {
      console.warn("Created prompt but couldn't find it in the list response");
      return createSuccessResponse(
        { message: "Prompt created successfully, but unable to retrieve details" },
        201,
      );
    }

    // Transform the knowledge base to prompt format
    const createdPrompt = transformKnowledgeBaseToPrompt(newKnowledgeBase);

    const responseData: PromptCreateResponse = { prompt: createdPrompt };
    return createSuccessResponse(responseData, 201);
  } catch (error) {
    console.error("Error creating prompt:", error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return createErrorResponse(ERROR_MESSAGES.NETWORK_ERROR, 503);
    }

    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid JSON in request body", 400);
    }

    return createErrorResponse("Internal server error", 500);
  }
}