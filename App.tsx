
import React, { useState, useMemo } from 'react';
import { SalesReportData, CalculationResult, MenuCategory } from './types';
import { generateCoachingReport } from './services/geminiService';
import DataInput from './components/DataInput';
import ReportDisplay from './components/ReportDisplay';

const INITIAL_CATEGORIES: MenuCategory[] = [
  {
    name: "음식 메뉴 (Main Dishes)",
    items: [
      { id: 'f1', name: '짜장면', price: 7, qty: 0 },
      { id: 'f2', name: '짬뽕', price: 7, qty: 0 },
      { id: 'f3', name: '짬뽕밥', price: 8, qty: 0 },
      { id: 'f4', name: '백짬뽕', price: 7, qty: 0 },
      { id: 'f5', name: '백짬뽕밥', price: 8, qty: 0 },
      { id: 'f6', name: '볶음짬뽕', price: 9, qty: 0 },
      { id: 'f7', name: '고추짜장', price: 9, qty: 0 },
      { id: 'f8', name: '고추짬뽕', price: 10, qty: 0 },
      { id: 'f9', name: '고추짬뽕밥', price: 12, qty: 0 },
      { id: 'f10', name: '짜장밥', price: 5, qty: 0 },
      { id: 'f11', name: '잡채밥', price: 10, qty: 0 },
      { id: 'f12', name: '야채볶음밥', price: 5, qty: 0 },
      { id: 'f13', name: '소고기볶음밥', price: 7, qty: 0 },
      { id: 'f14', name: '마파두부', price: 12, qty: 0 },
      { id: 'f15', name: '마파두부덮밥', price: 9, qty: 0 },
      { id: 'f16', name: '깐풍기', price: 15, qty: 0 },
      { id: 'f17', name: '고추유린기', price: 15, qty: 0 },
      { id: 'f18', name: '쟁반짜장', price: 18, qty: 0 },
      { id: 'f19', name: '돌짜장', price: 18, qty: 0 },
      { id: 'f20', name: '해물육교자', price: 5.5, qty: 0 },
    ]
  },
  {
    name: "탕수육 (Tangsuyuk)",
    items: [
      { id: 't1', name: '탕수육 S', price: 12, qty: 0 },
      { id: 't2', name: '탕수육 M', price: 15, qty: 0 },
      { id: 't3', name: '탕수육 L', price: 18, qty: 0 },
    ]
  },
  {
    name: "토핑 (Add-ons)",
    items: [
      { id: 'a1', name: '토핑 해시브라운', price: 2, qty: 0 },
      { id: 'a2', name: '토핑 계란프라이', price: 1, qty: 0 },
      { id: 'a3', name: '토핑 슬라이스치즈', price: 1, qty: 0 },
    ]
  },
  {
    name: "음료 및 주류 (Beverages)",
    items: [
      { id: 'b1', name: '참이슬 프레쉬 360ml', price: 5, qty: 0 },
      { id: 'b2', name: '처음처럼 360ml', price: 5, qty: 0 },
      { id: 'b3', name: '진로이즈백 360ml', price: 5, qty: 0 },
      { id: 'b4', name: '막걸리', price: 6, qty: 0 },
      { id: 'b5', name: '앙코르 맥주 S 330ml', price: 2.5, qty: 0 },
      { id: 'b6', name: '앙코르 맥주 L 640ml', price: 4.5, qty: 0 },
      { id: 'b7', name: '앙코르 생맥주 250ml', price: 2, qty: 0 },
      { id: 'b8', name: '앙코르 생맥주 500ml', price: 3, qty: 0 },
      { id: 'b9', name: '하이네켄 생맥주 250ml', price: 2.5, qty: 0 },
      { id: 'b10', name: '콜라 330ml', price: 1, qty: 0 },
      { id: 'b11', name: '스프라이트 330ml', price: 1, qty: 0 },
      { id: 'b12', name: '소다 330ml', price: 1, qty: 0 },
      { id: 'b13', name: '봉봉 238ml', price: 2, qty: 0 },
      { id: 'b14', name: '쌕쌕 238ml', price: 2, qty: 0 },
      { id: 'b15', name: '쿨피스 250ml', price: 2, qty: 0 },
      { id: 'b16', name: '밀키스 250ml', price: 2, qty: 0 },
    ]
  },
  {
    name: "고량주 (Liquors)",
    items: [
      { id: 'l1', name: '이과두주 100ml', price: 4, qty: 0 },
      { id: 'l2', name: '이과두주 500ml', price: 8, qty: 0 },
      { id: 'l3', name: '보건주 125ml', price: 6, qty: 0 },
      { id: 'l4', name: '보건주 520ml', price: 18, qty: 0 },
      { id: 'l5', name: '노주교 500ml', price: 60, qty: 0 },
    ]
  }
];

