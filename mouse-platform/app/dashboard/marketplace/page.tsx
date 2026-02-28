"use client";

import { useState, useMemo } from "react";
import { aiEmployees } from "@/lib/platform-data";
import {
  Search,
  Star,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  Zap,
  Users,
  Briefcase,
  Code,
  HeadphonesIcon,
  Calculator,
  Megaphone,
  UserCog,
  Filter,
  ChevronDown,
} from "lucide-react";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  category: string;
  description: string;
  skills: string[];
  pricePerMonth: number;
  rating: number;
  tasksCompleted: number;
  avatar: string;
  color: string;
  available: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Sales: <Briefcase className="w-4 h-4" />,
  Support: <HeadphonesIcon className="w-4 h-4" />,
  Development: <Code className="w-4 h-4" />,
  Operations: <Zap className="w-4 h-4" />,
  Finance: <Calculator className="w-4 h-4" />,
  "Human Resources": <Users className="w-4 h-4" />,
  Marketing: <Megaphone className="w-4 h-4" />,
  Administration: <UserCog className="w-4 h-4" />,
};

const categories = [
  "All",
  "Sales",
  "Support",
  "Development",
  "Operations",
  "Finance",
  "Human Resources",
  "Marketing",
  "Administration",
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [showHireModal, setShowHireModal] = useState<AIEmployee | null>(null);

  const filteredEmployees = useMemo(() => {
    return aiEmployees.filter((emp) => {
      const matchesSearch =
        !searchQuery ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.skills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === "All" || emp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleCart = (empId: string) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  const cartTotal = useMemo(() => {
    return aiEmployees
      .filter((e) => cart.has(e.id))
      .reduce((sum, e) => sum + e.pricePerMonth, 0);
  }, [cart]);

  const formatPrice = (price: number) => `$${price.toLocaleString()}/mo`;

  const formatTasks = (tasks: number) => {
    if (tasks >= 1000) return `${(tasks / 1000).toFixed(1)}k`;
    return tasks.toString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-mouse-navy">AI Employee Marketplace</h1>
          <p className="text-sm text-mouse-slate mt-1">
            Hire specialized AI employees for your business
          </p>
        </div>
        {cart.size > 0 && (
          <div className="flex items-center gap-3 bg-mouse-teal/10 px-4 py-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-mouse-teal" />
            <span className="text-sm font-medium text-mouse-charcoal">
              {cart.size} in cart
            </span>
            <span className="text-sm font-bold text-mouse-teal">
              ${cartTotal.toLocaleString()}/mo
            </span>
            <button className="ml-2 px-3 py-1 bg-mouse-teal text-white text-sm rounded-md hover:bg-mouse-teal/90 transition-colors">
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-mouse-slate/20 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mouse-slate" />
            <input
              type="text"
              placeholder="Search AI employees by name, role, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-mouse-offwhite border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-mouse-teal text-white"
                    : "bg-mouse-offwhite text-mouse-charcoal hover:bg-mouse-slate/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
          <p className="text-xs text-mouse-slate font-medium uppercase">
            Available
          </p>
          <p className="text-xl font-bold text-mouse-charcoal mt-1">
            {aiEmployees.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
          <p className="text-xs text-mouse-slate font-medium uppercase">
            In Cart
          </p>
          <p className="text-xl font-bold text-mouse-teal mt-1">{cart.size}</p>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
          <p className="text-xs text-mouse-slate font-medium uppercase">
            Total Tasks
          </p>
          <p className="text-xl font-bold text-mouse-green mt-1">
            {formatTasks(
              aiEmployees.reduce((sum, e) => sum + e.tasksCompleted, 0)
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-mouse-slate/20 p-4">
          <p className="text-xs text-mouse-slate font-medium uppercase">
            Avg Rating
          </p>
          <p className="text-xl font-bold text-mouse-orange mt-1">
            {(
              aiEmployees.reduce((sum, e) => sum + e.rating, 0) /
              aiEmployees.length
            ).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-xl border border-mouse-slate/20 p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl ${emp.color} flex items-center justify-center text-white text-xl font-bold`}
                >
                  {emp.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-mouse-charcoal">{emp.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-mouse-slate">{emp.role}</span>
                    {emp.available && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-mouse-charcoal">
                  ${emp.pricePerMonth.toLocaleString()}
                </p>
                <p className="text-xs text-mouse-slate">/month</p>
              </div>
            </div>

            {/* Rating & Tasks */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-mouse-charcoal">
                  {emp.rating}
                </span>
              </div>
              <div className="flex items-center gap-1 text-mouse-slate">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">
                  {formatTasks(emp.tasksCompleted)} tasks
                </span>
              </div>
              <div className="flex items-center gap-1 text-mouse-slate">
                {categoryIcons[emp.category]}
                <span className="text-sm">{emp.category}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-mouse-slate mb-4 line-clamp-2">
              {emp.description}
            </p>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-xs font-medium text-mouse-charcoal mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {emp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-mouse-offwhite text-mouse-slate text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-mouse-slate/10">
              <button
                onClick={() => setShowHireModal(emp)}
                className="flex-1 px-3 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Hire Now
              </button>
              <button
                onClick={() => toggleCart(emp.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  cart.has(emp.id)
                    ? "bg-mouse-green text-white"
                    : "bg-mouse-offwhite text-mouse-charcoal hover:bg-mouse-slate/20"
                }`}
              >
                {cart.has(emp.id) ? "Added" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-mouse-slate mx-auto mb-4" />
          <h3 className="text-lg font-medium text-mouse-charcoal mb-2">
            No employees found
          </h3>
          <p className="text-sm text-mouse-slate">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-16 h-16 rounded-xl ${showHireModal.color} flex items-center justify-center text-white text-2xl font-bold`}
              >
                {showHireModal.avatar}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-mouse-charcoal">
                  Hire {showHireModal.name}
                </h3>
                <p className="text-sm text-mouse-slate">{showHireModal.role}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1">
                  Assign to Customer
                </label>
                <select className="w-full px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm focus:outline-none focus:border-mouse-teal">
                  <option>Select customer...</option>
                  <option>Redwood Construction Co.</option>
                  <option>Pacific Coast Realty Group</option>
                  <option>Summit Healthcare Partners</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-mouse-charcoal mb-1">
                  Deployment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 border-2 border-mouse-teal bg-mouse-teal/5 text-mouse-teal rounded-lg text-sm font-medium">
                    Full-Time
                  </button>
                  <button className="px-3 py-2 border border-mouse-slate/20 rounded-lg text-sm text-mouse-charcoal hover:bg-mouse-offwhite">
                    Part-Time
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-mouse-offwhite rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-mouse-slate">Monthly Cost</span>
                <span className="text-lg font-bold text-mouse-charcoal">
                  ${showHireModal.pricePerMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-mouse-slate">
                <span>Billed monthly</span>
                <span>Cancel anytime</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowHireModal(null)}
                className="px-4 py-2 text-sm text-mouse-slate hover:text-mouse-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowHireModal(null)}
                className="px-4 py-2 bg-mouse-teal text-white rounded-lg text-sm font-medium hover:bg-mouse-teal/90 transition-colors"
              >
                Confirm Hire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
