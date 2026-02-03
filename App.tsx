
import React, { useState, useEffect } from 'react';
import { INITIAL_COLUMNS } from './constants';
import { Column, ParameterType, FormulaOutputType } from './types';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [mainCols, setMainCols] = useState<Column[]>(() => {
    const saved = localStorage.getItem('plan7_main_cols');
    return saved ? JSON.parse(saved) : INITIAL_COLUMNS.main;
  });
  
  const [additionalCols, setAdditionalCols] = useState<Column[]>(() => {
    const saved = localStorage.getItem('plan7_additional_cols');
    return saved ? JSON.parse(saved) : INITIAL_COLUMNS.additional;
  });

  const [customCols, setCustomCols] = useState<Column[]>(() => {
    const saved = localStorage.getItem('plan7_custom_cols');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('Обновление');
  const [activeSubTab, setActiveSubTab] = useState('Он-лайн табличный редактор');
  const [activeSection, setActiveSection] = useState('Все секции');

  useEffect(() => {
    localStorage.setItem('plan7_main_cols', JSON.stringify(mainCols));
    localStorage.setItem('plan7_additional_cols', JSON.stringify(additionalCols));
    localStorage.setItem('plan7_custom_cols', JSON.stringify(customCols));
  }, [mainCols, additionalCols, customCols]);

  const handleApply = (newMain: Column[], newAdditional: Column[], newCustom: Column[]) => {
    setMainCols(newMain);
    setAdditionalCols(newAdditional);
    setCustomCols(newCustom);
    setIsModalOpen(false);
  };

  const calculateFormula = (col: Column, rowData: any) => {
    if (!col.formula) return '-';
    const { initialColId, initialBracketsBefore = 0, initialBracketsAfter = 0, parts, outputType } = col.formula;
    const getVal = (id: string) => {
      const val = rowData[id];
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const cleaned = parseFloat(val.replace(/[^\d.,-]/g, '').replace(',', '.'));
        return isNaN(cleaned) ? 0 : cleaned;
      }
      return 0;
    };
    let expr = "(".repeat(initialBracketsBefore) + getVal(initialColId) + ")".repeat(initialBracketsAfter);
    for (const part of parts) {
      expr += ` ${part.operator} ` + "(".repeat(part.bracketsBefore || 0) + getVal(part.colId) + ")".repeat(part.bracketsAfter || 0);
    }
    try {
      const sanitizedExpr = expr.replace(/[^0-9+\-*/().\s]/g, '');
      const result = new Function(`return ${sanitizedExpr}`)();
      if (isNaN(result) || !isFinite(result)) return '—';
      const formattedResult = result.toFixed(col.precision ?? 2);
      if (outputType === FormulaOutputType.PERCENT) return `${formattedResult}%`;
      if (outputType === FormulaOutputType.CURRENCY) {
        const symbols: Record<string, string> = { 'RUB': '₽', 'USD': '$', 'EUR': '€' };
        return `${Number(formattedResult).toLocaleString('ru-RU')} ${symbols[col.currency || 'RUB'] || col.currency}`;
      }
      return Number(formattedResult).toLocaleString('ru-RU');
    } catch (e) { return 'Ошибка'; }
  };

  const renderValue = (col: Column, row: number) => {
    const rowData: any = {
      plan7_id: 160994 + row,
      area: 45 + row * 4.2,
      price_m2: 135000 + row * 2800,
      room_type: row % 5 === 0 ? 'Офис' : row % 3 === 0 ? 'Коммерция' : 'Квартира',
      status_buyer: row % 5 === 0 ? 'Резерв' : row % 7 === 0 ? 'Бронь' : 'Свободно',
      finish_quality: row % 2 === 0 ? 'Предчистовая' : 'Чистовая',
    };
    if (col.type === ParameterType.FORMULA) return calculateFormula(col, rowData);
    if (col.id === 'plan7_id') return rowData.plan7_id;
    if (col.id === 'room_type') return rowData.room_type;
    if (col.id === 'status_buyer') return rowData.status_buyer;
    if (col.id === 'area') return `${rowData.area.toFixed(1)}`;
    if (col.id === 'price_m2') return `${rowData.price_m2.toLocaleString('ru-RU')}`;
    if (col.id === 'finish_quality') return rowData.finish_quality;
    if (col.isCustom) return '-';
    return '-';
  };

  const visibleColumns = [...mainCols, ...additionalCols, ...customCols].filter(c => c.visible);

  return (
    <div className="flex h-screen bg-white text-slate-700 font-sans selection:bg-[#69C]/10">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200/60">
          <div className="w-8 h-8 bg-[#69C] rounded flex items-center justify-center text-white font-bold text-lg">7</div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Plan7</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="mb-6">
            {[
              { label: 'Мои Каталоги', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', active: true },
              { label: 'Интеграция с CRM', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { label: 'Статистика', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { label: 'Аналитика', badge: 'beta', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
              { label: 'Акции', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z' }
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors border-l-4 ${item.active ? 'bg-white border-[#69C] text-[#69C] font-semibold' : 'border-transparent text-slate-600 hover:bg-slate-100'}`}>
                <svg className={`w-5 h-5 ${item.active ? 'text-[#69C]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/></svg>
                <span className="text-[13px] flex-1">{item.label}</span>
                {item.badge && <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">{item.badge}</span>}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="px-6 py-2 flex items-center justify-between text-slate-400 cursor-pointer hover:text-slate-600">
               <div className="flex items-center gap-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                 <span className="text-[13px] font-bold">База знаний</span>
               </div>
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
            </div>
            <div className="pl-14 pr-6 space-y-2 mt-2">
              <div className="text-[13px] text-slate-500 hover:text-[#69C] cursor-pointer">Каталог Plan7</div>
              <div className="text-[13px] text-slate-500 hover:text-[#69C] cursor-pointer">Битрикс для застройщиков</div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4">
             <div className="px-6 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Админ Р7</div>
             {[
               { label: 'Встройка', color: 'text-red-500' },
               { label: 'Заявка', color: 'text-red-500' },
               { label: 'amoCRM #52' },
               { label: 'amoCRM #35' },
               { label: 'amoCRM #20' }
             ].map(item => (
               <div key={item.label} className="flex items-center gap-3 px-6 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                 <div className={`w-1.5 h-1.5 rounded-full ${item.color || 'bg-slate-300'}`}></div>
                 <span className="text-[13px] text-slate-600">{item.label}</span>
               </div>
             ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Breadcrumbs */}
        <header className="px-10 py-4 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Каталог</span> <span className="text-slate-200">&gt;</span>
            <span>Организации</span> <span className="text-slate-200">&gt;</span>
            <span>Plan7</span> <span className="text-slate-200">&gt;</span>
            <span>Каталоги</span> <span className="text-slate-200">&gt;</span>
            <span>P7 DEMO AVENUE</span> <span className="text-slate-200">&gt;</span>
            <span className="text-slate-800 font-bold">Таблицы</span>
            <button className="ml-4 px-3 py-1 border border-[#69C]/30 text-[#69C] rounded text-[11px] font-medium hover:bg-[#69C]/5">Предпросмотр</button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-[13px] font-bold text-slate-700">Polina</span>
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
            <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center relative">
              <div className="w-2 h-2 bg-orange-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white"></div>
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </div>
            <button className="px-4 py-1.5 border border-slate-200 rounded text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">Выйти</button>
          </div>
        </header>

        {/* Main Tabs */}
        <div className="px-10 bg-white border-b border-slate-100 flex gap-8 shrink-0 overflow-x-auto no-scrollbar">
          {['Описание', 'Секции', 'Стиль', 'Галерея', 'Ипотека', 'ПДФ', 'Заявки', 'Фиды', 'Обновление', 'Метрика', 'Встройка', 'API', 'Контент'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveMainTab(tab)}
              className={`py-5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${activeMainTab === tab ? 'border-[#69C] text-[#69C] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub Tabs */}
        <div className="px-10 py-3 bg-slate-50 border-b border-slate-100 flex gap-8 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'tab1', label: 'Он-лайн', sub: 'табличный редактор' },
            { id: 'tab2', label: 'Excel', sub: 'загрузка из таблицы' },
            { id: 'tab3', label: 'Google', sub: 'обмен с таблицей' },
            { id: 'tab4', label: 'Macro CRM', sub: 'загрузка из таблицы' },
            { id: 'tab5', label: 'Копии базы P7', sub: 'восстановить базу' },
            { id: 'tab6', label: 'JSON', sub: 'обновление' },
            { id: 'tab7', label: 'История', sub: 'изменения квартир' },
            { id: 'tab8', label: 'Битрикс24', sub: 'добавить в сделки' },
            { id: 'tab9', label: 'PDF Таблица', sub: 'список квартир' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveSubTab(tab.label)}
              className={`flex flex-col text-left group transition-all ${activeSubTab === tab.label ? 'text-[#69C]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className={`text-[13px] font-bold ${activeSubTab === tab.label ? 'text-[#69C]' : 'text-slate-600'}`}>{tab.label}</span>
              <span className="text-[10px] whitespace-nowrap">{tab.sub}</span>
              <div className={`h-0.5 mt-1 transition-all ${activeSubTab === tab.label ? 'bg-[#69C] w-full' : 'w-0'}`}></div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          <div className="max-w-[1600px] mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Он-лайн редактирование базы Plan7</h1>
              <p className="text-sm text-slate-500">
                Все изменения происходят в режиме предварительного редактирования.<br />
                Нажмите "Сохранить", чтобы все изменения прописались в базе Plan7.
              </p>
            </div>

            {/* Section Filters & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                {['Секция 4', 'Секция 1.1 copy', 'Секция 1', 'Секция 2', 'Все секции'].map(sec => (
                  <button 
                    key={sec} 
                    onClick={() => setActiveSection(sec)}
                    className={`px-4 py-2 text-[13px] font-medium border-r border-slate-200 last:border-r-0 transition-colors ${activeSection === sec ? 'bg-[#69C] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsModalOpen(true)} className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"/></svg>
                </button>
                <button className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
                <button className="px-5 py-2.5 bg-[#69C] hover:opacity-90 text-white rounded font-bold text-[13px] shadow-lg shadow-[#69C]/20 transition-all ml-4">Сохранить изменения</button>
                <div className="flex flex-col text-[10px] text-slate-400 ml-4">
                  <span className="font-bold">Всего 108 помещений</span>
                  <span>Последние сохранённые изменения 2024-01-30 в 13:32:00 (МСК)</span>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1400px]">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      {visibleColumns.map((col, idx) => (
                        <th key={col.id} className="px-6 py-4 text-[12px] font-bold text-slate-600 whitespace-nowrap">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              {col.label}
                              <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7"/></svg>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-[#69C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 accent-[#69C]" />
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rowIdx => (
                      <tr key={rowIdx} className="hover:bg-[#69C]/5 transition-colors">
                        {visibleColumns.map(col => (
                          <td key={col.id} className="px-6 py-4 text-[13px] text-slate-600 border-r border-slate-50 last:border-r-0">
                            {renderValue(col, rowIdx)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mainColumns={mainCols}
        additionalColumns={additionalCols}
        customColumns={customCols}
        onApply={handleApply}
        onDeleteCustom={(id) => setCustomCols(customCols.filter(c => c.id !== id))}
      />
    </div>
  );
};

export default App;
