export interface AdminStats {
  totalVolume: number;
  platformFees: number;
  recurringRevenue: number;
  pendingPayouts: number;
  revenueChart: { name: string; revenue: number; profit: number }[];
  recentTransactions: any[];
  totalVolume24h: number;
  successRate: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  failedTransactionsCount: number;
  activeSubscriptions: number;
  mrr: number;
  expiringSoon: number;
  recentTickets: any[];
  openTicketsCount: number;
  avgResponseTime: string;
  resolvedTicketsCount: number;
  customerSatisfaction: string;
  securityAlertsCount: number;
  failedLoginsCount: number;
  activeProtocolsCount: number;
  availableReports: any[];
  scheduledReportsCount: number;
  gtv: string;
  revenue: string;
  alertsCount: number;
  todayVolume: number;
  activeAdmins: number;
  tenantsCount: number;
  recentEvents: any[];
  recentSubscriptions: any[];
  trends: {
    weeklyGrowth: any[];
    revenueTrend: any[];
    dailyActive: any[];
    ticketTrend: any[];
  };
}

export interface SystemHealth {
  version: string;
  apiLatency: string;
  dbLatency: string;
  cpuLoad: string;
  incidentRate: string;
  performanceData: any[];
  nodes: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  stats?: any;
}

export interface ProviderStats {
  dailySales: number;
  dailyTransactions: number;
  newCustomers: number;
  outOfStockCount: number;
  profit: number;
  rating: number;
  reviewCount: number;
  salesChart: { name: string; sales: number; profit: number }[];
  recentSales: any[];
}
