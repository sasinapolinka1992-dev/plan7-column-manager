
import { ParameterType, Column } from './types';

export const INITIAL_COLUMNS: { [key: string]: Column[] } = {
  main: [
    { id: 'plan7_id', label: '* ID на Plan7', visible: true },
    { id: 'room_type', label: 'Тип помещения', visible: true },
    { id: 'status_buyer', label: '* Статус для покупателей', visible: true },
    { id: 'finish_quality', label: 'Качество отделки (Авито)', visible: true },
    { id: 'avito_type', label: 'Авито.Коммерция. Вид объекта', visible: true },
    { id: 'avito_entrance', label: 'Авито.Коммерция. Вход', visible: true },
    { id: 'avito_planning', label: 'Авито.Коммерция. Планировка', visible: true },
    { id: 'dev_id', label: '* ID у застройщика', visible: false },
    { id: 'building', label: 'Здание', visible: false },
    { id: 'room_num', label: 'Номер помещения', visible: false },
    { id: 'area', label: 'Площадь', visible: true },
    { id: 'price_m2', label: 'Цена за м.кв', visible: true },
    { id: 'total_price', label: 'Стоимость', visible: false },
  ],
  additional: [
    { id: 'tags', label: 'Теги', visible: false },
    { id: 'link', label: 'Ссылка', visible: false },
    { id: 'class', label: 'Класс жилья', visible: false },
  ]
};
