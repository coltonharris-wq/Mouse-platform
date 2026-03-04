// Tier System Middleware
// Enforces tier limits at the API level

import { NextRequest, NextResponse } from 'next/server';
import { getTierManager, FEATURE_KEYS } from '@/lib/tier-system';

interface TierMiddlewareOptions {
  // Required tier for this route
  requiredTier?: 'free' | 'pro' | 'enterprise';
  
  // Specific features required
  requiredFeatures?: string[];
  
  // Whether to check message limits
  checkMessageLimit?: boolean;
  
  // Whether to check pro usage limits
  checkProUsage?: boolean;
  
  // Custom error message
  errorMessage?: string;
}

/**
 * Create middleware that enforces tier restrictions
 */
export function createTierMiddleware(options: TierMiddlewareOptions) {
  const tierManager = getTierManager();
  
  return async function tierMiddleware(
    request: NextRequest,
    customerId: string
  ): Promise<{ allowed: boolean; response?: NextResponse }> {
    try {
      const status = await tierManager.getCustomerTierStatus(customerId);
      
      if (!status) {
        return {
          allowed: false,
          response: NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          ),
        };
      }

      // Check minimum tier requirement
      if (options.requiredTier) {
        const tierHierarchy = { free: 0, pro: 1, enterprise: 2 };
        const requiredLevel = tierHierarchy[options.requiredTier];
        const currentLevel = tierHierarchy[status.tier];
        
        if (currentLevel < requiredLevel) {
          return {
            allowed: false,
            response: NextResponse.json(
              {
                error: options.errorMessage || `This feature requires ${options.requiredTier} tier or higher`,
                upgradeRequired: true,
                currentTier: status.tier,
                requiredTier: options.requiredTier,
              },
              { status: 403 }
            ),
          };
        }
      }

      // Check required features
      if (options.requiredFeatures && options.requiredFeatures.length > 0) {
        for (const featureKey of options.requiredFeatures) {
          const feature = status.features.find(f => f.featureKey === featureKey);
          if (!feature || !feature.isEnabled) {
            return {
              allowed: false,
              response: NextResponse.json(
                {
                  error: `Feature '${featureKey}' is not available on your tier`,
                  upgradeRequired: true,
                  missingFeature: featureKey,
                },
                { status: 403 }
              ),
            };
          }
        }
      }

      // Check message limits
      if (options.checkMessageLimit && status.tier === 'free') {
        const checkResult = await tierManager.checkMessageAllowed(customerId);
        if (!checkResult.allowed) {
          return {
            allowed: false,
            response: NextResponse.json(
              {
                error: checkResult.reason,
                upgradeRequired: true,
                upgradePrompt: checkResult.upgradePrompt,
              },
              { status: 403 }
            ),
          };
        }
      }

      // Check pro usage limits
      if (options.checkProUsage && status.tier === 'free') {
        const proUsageTotal = status.proUsage?.totalUsd || 0;
        const maxProUsage = 5.00; // $2 base + $3 grace
        
        if (proUsageTotal >= maxProUsage) {
          return {
            allowed: false,
            response: NextResponse.json(
              {
                error: 'Pro usage limit exceeded. Please upgrade to continue.',
                upgradeRequired: true,
                currentUsage: proUsageTotal,
                limit: maxProUsage,
              },
              { status: 403 }
            ),
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Tier middleware error:', error);
      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Failed to verify tier permissions' },
          { status: 500 }
        ),
      };
    }
  };
}

/**
 * Middleware factory for common use cases
 */
export const tierMiddleware = {
  // Free tier only - basic chat
  freeOnly: createTierMiddleware({
    requiredTier: 'free',
  }),
  
  // Pro features - requires pro or higher
  proOnly: createTierMiddleware({
    requiredTier: 'pro',
    errorMessage: 'This feature requires a Pro subscription',
  }),
  
  // Enterprise features
  enterpriseOnly: createTierMiddleware({
    requiredTier: 'enterprise',
    errorMessage: 'This feature requires an Enterprise subscription',
  }),
  
  // Chat endpoint - checks message limits for free tier
  chat: createTierMiddleware({
    checkMessageLimit: true,
  }),
  
  // Calls - requires pro feature
  calls: createTierMiddleware({
    requiredFeatures: [FEATURE_KEYS.CALLS],
    checkProUsage: true,
  }),
  
  // Advanced integrations
  advancedIntegrations: createTierMiddleware({
    requiredFeatures: [FEATURE_KEYS.ADVANCED_INTEGRATIONS],
    checkProUsage: true,
  }),
  
  // API access
  apiAccess: createTierMiddleware({
    requiredFeatures: [FEATURE_KEYS.API_ACCESS],
  }),
  
  // Full API (enterprise)
  fullApiAccess: createTierMiddleware({
    requiredTier: 'enterprise',
    requiredFeatures: [FEATURE_KEYS.FULL_API_ACCESS],
  }),
  
  // Multiple employees (pro+)
  multipleEmployees: createTierMiddleware({
    requiredFeatures: [FEATURE_KEYS.MULTIPLE_EMPLOYEES],
  }),
  
  // Unlimited employees (enterprise)
  unlimitedEmployees: createTierMiddleware({
    requiredTier: 'enterprise',
    requiredFeatures: [FEATURE_KEYS.UNLIMITED_EMPLOYEES],
  }),
};

/**
 * Helper to extract customer ID from request
 * Looks in: headers, query params, body
 */
export async function extractCustomerId(request: NextRequest): Promise<string | null> {
  // Check headers first
  const customerIdHeader = request.headers.get('x-customer-id');
  if (customerIdHeader) return customerIdHeader;

  // Check query params
  const { searchParams } = new URL(request.url);
  const customerIdParam = searchParams.get('customerId');
  if (customerIdParam) return customerIdParam;

  // Check body for POST requests
  if (request.method === 'POST') {
    try {
      const body = await request.clone().json();
      if (body.customerId) return body.customerId;
    } catch {
      // Body might not be JSON
    }
  }

  return null;
}

/**
 * Higher-order function to wrap API handlers with tier checks
 */
export function withTierCheck(
  handler: (request: NextRequest) => Promise<NextResponse>,
  middlewareOptions: TierMiddlewareOptions
) {
  const middleware = createTierMiddleware(middlewareOptions);
  
  return async function(request: NextRequest): Promise<NextResponse> {
    const customerId = await extractCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    const { allowed, response } = await middleware(request, customerId);
    
    if (!allowed) {
      return response!;
    }

    return handler(request);
  };
}

/**
 * Record usage from middleware
 */
export async function recordMiddlewareUsage(
  customerId: string,
  employeeId: string | null,
  usageType: 'message' | 'call' | 'integration' | 'api' | 'advanced_feature',
  costUsd: number = 0
): Promise<void> {
  const tierManager = getTierManager();
  
  if (usageType === 'message') {
    const status = await tierManager.getCustomerTierStatus(customerId);
    if (status) {
      await tierManager.recordMessageUsage(
        customerId,
        employeeId,
        status.llmProvider as any,
        status.llmProvider !== 'ollama',
        costUsd
      );
    }
  } else {
    await tierManager.recordProUsage(
      customerId,
      employeeId,
      usageType,
      costUsd
    );
  }
}
