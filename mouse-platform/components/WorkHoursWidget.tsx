"use client";

import { useState } from "react";
import { Clock, AlertTriangle, Shield, Zap, TrendingUp, Minus, Plus, X, CreditCard, Check } from "lucide-react";

interface WorkHoursData {
  currentBalance: number;
  usedThisMonth: number;
  remaining: number;
  planLimit: number;
  planName: string;
}

const pricingTiers = [
  { hours: 20, price: 97, perHour: 4.85, popular: false },
  { hours: 70, price: 297, perHour: 4.24, popular: true },
  { hours: 125, price: 497, perHour: 3.98, popular: false },
];

interface WorkHoursWidgetProps {
  data?: WorkHoursData;
}

export default function WorkHoursWidget({ data }: WorkHoursWidgetProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedTier, setSelectedTier] = useState(pricingTiers[1]);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const workHours = data || {
    currentBalance: 47.5,
    usedThisMonth: 22.5,
    remaining: 25,
    planLimit: 70,
    planName: "Growth Plan",
  };

  const usagePercent = (workHours.usedThisMonth / workHours.planLimit) * 100;

  const handlePurchase = () => {
    setShowPurchase(true);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setTimeout(() => {
      setPurchaseComplete(true);
      setTimeout(() => {
        setShowPurchase(false);
        setShowCheckout(false);
        setPurchaseComplete(false);
        setQuantity(1);
      }, 2000);
    }, 1500);
  };

  return (
    <>
      {/* Main Widget */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-mouse-teal/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-mouse-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-mouse-charcoal">Work Hours</h3>
              <p className="text-xs text-mouse-slate">{workHours.planName}</p>
            </div>
          </div>
          {usagePercent > 80 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-mouse-orange/10 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 text-mouse-orange" />
              <span className="text-xs font-medium text-mouse-orange">Low Balance</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-mouse-green/10 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-mouse-green" />
              <span className="text-xs font-medium text-mouse-green">On Track</span>
            </div>
          )}
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-mouse-offwhite rounded-lg">
            <p className="text-2xl font-bold text-mouse-charcoal">{workHours.currentBalance.toFixed(1)}</p>
            <p className="text-xs text-mouse-slate mt-0.5">Current</p>
          </div>
          <div className="text-center p-3 bg-mouse-offwhite rounded-lg">
            <p className="text-2xl font-bold text-mouse-teal">{workHours.usedThisMonth.toFixed(1)}</p>
            <p className="text-xs text-mouse-slate mt-0.5">Used</p>
          </div>
          <div className="text-center p-3 bg-mouse-offwhite rounded-lg">
            <p className={`text-2xl font-bold ${workHours.remaining < 10 ? "text-mouse-orange" : "text-mouse-green"}`}>
              {workHours.remaining.toFixed(1)}
            </p>
            <p className="text-xs text-mouse-slate mt-0.5">Remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-mouse-slate mb-1.5">
            <span>Monthly Usage</span>
            <span>{usagePercent.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-mouse-slate/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent > 90 ? "bg-mouse-red" : usagePercent > 70 ? "bg-mouse-orange" : "bg-mouse-teal"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Usage History Mini */}
        <div className="flex items-center gap-2 text-xs text-mouse-slate mb-4">
          <div className="flex-1 h-8 flex items-end gap-1">
            {[40, 65, 45, 80, 55, 70, 32].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-mouse-teal/30 rounded-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <span className="text-xs">Last 7 days</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePurchase}
          className="w-full py-2.5 bg-mouse-navy text-white text-sm font-medium rounded-lg hover:bg-mouse-teal transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Purchase More Hours
        </button>
      </div>

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {!showCheckout ? (
              <>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-mouse-slate/20 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-mouse-charcoal">Purchase Work Hours</h3>
                    <p className="text-xs text-mouse-slate">Add hours to your account</p>
                  </div>
                  <button
                    onClick={() => setShowPurchase(false)}
                    className="text-mouse-slate hover:text-mouse-charcoal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Pricing Tiers */}
                <div className="p-6 space-y-3">
                  {pricingTiers.map((tier) => (
                    <button
                      key={tier.hours}
                      onClick={() => setSelectedTier(tier)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                        selectedTier.hours === tier.hours
                          ? "border-mouse-teal bg-mouse-teal/5"
                          : "border-mouse-slate/20 hover:border-mouse-teal/50"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2 left-4 px-2 py-0.5 bg-mouse-orange text-white text-xs font-medium rounded">
                          Best Value
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-mouse-charcoal">{tier.hours} Hours</p>
                          <p className="text-xs text-mouse-slate">${tier.perHour.toFixed(2)}/hour</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-mouse-teal">${tier.price}</p>
                        </div>
                      </div>
                      {selectedTier.hours === tier.hours && (
                        <div className="absolute top-4 right-4 w-5 h-5 bg-mouse-teal rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className="px-6 pb-4">
                  <p className="text-sm font-medium text-mouse-charcoal mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-mouse-slate/20 flex items-center justify-center hover:bg-mouse-offwhite"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-mouse-charcoal">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border border-mouse-slate/20 flex items-center justify-center hover:bg-mouse-offwhite"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Total & Checkout */}
                <div className="px-6 py-4 bg-mouse-offwhite border-t border-mouse-slate/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-mouse-slate">Total</span>
                    <span className="text-2xl font-bold text-mouse-charcoal">
                      ${(selectedTier.price * quantity).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-mouse-navy text-white font-medium rounded-lg hover:bg-mouse-teal transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Proceed to Checkout
                  </button>
                </div>
              </>
            ) : purchaseComplete ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-mouse-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-mouse-charcoal mb-2">Purchase Complete!</h3>
                <p className="text-mouse-slate">
                  {selectedTier.hours * quantity} hours added to your account
                </p>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-mouse-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-mouse-charcoal mb-2">Processing...</h3>
                <p className="text-mouse-slate text-sm">Securing your purchase</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