const App: React.FC = () => {
  const [data, setData] = useState<SalesReportData>({
    date: new Date().toISOString().split('T')[0],
    posSales: 0,
    orders: 0,
    visitCount: 0,
    note: '',
    monthlyTarget: 15000,
    mtdSales: 0,
    categories: INITIAL_CATEGORIES
  });
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Derived Calculations
  const results = useMemo((): CalculationResult => {
    let calcSales = 0;
    let addonSum = 0;
    
    data.categories.forEach(cat => {
      cat.items.forEach(item => {
        calcSales += item.price * (item.qty || 0);
        if (cat.name.includes("토핑")) {
          addonSum += item.qty || 0;
        }
      });
    });

    const gapUsd = data.posSales - calcSales;
    const gapRate = data.posSales > 0 ? (gapUsd / data.posSales) * 100 : 0;
    const absGapRate = Math.abs(gapRate);
    
    let status: '✅' | '🟡' | '🔴' = '✅';
    if (absGapRate > 3) status = '🔴';
    else if (absGapRate > 1) status = '🟡';

    return {
      calcSales: Math.round(calcSales * 100) / 100,
      gapUsd: Math.round(gapUsd * 100) / 100,
      gapRate: Math.round(gapRate * 100) / 100,
      status,
      aov: data.orders > 0 ? Math.round((calcSales / data.orders) * 100) / 100 : 0,
      conversionRate: data.visitCount > 0 ? Math.round((data.orders / data.visitCount) * 1000) / 10 : 0,
      addonPerOrder: data.orders > 0 ? Math.round((addonSum / data.orders) * 10) / 10 : 0
    };
  }, [data]);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateCoachingReport(data, results);
    setReport(result);
    setLoading(false);
    // Scroll to report
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <nav className="bg-indigo-600 px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm">
              <i className="fa-solid fa-store font-black"></i>
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none uppercase tracking-tight">홍콩반점 캄보디아</h1>
              <p className="text-indigo-200 text-[10px] font-bold uppercase mt-1 tracking-widest">Sales Coach AI (USD)</p>
            </div>
          </div>
          <div className="text-white font-bold text-sm bg-indigo-500/50 px-3 py-1 rounded-full border border-indigo-400">
            {data.date}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-12">
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">매출 코치 리포트</h2>
          <p className="text-slate-500 font-medium">데이터 분석을 통해 객단가와 전환율을 높이는 부스트 전략을 제안합니다.</p>
        </header>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">POS 총매출</p>
            <p className="text-2xl font-black text-slate-900">${data.posSales}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">전환율</p>
            <p className="text-2xl font-black text-indigo-600">{results.conversionRate}%</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">POS 오차</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">${results.gapUsd}</span>
              <span className={`text-sm font-bold ${results.status === '🔴' ? 'text-rose-500' : results.status === '🟡' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {results.status}
              </span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">객단가 (AOV)</p>
            <p className="text-2xl font-black text-slate-900">${results.aov}</p>
          </div>
        </div>

        <DataInput 
          data={data} 
          onChange={setData} 
          onGenerate={handleGenerate} 
          loading={loading}
        />

        <ReportDisplay report={report} loading={loading} />
      </main>
    </div>
  );
};

export default App;
