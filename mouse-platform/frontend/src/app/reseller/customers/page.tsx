'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface ResellerCustomer {
  id: string;
  customer_name: string;
  business_name: string;
  niche: string;
  customer_rate: number;
  total_hours_used: number;
  total_commission: number;
  status: 'active' | 'paused' | 'churned';
  signed_up_at: string;
}

const STATUS_CONFIG: Record<
  ResellerCustomer['status'],
  { label: string; bg: string; color: string }
> = {
  active: { label: 'Active', bg: '#e6f7f0', color: '#1D9E75' },
  paused: { label: 'Paused', bg: '#fef9e7', color: '#b7940a' },
  churned: { label: 'Churned', bg: '#fde8e8', color: '#dc2626' },
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ResellerCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resellerId = sessionStorage.getItem('reseller_id');
    if (!resellerId) {
      setError('No reseller ID found. Please log in again.');
      setLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      try {
        const res = await fetch(
          `/api/reseller/customers?reseller_id=${resellerId}`
        );
        if (!res.ok) throw new Error('Failed to fetch customers');
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load customers'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const totalMRR = customers
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.customer_rate, 0);

  const totalEarnings = customers.reduce(
    (sum, c) => sum + c.total_commission,
    0
  );

  const activeCount = customers.filter((c) => c.status === 'active').length;

  const avgHours =
    activeCount > 0
      ? customers
          .filter((c) => c.status === 'active')
          .reduce((sum, c) => sum + c.total_hours_used, 0) / activeCount
      : 0;

  const summaryCards = [
    {
      label: 'Total MRR',
      value: `$${totalMRR.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      iconColor: '#1D9E75',
      iconBg: '#e6f7f0',
    },
    {
      label: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      iconColor: '#1D9E75',
      iconBg: '#e6f7f0',
    },
    {
      label: 'Active Customers',
      value: activeCount.toString(),
      icon: Users,
      iconColor: '#F07020',
      iconBg: '#fef0e6',
    },
    {
      label: 'Avg Hours / Customer',
      value: avgHours.toFixed(1),
      icon: Clock,
      iconColor: '#F07020',
      iconBg: '#fef0e6',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf9f7' }}>
      <style>{`
        .cust-table-row:hover {
          background-color: #faf9f7 !important;
        }
        .invite-btn:hover {
          background-color: #d9631a !important;
        }
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .table-wrap {
            overflow-x: auto;
          }
        }
        @media (max-width: 480px) {
          .summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 4,
              }}
            >
              <Users size={28} color="#F07020" />
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#1e2a3a',
                  margin: 0,
                }}
              >
                My Customers
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
              Track customer activity, revenue, and commissions
            </p>
          </div>

          <button
            className="invite-btn"
            onClick={() => router.push('/reseller/invite')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              backgroundColor: '#F07020',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <UserPlus size={16} />
            Invite New Customer
          </button>
        </div>

        {/* Summary Cards */}
        <div
          className="summary-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
            marginBottom: 32,
          }}
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e4e0da',
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: card.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color={card.iconColor} />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    {card.label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#1e2a3a',
                    margin: 0,
                  }}
                >
                  {loading ? '--' : card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              border: '1px solid #e4e0da',
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 15, color: '#6b7280' }}>
              Loading customers...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              border: '1px solid #e4e0da',
              borderRadius: 12,
            }}
          >
            <AlertCircle
              size={40}
              color="#dc2626"
              style={{ marginBottom: 16 }}
            />
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1e2a3a',
                marginBottom: 4,
              }}
            >
              Something went wrong
            </p>
            <p style={{ fontSize: 14, color: '#9ca3af' }}>{error}</p>
          </div>
        ) : customers.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#fff',
              border: '1px solid #e4e0da',
              borderRadius: 12,
            }}
          >
            <Users size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
            <p
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1e2a3a',
                marginBottom: 6,
              }}
            >
              No customers yet
            </p>
            <p
              style={{
                fontSize: 14,
                color: '#9ca3af',
                marginBottom: 24,
                maxWidth: 360,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Send your first invite to start earning.
            </p>
            <button
              className="invite-btn"
              onClick={() => router.push('/reseller/invite')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                backgroundColor: '#F07020',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <UserPlus size={16} />
              Invite New Customer
            </button>
          </div>
        ) : (
          /* Customer Table */
          <div
            className="table-wrap"
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e4e0da',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 860,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #e4e0da',
                    backgroundColor: '#faf9f7',
                  }}
                >
                  {[
                    'Customer Name',
                    'Business',
                    'Niche',
                    'Monthly Spend',
                    'Hours Used',
                    'Commission Earned',
                    'Status',
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const statusCfg = STATUS_CONFIG[customer.status];
                  return (
                    <tr
                      key={customer.id}
                      className="cust-table-row"
                      style={{
                        borderBottom: '1px solid #f0eeea',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      <td
                        style={{
                          padding: '14px 16px',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1e2a3a',
                        }}
                      >
                        {customer.customer_name}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontSize: 14,
                          color: '#374151',
                        }}
                      >
                        {customer.business_name}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontSize: 13,
                          color: '#6b7280',
                        }}
                      >
                        {customer.niche}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1D9E75',
                        }}
                      >
                        $
                        {customer.customer_rate.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontSize: 14,
                          color: '#374151',
                        }}
                      >
                        {customer.total_hours_used.toFixed(1)}
                      </td>
                      <td
                        style={{
                          padding: '14px 16px',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1D9E75',
                        }}
                      >
                        $
                        {customer.total_commission.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            color: statusCfg.color,
                            backgroundColor: statusCfg.bg,
                            borderRadius: 20,
                          }}
                        >
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
