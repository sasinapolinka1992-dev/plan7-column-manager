
import React, { useState, useRef } from 'react';
import { Column } from '../types';
import CustomParameterForm from './CustomParameterForm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainColumns: Column[];
  additionalColumns: Column[];
  customColumns: Column[];
  onApply: (main: Column[], additional: Column[], custom: Column[]) => void;
  onDeleteCustom: (id: string) => void;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  mainColumns, 
  additionalColumns, 
  customColumns,
  onApply,
  onDeleteCustom
}) => {
  const [localMain, setLocalMain] = useState(mainColumns);
  const [localAdditional, setLocalAdditional] = useState(additionalColumns);
  const [localCustom, setLocalCustom] = useState(customColumns);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'selection' | 'add_param'>('selection');
  const [editingCol, setEditingCol] = useState<Column | null>(null);
  const dragItem = useRef<{ section: string; index: number } | null>(null);
  const dragOverItem = useRef<{ section: string; index: number } | null>(null);

  if (!isOpen) return null;

  const handleToggle = (id: string, section: string) => {
    const toggle = (list: Column[]) => list.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
    if (section === 'main') setLocalMain(toggle(localMain));
    else if (section === 'additional') setLocalAdditional(toggle(localAdditional));
    else setLocalCustom(toggle(localCustom));
  };

  const handleFavorite = (e: React.MouseEvent, id: string, section: string) => {
    e.preventDefault();
    e.stopPropagation();
    const toggleFav = (list: Column[]) => list.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
    if (section === 'main') setLocalMain(toggleFav(localMain));
    else if (section === 'additional') setLocalAdditional(toggleFav(localAdditional));
    else setLocalCustom(toggleFav(localCustom));
  };

  const handleAddCustom = (newCol: Column) => {
    if (editingCol) {
      setLocalCustom(localCustom.map(c => c.id === editingCol.id ? newCol : c));
    } else {
      setLocalCustom([...localCustom, newCol]);
    }
    setView('selection');
    setEditingCol(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLocalCustom(localCustom.filter(c => c.id !== id));
  };

  const handleEdit = (e: React.MouseEvent, col: Column) => {
    e.stopPropagation();
    setEditingCol(col);
    setView('add_param');
  };

  const handleDragStart = (section: string, index: number) => {
    dragItem.current = { section, index };
  };

  const handleDragEnter = (section: string, index: number) => {
    dragOverItem.current = { section, index };
  };

  const handleDragEnd = () => {
    if (dragItem.current && dragOverItem.current && dragItem.current.section === dragOverItem.current.section) {
      const { section, index: from } = dragItem.current;
      const { index: to } = dragOverItem.current;
      
      const reorder = (list: Column[]) => {
        const newList = [...list];
        const [movedItem] = newList.splice(from, 1);
        newList.splice(to, 0, movedItem);
        return newList;
      };

      if (section === 'main') setLocalMain(reorder(localMain));
      else if (section === 'additional') setLocalAdditional(reorder(localAdditional));
      else if (section === 'custom') setLocalCustom(reorder(localCustom));
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const renderSection = (title: string, columns: Column[], sectionKey: string, isFavoritesSection: boolean = false) => {
    const filtered = columns.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length === 0 && search) return null;
    if (filtered.length === 0 && isFavoritesSection) return null;

    return (
      <section className={`mb-8 ${isFavoritesSection ? 'bg-yellow-50/40 p-4 rounded-xl border border-yellow-100' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isFavoritesSection ? 'text-yellow-700 flex items-center gap-2' : 'text-slate-800'}`}>
            {isFavoritesSection && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
            {title}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((col, index) => {
             let originalSection = sectionKey;
             if (isFavoritesSection) {
               if (localMain.some(m => m.id === col.id)) originalSection = 'main';
               else if (localAdditional.some(a => a.id === col.id)) originalSection = 'additional';
               else originalSection = 'custom';
             }

             return (
              <div 
                key={col.id}
                draggable={!isFavoritesSection}
                onDragStart={() => !isFavoritesSection && handleDragStart(sectionKey, index)}
                onDragEnter={() => !isFavoritesSection && handleDragEnter(sectionKey, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => !isFavoritesSection && e.preventDefault()}
                className={`flex items-center group relative p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white transition-all ${!isFavoritesSection ? 'cursor-move' : ''} ${col.visible ? 'bg-slate-50/50' : ''}`}
              >
                {!isFavoritesSection && (
                  <div className="mr-2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </div>
                )}
                <label className="flex flex-1 items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => handleToggle(col.id, originalSection)}
                    className="w-4 h-4 rounded border-slate-300 text-[#69C] focus:ring-[#69C]"
                  />
                  <span className={`text-sm ${col.visible ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{col.label}</span>
                </label>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleFavorite(e, col.id, originalSection)} className={`p-1 rounded-full hover:bg-slate-100 ${col.isFavorite ? 'text-yellow-500' : 'text-slate-300'}`}>
                    <svg className="w-4 h-4" fill={col.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                  </button>
                  {originalSection === 'custom' && (
                    <>
                      <button onClick={(e) => handleEdit(e, col)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#69C]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={(e) => handleDelete(e, col.id)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const favorites = [...localMain, ...localAdditional, ...localCustom].filter(c => c.isFavorite);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-300">
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{view === 'selection' ? 'Показать колонки' : (editingCol ? 'Редактировать параметр' : 'Новый параметр')}</h2>
            {view === 'selection' && <p className="text-[11px] text-orange-600 font-black uppercase tracking-widest mt-1.5 bg-orange-50 px-2 py-0.5 rounded-md inline-block">Перетаскивайте элементы для изменения порядка</p>}
          </div>
          {view === 'selection' && (
            <div className="relative w-72">
              <input type="text" placeholder="Поиск по параметрам..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#69C]/10 focus:border-[#69C] transition-all" />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
          {view === 'selection' ? (
            <div className="space-y-8">
              <div className="flex justify-start">
                <button 
                  onClick={() => { setEditingCol(null); setView('add_param'); }} 
                  className="flex items-center gap-3 px-6 py-3 bg-[#69C] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[#69C]/25 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Индивидуальный параметр
                </button>
              </div>

              <div className="space-y-4">
                {renderSection('Избранные', favorites, 'favorites', true)}
                {renderSection('Основные параметры', localMain, 'main')}
                {renderSection('Дополнительные параметры', localAdditional, 'additional')}
                {renderSection('Индивидуальные параметры', localCustom, 'custom')}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-4">
              <CustomParameterForm 
                onAdd={handleAddCustom} 
                onCancel={() => { setView('selection'); setEditingCol(null); }} 
                existingColumns={[...localMain, ...localAdditional, ...localCustom]}
                editColumn={editingCol}
              />
            </div>
          )}
        </div>

        {view === 'selection' && (
          <div className="px-10 py-8 border-t border-slate-100 flex items-center gap-8 bg-slate-50/50">
            <button onClick={() => onApply(localMain, localAdditional, localCustom)} className="px-10 py-4 bg-[#69C] hover:opacity-90 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#69C]/20 transition-all hover:scale-105 active:scale-95">Применить</button>
            <button onClick={onClose} className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-colors">Отменить</button>
            <div className="ml-auto">
               <button onClick={() => {
                  setLocalMain(localMain.map(c => ({...c, visible: false})));
                  setLocalAdditional(localAdditional.map(c => ({...c, visible: false})));
                  setLocalCustom(localCustom.map(c => ({...c, visible: false})));
                }} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Сбросить всё
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
