export interface AdminStats {
  overview: {
    totalProviders: number;
    payingProviders: number;
    activeToday: number;
    revenueThisMonth: number;
    totalPendingPayouts: number;
    totalGrossFees: number;
    expiringSoon: number;
    activeAvatars: any[];
  };
  revenue: {
    total: number;
    platformVolume: number;
    mpesaCollections: number;
  };
  trends: {
    revenueTrend: any[];
    weeklyGrowth: any[];
    dailyActive?: any[];
    ticketTrend?: any[];
  };
  recentTransactions: any[];
  recentActivity?: any[];
  // Legacy fields (keep optional for other pages that might still use them)
  [key: string]: any;
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
  profit: number;            // today's gross margin
  cumulativeProfit: number;  // all-time gross margin
  mtdProfit: number;         // month-to-date gross margin
  mtdExpenses: number;       // month-to-date expenses
  mtdNetProfit: number;      // mtdProfit - mtdExpenses (convenience field)
  rating: number;
  reviewCount: number;
  salesChart: { name: string; sales: number; profit: number }[];
  recentSales: any[];
  profitBySource?: { name: string; sales: number; profit: number }[];
}
