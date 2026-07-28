import bufferFilterCode from './buffer_filter.py?raw';
import attributeConverterCode from './attribute_converter.py?raw';

export const SCRIPT_TEMPLATES = [
  {
    id: 'buffer_filter',
    name: 'Буферна зона (Spatial Buffer)',
    desc: 'Шаблон побудови буферної зони навколо об\'єктів у геопросторі',
    inputType: 'geojson',
    outputType: 'geojson',
    code: bufferFilterCode,
  },
  {
    id: 'attribute_converter',
    name: 'Обробник атрибутів (Attribute Converter)',
    desc: 'Шаблон конвертації та фільтрації підсумкової атрибутивної таблиці',
    inputType: 'csv',
    outputType: 'csv',
    code: attributeConverterCode,
  },
];
