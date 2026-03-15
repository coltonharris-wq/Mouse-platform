'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, Search, ExternalLink, Filter } from 'lucide-react';

interface Niche {
  name: string;
  industry: string;
  slug: string;
}

const INDUSTRIES = [
  'All',
  'Restaurant',
  'Home Services',
  'Health',
  'Auto',
  'Legal',
  'Fitness',
  'Beauty',
  'Other',
] as const;

const NICHES: Niche[] = [
  // Restaurant
  { name: 'Pizza Shop', industry: 'Restaurant', slug: 'pizza-shop' },
  { name: 'Sushi Bar', industry: 'Restaurant', slug: 'sushi-bar' },
  { name: 'BBQ Joint', industry: 'Restaurant', slug: 'bbq-joint' },
  { name: 'Taco Truck', industry: 'Restaurant', slug: 'taco-truck' },
  { name: 'Coffee Shop', industry: 'Restaurant', slug: 'coffee-shop' },
  { name: 'Bakery', industry: 'Restaurant', slug: 'bakery' },
  // Home Services
  { name: 'Plumber', industry: 'Home Services', slug: 'plumber' },
  { name: 'Electrician', industry: 'Home Services', slug: 'electrician' },
  { name: 'Roofer', industry: 'Home Services', slug: 'roofer' },
  { name: 'HVAC', industry: 'Home Services', slug: 'hvac' },
  { name: 'Painter', industry: 'Home Services', slug: 'painter' },
  { name: 'Landscaper', industry: 'Home Services', slug: 'landscaper' },
  // Health
  { name: 'Dentist', industry: 'Health', slug: 'dentist' },
  { name: 'Chiropractor', industry: 'Health', slug: 'chiropractor' },
  { name: 'Optometrist', industry: 'Health', slug: 'optometrist' },
  { name: 'Vet', industry: 'Health', slug: 'vet' },
  { name: 'Physical Therapist', industry: 'Health', slug: 'physical-therapist' },
  // Auto
  { name: 'Auto Mechanic', industry: 'Auto', slug: 'auto-mechanic' },
  { name: 'Car Wash', industry: 'Auto', slug: 'car-wash' },
  { name: 'Tire Shop', industry: 'Auto', slug: 'tire-shop' },
  { name: 'Auto Detailing', industry: 'Auto', slug: 'auto-detailing' },
  // Legal
  { name: 'Personal Injury Attorney', industry: 'Legal', slug: 'personal-injury-attorney' },
  { name: 'Family Law', industry: 'Legal', slug: 'family-law' },
  { name: 'Criminal Defense', industry: 'Legal', slug: 'criminal-defense' },
  // Fitness
  { name: 'Gym', industry: 'Fitness', slug: 'gym' },
  { name: 'Yoga Studio', industry: 'Fitness', slug: 'yoga-studio' },
  { name: 'CrossFit Box', industry: 'Fitness', slug: 'crossfit-box' },
  { name: 'Personal Trainer', industry: 'Fitness', slug: 'personal-trainer' },
  // Beauty
  { name: 'Hair Salon', industry: 'Beauty', slug: 'hair-salon' },
  { name: 'Nail Salon', industry: 'Beauty', slug: 'nail-salon' },
  { name: 'Barber Shop', industry: 'Beauty', slug: 'barber-shop' },
  { name: 'Med Spa', industry: 'Beauty', slug: 'med-spa' },
];

const INDUSTRY_COLORS: Record<string, string> = {
  Restaurant: '#E85D3A',
  'Home Services': '#2E86DE',
  Health: '#1D9E75',
  Auto: '#6C5CE7',
  Legal: '#8E6B3E',
  Fitness: '#F07020',
  Beauty: '#D63384',
  Other: '#6B7280',
};

