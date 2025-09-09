import type {
  Prompt,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!HEYGEN_API_KEY) {
      console.error("HEYGEN_API_KEY is missing from environment variables");

      return createErrorResponse(ERROR_MESSAGES.API_CONFIG_ERROR, 500);
    }

    const { id } = await params;

    if (!id || id.trim().length === 0) {
      return createErrorResponse("Prompt ID is required", 400);
    }

    const body = await request.json();
    
    // DEBUG: Log request for production content issue
    console.log('=== PRODUCTION CONTENT DEBUG ===');
    console.log('Body keys:', Object.keys(body));
    console.log('Name length:', body.name?.length || 0);
    console.log('OpeningLine length:', body.openingLine?.length || 0);
    console.log('CustomPrompt length:', body.customPrompt?.length || 0);

    // Validate prompt data if provided
    const validationErrors = validatePromptData({
      name: body.name,
      openingLine: body.openingLine,
      customPrompt: body.customPrompt,
    });
    
    console.log('Validation errors:', validationErrors);

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
      return createErrorResponse(ERROR_MESSAGES.NO_VALID_FIELDS, 400);
    }

    const baseApiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com";

    // Update the prompt via HeyGen API
    const updateResponse = await fetch(
      `${baseApiUrl}${HEYGEN_API_ENDPOINTS.KNOWLEDGE_BASE_UPDATE}/${id}`,
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateRequest),
      },
    );

    if (!updateResponse.ok) {
      console.error(
        `API Update error: ${updateResponse.status} ${updateResponse.statusText}`,
      );

      if (updateResponse.status === 400) {
        return createErrorResponse(ERROR_MESSAGES.INVALID_PROMPT_DATA, 400);
      }

      if (updateResponse.status === 401) {
        return createErrorResponse(ERROR_MESSAGES.INVALID_API_KEY, 401);
      }

      if (updateResponse.status === 404) {
        return createErrorResponse(ERROR_MESSAGES.PROMPT_NOT_FOUND, 404);
      }

      return createErrorResponse(
        ERROR_MESSAGES.UPDATE_PROMPT_FAILED,
        updateResponse.status,
      );
    }

    let updateData: HeyGenUpdateAPIResponse;

    try {
      updateData = await updateResponse.json();
    } catch (parseError) {
      console.error("Failed to parse API response as JSON:", parseError);

      return createErrorResponse("Invalid response format from service", 502);
    }

    // Validate API response structure
    if (!updateData?.data) {
      console.error("Invalid API response structure:", updateData);

      return createErrorResponse("Invalid response from service", 500);
    }

    // Log successful update for debugging
    console.log("Prompt updated successfully:", {
      id: updateData.data.id,
      name: updateData.data.name,
    });

    // Transform the knowledge base to prompt format
    let updatedPrompt: Prompt;

    try {
      updatedPrompt = transformKnowledgeBaseToPrompt(updateData.data);
    } catch (transformError) {
      console.error("Failed to transform API response:", transformError);

      return createErrorResponse("Invalid data format from service", 502);
    }

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
      return createErrorResponse(ERROR_MESSAGES.INVALID_JSON, 400);
    }

    return createErrorResponse(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
}
