/**
 * ANTI-CLONE GUARDRAILS MIDDLEWARE
 * Next.js API Route Middleware for King Mouse AI
 * 
 * This middleware applies all guardrail layers to incoming API requests
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  applyGuardrails,
  filterOutput,
  checkInfrastructureQuestionLimit,
  logSecurityEvent,
  SYSTEM_PROMPT_GUARD
} from './guardrails';

// Types
export interface GuardrailMiddlewareOptions {
  skipRateLimit?: boolean;
  skipKeywordCheck?: boolean;
  skipPatternCheck?: boolean;
  customResponse?: string;
}

export interface GuardrailContext {
  customerId: string;
  requestId: string;
  riskScore: number;
  guardrailsApplied: boolean;
}

// Constants
const HEADER_PREFIX = 'x-kingmouse-';
const CUSTOMER_ID_HEADER = `${HEADER_PREFIX}customer-id`;
const REQUEST_ID_HEADER = `${HEADER_PREFIX}request-id`;
const GUARDRAIL_STATUS_HEADER = `${HEADER_PREFIX}guardrail-status`;

/**
 * Extract customer ID from request
 * Checks headers, cookies, and JWT token
 */
function extractCustomerId(request: NextRequest): string | null {
  // Check header first
  const headerId = request.headers.get(CUSTOMER_ID_HEADER);
  if (headerId) return headerId;

  // Check cookies
  const cookieId = request.cookies.get('customer_id')?.value;
  if (cookieId) return cookieId;

  // Check auth token (implement your JWT parsing here)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // TODO: Decode JWT and extract customer ID
    // const token = authHeader.substring(7);
    // return decodeJWT(token).sub;
  }

  // Fall back to IP-based tracking (with warning)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Apply guardrails to API request
 */
export async function applyRequestGuardrails(
  request: NextRequest,
  options: GuardrailMiddlewareOptions = {}
): Promise<{ allowed: boolean; response?: NextResponse; context: GuardrailContext }> {
  const requestId = generateRequestId();
  const customerId = extractCustomerId(request);

  if (!customerId) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Customer identification required' },
        { status: 401 }
      ),
      context: {
        customerId: 'unknown',
        requestId,
        riskScore: 0,
        guardrailsApplied: false
      }
    };
  }

  // Only apply to chat/AI endpoints
  const url = new URL(request.url);
  const isAiEndpoint = url.pathname.match(/\/(chat|ai|generate|code|ask)/i);
  
  if (!isAiEndpoint) {
    return {
      allowed: true,
      context: {
        customerId,
        requestId,
        riskScore: 0,
        guardrailsApplied: false
      }
    };
  }

  // Parse request body to get user input
  let userInput = '';
  try {
    const body = await request.json();
    userInput = body.message || body.prompt || body.input || body.code || '';
  } catch {
    // If can't parse body, continue with empty input
    // (guardrails will still apply to the context)
  }

  // Apply guardrails
  const result = applyGuardrails(customerId, userInput, {
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
    requestId
  });

  const context: GuardrailContext = {
    customerId,
    requestId,
    riskScore: result.riskScore,
    guardrailsApplied: true
  };

  if (!result.allowed) {
    // Log the blocked request
    logSecurityEvent(
      customerId,
      'blocked_request',
      result.riskScore > 50 ? 'high' : 'medium',
      {
        input: userInput.substring(0, 500),
        riskScore: result.riskScore,
        requestId
      },
      result.reason
    );

    const response = NextResponse.json(
      {
        error: 'Request blocked by security policy',
        message: result.response || options.customResponse || 'This request cannot be processed.',
        requestId,
        support: 'Contact support@kingmouse.ai if you believe this is an error.'
      },
      { status: 403 }
    );

    // Add guardrail headers
    response.headers.set(GUARDRAIL_STATUS_HEADER, 'blocked');
    response.headers.set(REQUEST_ID_HEADER, requestId);

    return { allowed: false, response, context };
  }

  // Check infrastructure question rate limit separately
  const isInfrastructureQuestion = userInput.match(/\b(docker|kubernetes|k8s|terraform|infrastructure|orchestration|multi-tenant)\b/i);
  if (isInfrastructureQuestion) {
    const infraLimit = checkInfrastructureQuestionLimit(customerId);
    if (!infraLimit.allowed) {
      logSecurityEvent(
        customerId,
        'rate_limit_exceeded',
        'medium',
        { input: userInput.substring(0, 500), requestId },
        'Infrastructure question limit exceeded'
      );

      const response = NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: infraLimit.reason,
          requestId
        },
        { status: 429 }
      );

      response.headers.set(GUARDRAIL_STATUS_HEADER, 'rate_limited');
      response.headers.set(REQUEST_ID_HEADER, requestId);

      return { allowed: false, response, context };
    }
  }

  return { allowed: true, context };
}

/**
 * Apply output filtering to AI response
 */
export function applyOutputFiltering(
  response: string,
  context: GuardrailContext
): string {
  const filterResult = filterOutput(response);
  
  if (filterResult.filtered) {
    logSecurityEvent(
      context.customerId,
      'blocked_request',
      'low',
      {
        requestId: context.requestId,
        patterns: filterResult.redactions
      },
      `Filtered ${filterResult.redactions.length} sensitive patterns from output`
    );
  }

  return filterResult.safeOutput;
}

/**
 * Next.js middleware function
 * Add this to your middleware.ts or middleware.js
 */
export function guardrailMiddleware(
  options: GuardrailMiddlewareOptions = {}
) {
  return async function middleware(request: NextRequest) {
    const { allowed, response, context } = await applyRequestGuardrails(request, options);

    if (!allowed && response) {
      return response;
    }

    // Add context to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(CUSTOMER_ID_HEADER, context.customerId);
    requestHeaders.set(REQUEST_ID_HEADER, context.requestId);
    requestHeaders.set(`${HEADER_PREFIX}risk-score`, context.riskScore.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}

/**
 * Higher-order function to wrap API handlers with guardrails
 */
export function withGuardrails(
  handler: (req: NextRequest, context: GuardrailContext) => Promise<NextResponse>,
  options: GuardrailMiddlewareOptions = {}
) {
  return async function guardedHandler(request: NextRequest): Promise<NextResponse> {
    const { allowed, response, context } = await applyRequestGuardrails(request, options);

    if (!allowed && response) {
      return response;
    }

    // Call the actual handler
    const result = await handler(request, context);

    // Apply output filtering if it's a JSON response with AI content
    const contentType = result.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await result.json();
        if (body.message || body.response || body.content) {
          const field = body.message ? 'message' : body.response ? 'response' : 'content';
          body[field] = applyOutputFiltering(body[field], context);
          
          // Create new response with filtered content
          return NextResponse.json(body, {
            status: result.status,
            headers: result.headers
          });
        }
      } catch {
        // If can't parse/filter, return original response
      }
    }

    return result;
  };
}

/**
 * Get system prompt with guardrail injection
 * Use this when initializing AI conversations
 */
export function getGuardedSystemPrompt(additionalInstructions?: string): string {
  let prompt = SYSTEM_PROMPT_GUARD;
  
  if (additionalInstructions) {
    prompt += `\n\nAdditional Instructions:\n${additionalInstructions}`;
  }

  return prompt;
}

// Export all guardrail utilities
export * from './guardrails';
