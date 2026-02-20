
import React from 'react';
import { SalesReportData, MenuCategory } from '../types';

interface DataInputProps {
  data: SalesReportData;
  onChange: (newData: SalesReportData) => void;
  onGenerate: () => void;
  loading: boolean;
}

const DataInput: React.FC<DataInputProps> = ({ data, onChange, onGenerate, loading }) => {
  const updateBaseField = (field: keyof SalesReportData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateQty = (catIdx: number, itemIdx: number, qty: number) => {
    const newCategories = [...data.categories];
    newCategories[catIdx].items[itemIdx].qty = qty;
    onChange({ ...data, categories: newCategories });
  };

  // Helper for consistent input styling
  const inputClasses = "w-full bg-white text-[#111827] placeholder-[#9CA3AF] border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-400 outline-none transition-all";
  const numericInputClasses = `${inputClasses} text-right pr-12`;

  return (
    <div className="space-y-8">
      {/* 1. Basic Info & Monthly Target */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-calendar-day text-indigo-500"></i>
            기본 정보 및 목표
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">날짜</label>
            <input 
              type="date" 
              value={data.date} 
              onChange={e => updateBaseField('date', e.target.value)} 
              className={inputClasses} 
            />
          </div>

          {/* POS Total Sales */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">POS 총매출</label>
            <div className="relative">
              <input 
                type="number" 
                value={data.posSales || ''} 
                onChange={e => updateBaseField('posSales', Number(e.target.value))} 
                className={numericInputClasses} 
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">USD</span>
            </div>
          </div>

          {/* Visitor Count */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">방문객 수 (유입)</label>
            <div className="relative">
              <input 
                type="number" 
                value={data.visitCount || ''} 
                onChange={e => updateBaseField('visitCount', Number(e.target.value))} 
                className={numericInputClasses} 
                placeholder="0" 
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">명</span>
            </div>
          </div>

          {/* Orders */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">주문수 (영수증)</label>
            <div className="relative">
              <input 
                type="number" 
                value={data.orders || ''} 
                onChange={e => updateBaseField('orders', Number(e.target.value))} 
                className={numericInputClasses} 
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">건</span>
            </div>
          </div>

          {/* Monthly Target */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">월 매출 목표</label>
            <div className="relative">
              <input 
                type="number" 
                value={data.monthlyTarget || ''} 
                onChange={e => updateBaseField('monthlyTarget', Number(e.target.value))} 
                className={numericInputClasses} 
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">USD</span>
            </div>
          </div>

          {/* MTD Sales */}
          <div>
             <label className="block text-xs font-bold text-slate-500 mb-1">월 누적 매출 (오늘 제외)</label>
             <div className="relative">
                <input 
                  type="number" 
                  value={data.mtdSales || ''} 
                  onChange={e => updateBaseField('mtdSales', Number(e.target.value))} 
                  className={numericInputClasses} 
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">USD</span>
             </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-500 mb-1">특이사항 (날씨, 인력, 품절 등)</label>
            <input 
              type="text" 
              value={data.note} 
              onChange={e => updateBaseField('note', e.target.value)} 
              placeholder="예: 비 옴, 짜장면 품절 등" 
              className={inputClasses} 
            />
          </div>
        </div>
      </div>

      {/* 2. Menu Quantities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.categories.map((cat, catIdx) => (
          <div key={cat.name} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-50/50 border-b border-indigo-100 px-6 py-3">
              <h3 className="font-bold text-indigo-900 text-sm">{cat.name}</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {cat.items.map((item, itemIdx) => (
                <div key={item.id} className="flex items-center justify-between gap-2 py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-medium text-slate-700 truncate flex-1">
                    {item.name} <span className="text-[10px] text-slate-400 font-normal">(${item.price})</span>
                  </span>
                  <div className="relative w-16">
                    <input
                      type="number"
                      min="0"
                      value={item.qty || ''}
                      onChange={e => updateQty(catIdx, itemIdx, Number(e.target.value))}
                      className="w-full bg-white text-[#111827] placeholder-[#9CA3AF] border border-slate-200 rounded-lg px-2 py-1 text-right text-sm focus:ring-1 focus:ring-indigo-400 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating CTA */}
      <div className="sticky bottom-6 flex justify-center z-50">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95 disabled:bg-slate-300"
        >
          {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          코칭 리포트 생성하기
        </button>
      </div>
    </div>
  );
};

export default DataInput;
