import type { ComponentType } from 'react';
import type { DashboardWidgetConfig } from '@/types/pro-template';

export interface WidgetProps {
  customerId: string;
  templateId?: string;
  config?: DashboardWidgetConfig;
}

// Lazy imports for code splitting
import CallsHandledWidget from './CallsHandledWidget';
import AppointmentsWidget from './AppointmentsWidget';
import DailyRevenueWidget from './DailyRevenueWidget';
import ReviewAlertsWidget from './ReviewAlertsWidget';
import SampleTasksWidget from './SampleTasksWidget';
import KPISummaryWidget from './KPISummaryWidget';
import QuickActionsWidget from './QuickActionsWidget';
import PendingOrdersWidget from './PendingOrdersWidget';
import VehiclesWidget from './VehiclesWidget';
import PatientScheduleWidget from './PatientScheduleWidget';
import OpenSlotsWidget from './OpenSlotsWidget';
import InventoryAlertsWidget from './InventoryAlertsWidget';
import PipelineWidget from './PipelineWidget';
import EstimatesPendingWidget from './EstimatesPendingWidget';
import CateringPipelineWidget from './CateringPipelineWidget';
import NewClientsWidget from './NewClientsWidget';
import RecallsDueWidget from './RecallsDueWidget';

export const WIDGET_REGISTRY: Record<string, ComponentType<WidgetProps>> = {
  // Communication
  'calls-handled': CallsHandledWidget,

  // Scheduling
  'todays-appointments': AppointmentsWidget,
  'open-slots': OpenSlotsWidget,

  // Revenue
  'daily-revenue': DailyRevenueWidget,

  // Operations
  'pending-orders': PendingOrdersWidget,
  'vehicles-in-shop': VehiclesWidget,
  'inventory-alerts': InventoryAlertsWidget,
  'estimates-pending': EstimatesPendingWidget,

  // Customer
  'new-clients': NewClientsWidget,
  'review-alerts': ReviewAlertsWidget,

  // Medical
  'patient-schedule': PatientScheduleWidget,
  'recalls-due': RecallsDueWidget,

  // Pipeline
  'pipeline': PipelineWidget,
  'catering-pipeline': CateringPipelineWidget,

  // Generic
  'sample-tasks': SampleTasksWidget,
  'kpi-summary': KPISummaryWidget,
  'quick-actions': QuickActionsWidget,
};

// Default widgets for customers without a template
export const DEFAULT_WIDGET_CONFIGS: DashboardWidgetConfig[] = [
  { id: 'calls-handled', title: 'Calls Today', description: 'Phone calls handled', priority: 1 },
  { id: 'daily-revenue', title: "Today's Revenue", description: 'Revenue today', priority: 2 },
  { id: 'todays-appointments', title: 'Appointments', description: 'Scheduled today', priority: 3 },
  { id: 'review-alerts', title: 'Reviews', description: 'New reviews', priority: 4 },
  { id: 'kpi-summary', title: 'KPIs', description: 'Key metrics', priority: 5 },
];
