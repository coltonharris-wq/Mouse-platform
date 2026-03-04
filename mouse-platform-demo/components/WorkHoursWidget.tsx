"use client";

import { useState } from "react";
import { Clock, AlertTriangle, TrendingUp, Minus, Plus, X, CreditCard, Check, DollarSign } from "lucide-react";
import { useWorkHours } from "@/app/context/WorkHoursContext";

// Purchase options at $4.98/hour
const pricingTiers = [
  { hours: 10, price: 49.80, perHour: 4.98, popular: false },
  { hours: 20, price: 99.60, perHour: 4.98, popular: false },
  { hours: 50, price: 249.00, perHour: 4.98, popular: true },
  { hours: 100, price: 498.00, perHour: 4.98, popular: false },
];

interface WorkHoursWidgetProps {
  compact?: boolean;
}

export default function WorkHoursWidget({ compact = false }: WorkHoursWidgetProps) {
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedTier, setSelectedTier] = useState(pricingTiers[2]);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const { 
    balance, 
    totalUsed, 
    totalPurchased,
    purchaseHours,
    getHourlyRate,
    getHumanHourlyRate,
    getSavingsPercent,
    isLowBalance,
  } = useWorkHours();

  const usagePercent = totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0;
  const hourlyRate = getHourlyRate();
  const humanRate = getHumanHourlyRate();
  const savingsPercent = getSavingsPercent();

  const handlePurchase = () => {
    setShowPurchase(true);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    const totalHours = selectedTier.hours * quantity;
    const totalPrice = selectedTier.price * quantity;
    
    // Simulate Stripe checkout
    setTimeout(() => {
      setPurchaseComplete(true);
      purchaseHours(totalHours, totalPrice);
      setTimeout(() => {
        setShowPurchase(false);
        setShowCheckout(false);
        setPurchaseComplete(false);
        setQuantity(1);
      }, 2000);
    }, 1500);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mouse-teal/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-mouse-teal" />
            </div>
            <div>
              <p className="text-xs text-mouse-slate">Work Hours</p>
              <p className="text-xl font-bold text-mouse-charcoal">{balance.toFixed(1)} hrs</p>
            </div>
          </div>
          <button
            onClick={handlePurchase}
            className="px-3 py-1.5 bg-mouse-navy text-white text-xs font-medium rounded-lg hover:bg-mouse-teal transition-colors"
          >
            Buy More
          </button>
        </div>
      </div>
    );
  }

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
              <p className="text-xs text-mouse-slate">${hourlyRate}/hour</p>
            </div>
          </div>
          {isLowBalance() ? (
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
            <p className="text-2xl font-bold text-mouse-charcoal">{balance.toFixed(1)}</p>
            <p className="text-xs text-mouse-slate mt-0.5">Current</p>
          </div>
          <div className="text-center p-3 bg-mouse-offwhite rounded-lg">
            <p className="text-2xl font-bold text-mouse-teal">{totalUsed.toFixed(1)}</p>
            <p className="text-xs text-mouse-slate mt-0.5">Used</p>
          </div>
          <div className="text-center p-3 bg-mouse-offwhite rounded-lg">
            <p className={`text-2xl font-bold ${balance < 10 ? "text-mouse-orange" : "text-mouse-green"}`}>
              {(totalPurchased - totalUsed).toFixed(1)}
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

        {/* Savings indicator */}
        <div className="flex items-center gap-2 p-2 bg-mouse-teal/5 rounded-lg mb-4">
          <DollarSign className="w-4 h-4 text-mouse-teal" />
          <span className="text-xs text-mouse-charcoal">
            Save <span className="font-bold text-mouse-green">{savingsPercent}%</span> vs ${humanRate}/hr human
          </span>
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
                    <p className="text-xs text-mouse-slate">Fixed rate: $4.98/hour</p>
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
                          <p className="text-xl font-bold text-mouse-teal">${tier.price.toFixed(2)}</p>
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
                    <div>
                      <span className="text-mouse-slate">Total</span>
                      <p className="text-xs text-mouse-slate">
                        {selectedTier.hours * quantity} hours at $4.98/hr
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-mouse-charcoal">
                      ${(selectedTier.price * quantity).toFixed(2)}
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
                <p className="text-mouse-slate text-sm">Connecting to Stripe...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
