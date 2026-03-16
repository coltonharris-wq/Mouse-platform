'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

interface Step {
  /** CSS selector used with document.querySelector to find the target element */
  selector: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    selector: '[data-onboarding="sidebar-header"]',
    title: 'Welcome to Mouse!',
    description:
      "Welcome to your Mouse Reseller Portal! Right now it's empty — by the end of this tour, you'll know exactly how to fill it up.",
  },
  {
    selector: '[data-onboarding="earnings"]',
    title: 'Earnings Metrics',
    description: 'These update in real-time as you close deals.',
  },
  {
    selector: '[data-onboarding="king-mouse"]',
    title: 'King Mouse',
    description:
      'He works for YOU. Find leads, write scripts, listen in on calls.',
  },
  {
    selector: '[data-onboarding="lead-finder"]',
    title: 'Lead Finder',
    description:
      'Scans businesses in your area. Revenue data, gatekeeper intel, sales scripts. This is where your money starts.',
  },
  {
    selector: '[data-onboarding="pipeline"]',
    title: 'Pipeline',
    description:
      'Drag deals across stages. King Mouse auto-follows up on stale deals.',
  },
  {
    selector: '[data-onboarding="invite"]',
    title: 'Invite a Customer',
    description:
      'One-click invite at YOUR price. You earn the markup forever.',
  },
  {
    selector: '[data-onboarding="niches"]',
    title: 'Niche Previews',
    description:
      'On a call with a roofer? Show them their exact dashboard. 150+ niches.',
  },
  {
    selector: '[data-onboarding="commissions"]',
    title: 'Commissions',
    description:
      'You sell, they use, you get paid. Instant Stripe deposits.',
  },
];

const STORAGE_KEY = 'reseller_onboarding_complete';
const SPOTLIGHT_PADDING = 8; // px around the target element
const SPOTLIGHT_RADIUS = 12; // border-radius of the spotlight cutout

/* ------------------------------------------------------------------ */
/*  Tooltip placement helper                                           */
/* ------------------------------------------------------------------ */

type Placement = 'right' | 'left' | 'bottom' | 'top';

interface TooltipPosition {
  top: number;
  left: number;
  placement: Placement;
}

/**
 * Decide where to place the tooltip card relative to the spotlight rect.
 * Prefers right, then bottom, then left, then top — whichever has room.
 */
