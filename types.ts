
export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface SalesReportData {
  date: string;
  posSales: number;
  orders: number;
  visitCount: number; // Added
  note: string;
  monthlyTarget: number;
  mtdSales: number;
  categories: MenuCategory[];
}

export interface CalculationResult {
  calcSales: number;
  gapUsd: number;
  gapRate: number;
  status: '✅' | '🟡' | '🔴';
  aov: number;
  conversionRate: number; // Added
  addonPerOrder: number;
}
