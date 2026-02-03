
import React, { useState } from 'react';
import { ParameterType, Column, FormulaConfig, FormulaOutputType, FormulaPart } from '../types';

interface CustomParameterFormProps {
  onAdd: (column: Column) => void;
  onCancel: () => void;
  existingColumns: Column[];
  editColumn?: Column | null;
}

const CustomParameterForm: React.FC<CustomParameterFormProps> = ({ 
  onAdd, 
  onCancel, 
  existingColumns,
  editColumn 
}) => {
  const [name, setName] = useState(editColumn?.label || '');
  const [type, setType] = useState<ParameterType>(editColumn?.type || ParameterType.STRING);
  const [options, setOptions] = useState<string[]>(editColumn?.options || ['']);
  const [isMultiSelect, setIsMultiSelect] = useState(editColumn?.isMultiSelect || false);
  const [precision, setPrecision] = useState<number>(editColumn?.precision ?? 2);
  const [currency, setCurrency] = useState<string>(editColumn?.currency || 'RUB');
  
  const [formula, setFormula] = useState<FormulaConfig>(() => {
    if (editColumn?.formula) return editColumn.formula;
    return { 
      initialColId: '', 
      parts: [], 
      outputType: FormulaOutputType.NUMBER 
    };
  });

  const [error, setError] = useState('');

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddFormulaPart = () => {
    setFormula({
      ...formula,
      parts: [...formula.parts, { operator: '+', colId: '' }]
    });
  };

  const handleRemoveFormulaPart = (index: number) => {
    const newParts = [...formula.parts];
    newParts.splice(index, 1);
    setFormula({ ...formula, parts: newParts });
  };

  const handleFormulaPartChange = (index: number, key: keyof FormulaPart, value: any) => {
    const newParts = [...formula.parts];
    newParts[index] = { ...newParts[index], [key]: value };
    setFormula({ ...formula, parts: newParts });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return;
    
    const isDuplicate = existingColumns.some(c => 
      c.label.toLowerCase() === name.toLowerCase() && c.id !== editColumn?.id
    );
    
    if (isDuplicate) {
      setError('Параметр с таким названием уже существует');
      return;
    }

    const newColumn: Column = {
      id: editColumn?.id || `custom_${Date.now()}`,
      label: name,
      visible: editColumn?.visible ?? true,
      isCustom: true,
      isFavorite: editColumn?.isFavorite ?? false,
      type: type,
      options: type === ParameterType.LIST ? options.filter(o => o.trim() !== '') : undefined,
      isMultiSelect: type === ParameterType.LIST ? isMultiSelect : undefined,
      precision: (type === ParameterType.NUMERIC || type === ParameterType.FORMULA) ? precision : undefined,
      currency: (type === ParameterType.MONEY || (type === ParameterType.FORMULA && formula.outputType === FormulaOutputType.CURRENCY)) ? currency : undefined,
      formula: type === ParameterType.FORMULA ? formula : undefined,
    };

    onAdd(newColumn);
  };

  const commonLabelClass = "block text-[13px] text-[#000] mb-[5px]";
  const commonInputClass = "w-full h-[35px] px-3 bg-white border border-[#DDD] rounded text-[14px] outline-none focus:border-[#69C] transition-all placeholder:text-slate-300 appearance-none";
  const containerClass = "mb-[15px]";

  return (
    <form onSubmit={handleSubmit} className="font-['Roboto']">
      <div className={containerClass}>
        <label className={commonLabelClass}>
          Название параметра <span className="text-orange-500 ml-0.5">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={commonInputClass}
          placeholder="Например: Итоговая стоимость"
        />
        {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-x-5">
        <div className={containerClass}>
          <label className={commonLabelClass}>
            Заголовок селектора <span className="text-orange-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ParameterType)}
              className={commonInputClass}
            >
              {Object.values(ParameterType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>

        {(type === ParameterType.NUMERIC || type === ParameterType.FORMULA) && (
          <div className={containerClass}>
            <label className={commonLabelClass}>Знаков после запятой</label>
            <input
              type="number"
              min="0"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className={commonInputClass}
            />
          </div>
        )}
      </div>

      {type === ParameterType.FORMULA && (
        <div className="p-5 bg-slate-50 border border-[#DDD] rounded mb-[15px]">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Логика вычислений</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <select 
                  required
                  value={formula.initialColId}
                  onChange={e => setFormula({...formula, initialColId: e.target.value})}
                  className={commonInputClass}
                >
                  <option value="">Выберите параметр...</option>
                  {existingColumns.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            {formula.parts.map((part, index) => (
              <div key={index} className="flex items-center gap-2">
                <select 
                  value={part.operator}
                  onChange={e => handleFormulaPartChange(index, 'operator', e.target.value)}
                  className="w-12 h-[35px] border border-[#DDD] rounded text-sm font-bold text-center appearance-none cursor-pointer hover:border-[#69C]"
                >
                  <option value="+">+</option>
                  <option value="-">−</option>
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>
                <div className="flex-1 relative">
                  <select 
                    required
                    value={part.colId}
                    onChange={e => handleFormulaPartChange(index, 'colId', e.target.value)}
                    className={commonInputClass}
                  >
                    <option value="">Выберите параметр...</option>
                    {existingColumns.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
                <button type="button" onClick={() => handleRemoveFormulaPart(index)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}

            <button type="button" onClick={handleAddFormulaPart} className="w-full py-2 border border-dashed border-[#DDD] rounded text-[11px] text-slate-400 hover:bg-white hover:border-[#69C] transition-all flex items-center justify-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Добавить параметр
            </button>

            <div className="pt-4 border-t border-slate-100 mt-2">
              <label className={commonLabelClass}>Формат вывода</label>
              <div className="flex gap-2">
                {Object.values(FormulaOutputType).map((outType) => (
                  <button
                    key={outType}
                    type="button"
                    onClick={() => setFormula({ ...formula, outputType: outType })}
                    className={`flex-1 py-2 text-[11px] rounded border transition-all ${
                      formula.outputType === outType 
                        ? 'bg-[#69C] border-[#69C] text-white font-bold shadow-sm' 
                        : 'bg-white border-[#DDD] text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {outType}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {type === ParameterType.LIST && (
        <div className="p-5 bg-slate-50 border border-[#DDD] rounded mb-[15px]">
          <div className="flex items-center justify-between mb-3">
            <label className={commonLabelClass}>Элементы списка</label>
            <button
              type="button"
              onClick={() => setIsMultiSelect(!isMultiSelect)}
              className={`flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded border transition-all ${isMultiSelect ? 'bg-[#69C]/10 border-[#69C]/30 text-[#69C]' : 'bg-white border-[#DDD] text-slate-400'}`}
            >
              Множественный выбор
              <div className={`w-3 h-3 rounded-full border ${isMultiSelect ? 'bg-[#69C] border-[#69C]' : 'border-[#DDD]'}`}></div>
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className={commonInputClass}
                  placeholder={`Вариант ${index + 1}...`}
                />
                <button type="button" onClick={() => handleRemoveOption(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddOption} className="w-full mt-3 py-2 border border-dashed border-[#DDD] rounded text-[11px] text-slate-400 hover:bg-white hover:border-[#69C] transition-all flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            Добавить значение
          </button>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-6 h-[35px] text-[12px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Отменить</button>
        <button type="submit" className="px-8 h-[35px] text-[12px] font-bold text-white bg-[#69C] hover:opacity-90 rounded shadow-md transition-all active:scale-95 uppercase tracking-widest">
          {editColumn ? 'СОХРАНИТЬ' : 'СОЗДАТЬ'}
        </button>
      </div>
    </form>
  );
};

export default CustomParameterForm;
