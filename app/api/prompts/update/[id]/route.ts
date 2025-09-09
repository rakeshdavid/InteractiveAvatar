import type {
  UpdatePromptRequest,
  HeyGenUpdateAPIResponse,
  PromptUpdateResponse,
} from "@/app/types/prompt";

import {
  transformPromptToUpdateRequest,
  transformKnowledgeBaseToPrompt,
  validatePromptData,
  hasUpdates,
  createErrorResponse,
  createSuccessResponse,
} from "@/app/lib/prompt-utils";
import { ERROR_MESSAGES } from "@/app/lib/error-messages";
import { HEYGEN_API_ENDPOINTS } from "@/app/lib/constants";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!HEYGEN_API_KEY) {
      console.error("HEYGEN_API_KEY is missing from environment variables");
      return createErrorResponse("API configuration error", 500);
    }

    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return createErrorResponse("Prompt ID is required", 400);
    }

    const body = await request.json();

    // Validate prompt data if provided
    const validationErrors = validatePromptData({
      name: body.name,
      openingLine: body.openingLine,
      customPrompt: body.customPrompt,
    });

    if (validationErrors.length > 0) {
      return createErrorResponse(
        `Validation errors: ${validationErrors.join(", ")}`,
        400,
      );
    }

    // Transform UI format to API format
    const updateRequest: UpdatePromptRequest = transformPromptToUpdateRequest({
      name: body.name,
      openingLine: body.openingLine,
      customPrompt: body.customPrompt,
    });

    // Check if there are any updates to make
    if (!hasUpdates(updateRequest)) {
      return createErrorResponse("No valid fields provided for update", 400);
    }

    const baseApiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

    // Update the prompt via HeyGen API
    const updateResponse = await fetch(
      `${baseApiUrl}${HEYGEN_API_ENDPOINTS.KNOWLEDGE_BASE_UPDATE}/${id}`,
      {
        method: "PUT",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateRequest),
      },
    );

    if (!updateResponse.ok) {
      console.error(
        `HeyGen Update API error: ${updateResponse.status} ${updateResponse.statusText}`,
      );

      if (updateResponse.status === 400) {
        return createErrorResponse("Invalid prompt data provided", 400);
      }

      if (updateResponse.status === 401) {
        return createErrorResponse("Invalid API key", 401);
      }

      if (updateResponse.status === 404) {
        return createErrorResponse("Prompt not found", 404);
      }

      return createErrorResponse(
        "Failed to update prompt",
        updateResponse.status,
      );
    }

    const updateData: HeyGenUpdateAPIResponse = await updateResponse.json();

    // Transform the knowledge base to prompt format - add missing id field
    const kbData = {
      ...updateData.data,
      id: updateData.data.knowledge_base_id
    };
    const updatedPrompt = transformKnowledgeBaseToPrompt(kbData);

    const responseData: PromptUpdateResponse = { prompt: updatedPrompt };
    return createSuccessResponse(responseData);

  } catch (error) {
    console.error("Error updating prompt:", error);

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