function computeTooltipPosition(
  rect: DOMRect,
  cardWidth: number,
  cardHeight: number,
): TooltipPosition {
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = SPOTLIGHT_PADDING;

  // Try right
  const rightLeft = rect.right + pad + gap;
  if (rightLeft + cardWidth < vw - 16) {
    return {
      top: clamp(rect.top + rect.height / 2 - cardHeight / 2, 16, vh - cardHeight - 16),
      left: rightLeft,
      placement: 'right',
    };
  }

  // Try bottom
  const bottomTop = rect.bottom + pad + gap;
  if (bottomTop + cardHeight < vh - 16) {
    return {
      top: bottomTop,
      left: clamp(rect.left + rect.width / 2 - cardWidth / 2, 16, vw - cardWidth - 16),
      placement: 'bottom',
    };
  }

  // Try left
  const leftLeft = rect.left - pad - gap - cardWidth;
  if (leftLeft > 16) {
    return {
      top: clamp(rect.top + rect.height / 2 - cardHeight / 2, 16, vh - cardHeight - 16),
      left: leftLeft,
      placement: 'left',
    };
  }

  // Fallback: top
  const topTop = rect.top - pad - gap - cardHeight;
  return {
    top: Math.max(topTop, 16),
    left: clamp(rect.left + rect.width / 2 - cardWidth / 2, 16, vw - cardWidth - 16),
    placement: 'top',
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ResellerOnboardingWizard() {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  // ---- Estimated card dimensions (used before the ref is available) ----
  const CARD_W = 340;
  const CARD_H = 220;

  /* ------ mount: check localStorage, set portal root ------ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setPortalRoot(document.body);

    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    // Small delay so the shell DOM has rendered and data-onboarding attrs exist
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  /* ------ measure target element whenever step changes ------ */
  const measureTarget = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.selector);
    if (!el) {
      // Element not found — still show the card centred
      setTargetRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - CARD_H / 2,
        left: window.innerWidth / 2 - CARD_W / 2,
        placement: 'bottom',
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    const cw = cardRef.current?.offsetWidth ?? CARD_W;
    const ch = cardRef.current?.offsetHeight ?? CARD_H;
    setTooltipPos(computeTooltipPosition(rect, cw, ch));
  }, [currentStep, CARD_W, CARD_H]);

  useEffect(() => {
    if (!visible) return;
    measureTarget();

    // Re-measure on resize / scroll so the spotlight tracks the element
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [visible, measureTarget]);

  /* ------ keyboard: Escape to skip, arrows to navigate ------ */
  useEffect(() => {
    if (!visible) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') completeOnboarding();
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      if (e.key === 'ArrowLeft') goBack();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, currentStep]);

  /* ------ actions ------ */
  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeOnboarding();
    }
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  function completeOnboarding() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  /* ------ render ------ */
  if (!visible || !portalRoot) return null;

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;

  const overlay = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
      }}
      aria-label="Onboarding overlay"
    >
      {/* Dark overlay with spotlight cutout */}
      {targetRect ? (
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          pointerEvents="none"
        >
          <defs>
            <mask id="onboarding-mask">
              {/* White = visible overlay, black = transparent cutout */}
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={targetRect!.left - SPOTLIGHT_PADDING}
                y={targetRect!.top - SPOTLIGHT_PADDING}
                width={targetRect!.width + SPOTLIGHT_PADDING * 2}
                height={targetRect!.height + SPOTLIGHT_PADDING * 2}
                rx={SPOTLIGHT_RADIUS}
                ry={SPOTLIGHT_RADIUS}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.60)"
            mask="url(#onboarding-mask)"
          />
        </svg>
      ) : (
        /* No target found — simple full overlay */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.60)',
          }}
        />
      )}

      {/* Transparent click-blocker over the whole viewport so users can't interact */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Spotlight border ring — visual emphasis */}
      {targetRect && (
        <div
          style={{
            position: 'absolute',
            top: targetRect.top - SPOTLIGHT_PADDING,
            left: targetRect.left - SPOTLIGHT_PADDING,
            width: targetRect.width + SPOTLIGHT_PADDING * 2,
            height: targetRect.height + SPOTLIGHT_PADDING * 2,
            borderRadius: SPOTLIGHT_RADIUS,
            border: '2px solid rgba(240,112,32,0.5)',
            boxShadow: '0 0 0 4px rgba(240,112,32,0.15)',
            pointerEvents: 'none',
            transition: 'all 300ms ease',
          }}
        />
      )}

      {/* Tooltip card */}
      {tooltipPos && (
        <div
          ref={cardRef}
          style={{
            position: 'absolute',
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: CARD_W,
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#ffffff',
            borderRadius: 16,
            boxShadow:
              '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
            padding: 24,
            zIndex: 100000,
            transition: 'top 300ms ease, left 300ms ease',
          }}
        >
          {/* Step indicator */}
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#F07020',
              marginBottom: 4,
              letterSpacing: '0.025em',
            }}
          >
            Step {currentStep + 1} of {STEPS.length}
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 3,
              borderRadius: 2,
              backgroundColor: '#e5e7eb',
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                height: '100%',
                borderRadius: 2,
                backgroundColor: '#F07020',
                transition: 'width 300ms ease',
              }}
            />
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1e2a3a',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {step.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: '#4b5563',
              marginBottom: 24,
            }}
          >
            {step.description}
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Left: Skip */}
            <button
              onClick={completeOnboarding}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: 13,
                cursor: 'pointer',
                padding: '4px 0',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af';
              }}
            >
              Skip Tour
            </button>

            {/* Right: Back + Next */}
            <div style={{ display: 'flex', gap: 8 }}>
              {!isFirst && (
                <button
                  onClick={goBack}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      '#ffffff';
                  }}
                >
                  Back
                </button>
              )}
              <button
                onClick={goNext}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#F07020',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    '#d9621a';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    '#F07020';
                }}
              >
                {isLast ? 'Get Started!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(overlay, portalRoot);
}