export default function NichePreviewsPage() {
  const [activeIndustry, setActiveIndustry] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNiches = useMemo(() => {
    return NICHES.filter((niche) => {
      const matchesIndustry =
        activeIndustry === 'All' || niche.industry === activeIndustry;
      const matchesSearch =
        searchQuery === '' ||
        niche.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        niche.industry.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesIndustry && matchesSearch;
    });
  }, [activeIndustry, searchQuery]);

  const handlePreview = (niche: Niche) => {
    const industrySlug = niche.industry.toLowerCase().replace(/\s+/g, '-');
    window.open(`/chat/${industrySlug}/${niche.slug}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf9f7' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <LayoutGrid size={28} color="#F07020" />
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#1e2a3a',
                margin: 0,
              }}
            >
              Niche Previews
            </h1>
          </div>
          <p
            style={{
              fontSize: 15,
              color: '#6b7280',
              margin: 0,
              paddingLeft: 40,
            }}
          >
            Show prospects their exact dashboard during sales calls
          </p>
        </div>

        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: 24,
            maxWidth: 480,
          }}
        >
          <Search
            size={18}
            color="#9ca3af"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search niches by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              fontSize: 14,
              border: '1px solid #e4e0da',
              borderRadius: 10,
              backgroundColor: '#fff',
              color: '#1e2a3a',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Industry Filter Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 32,
            alignItems: 'center',
          }}
        >
          <Filter size={16} color="#9ca3af" style={{ marginRight: 4 }} />
          {INDUSTRIES.map((industry) => (
            <button
              key={industry}
              onClick={() => setActiveIndustry(industry)}
              style={{
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: activeIndustry === industry ? 600 : 500,
                color:
                  activeIndustry === industry ? '#fff' : '#1e2a3a',
                backgroundColor:
                  activeIndustry === industry ? '#F07020' : '#fff',
                border: `1px solid ${
                  activeIndustry === industry ? '#F07020' : '#e4e0da'
                }`,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p
          style={{
            fontSize: 13,
            color: '#9ca3af',
            marginBottom: 16,
          }}
        >
          {filteredNiches.length} niche{filteredNiches.length !== 1 ? 's' : ''}{' '}
          found
        </p>

        {/* Niche Grid */}
        {filteredNiches.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            <style>{`
              @media (max-width: 1024px) {
                .niche-grid { grid-template-columns: repeat(3, 1fr) !important; }
              }
              @media (max-width: 768px) {
                .niche-grid { grid-template-columns: repeat(2, 1fr) !important; }
              }
              @media (max-width: 480px) {
                .niche-grid { grid-template-columns: 1fr !important; }
              }
              .niche-card:hover {
                border-color: #F07020 !important;
                box-shadow: 0 4px 16px rgba(240, 112, 32, 0.1) !important;
                transform: translateY(-2px);
              }
              .preview-btn:hover {
                background-color: #d9631a !important;
              }
            `}</style>
            <div
              className="niche-grid"
              style={{
                display: 'contents',
              }}
            >
              {filteredNiches.map((niche) => (
                <div
                  key={niche.slug}
                  className="niche-card"
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e4e0da',
                    borderRadius: 12,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#1e2a3a',
                        margin: '0 0 10px 0',
                      }}
                    >
                      {niche.name}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: INDUSTRY_COLORS[niche.industry] || '#6B7280',
                        backgroundColor: `${
                          INDUSTRY_COLORS[niche.industry] || '#6B7280'
                        }14`,
                        borderRadius: 6,
                        letterSpacing: 0.2,
                      }}
                    >
                      {niche.industry}
                    </span>
                  </div>

                  <button
                    className="preview-btn"
                    onClick={() => handlePreview(niche)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '9px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#fff',
                      backgroundColor: '#F07020',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      marginTop: 'auto',
                    }}
                  >
                    <ExternalLink size={14} />
                    Preview Dashboard
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              border: '1px solid #e4e0da',
              borderRadius: 12,
            }}
          >
            <Search size={40} color="#d1d5db" style={{ marginBottom: 16 }} />
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1e2a3a',
                marginBottom: 4,
              }}
            >
              No niches found
            </p>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>
              Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
