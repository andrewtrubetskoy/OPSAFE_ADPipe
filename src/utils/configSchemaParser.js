/**
 * Parses class ConfigSchema(BaseModel) definitions & DataType from Python script code.
 */

export function parseScriptDataType(code) {
  if (!code || typeof code !== 'string') return null;
  const match = code.match(/\bDataType\s*=\s*Literal\s*\[\s*(["'])([^"'\s]+)\1\s*\]/);
  return match ? match[2] : null;
}

export function parseConfigSchema(code) {
  if (!code || typeof code !== 'string') return [];

  // Locate class ConfigSchema block
  const classMatch = code.match(/class\s+ConfigSchema\s*\([^)]*\):([\s\S]*?)(?=\nclass\s|\ndef\s|$)/);
  if (!classMatch) return [];

  const classBody = classMatch[1];
  // Match lines like: threshold: float = Field(default=0.5, ge=0.0, le=1.0, multiple_of=0.1, title="Поріг чутливості")
  const fieldRegex = /^\s*([a-zA-Z_]\w*)\s*:\s*([a-zA-Z_]\w*)\s*=\s*Field\s*\(([\s\S]*?)\)/gm;

  const fields = [];
  let match;

  while ((match = fieldRegex.exec(classBody)) !== null) {
    const fieldName = match[1];
    const fieldType = match[2]; // 'float', 'int', 'str', 'bool'
    const argsStr = match[3];

    const getArgValue = (argName) => {
      const regex = new RegExp(`\\b${argName}\\s*=\\s*("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|[^,\\)]+)`);
      const m = argsStr.match(regex);
      if (!m) return null;
      let val = m[1].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        return val.slice(1, -1);
      }
      if (val === 'True') return true;
      if (val === 'False') return false;
      const num = Number(val);
      return isNaN(num) ? val : num;
    };

    const title = getArgValue('title') || fieldName;
    const desc = getArgValue('description') || '';
    const defaultValue = getArgValue('default') ?? (fieldType === 'int' || fieldType === 'float' ? 0 : fieldType === 'bool' ? false : '');
    const minVal = getArgValue('ge') ?? getArgValue('gt') ?? getArgValue('min') ?? 0;
    const maxVal = getArgValue('le') ?? getArgValue('lt') ?? getArgValue('max') ?? 100;
    const stepVal = getArgValue('multiple_of') ?? getArgValue('step') ?? (fieldType === 'int' ? 1 : 0.1);

    fields.push({
      name: fieldName,
      type: fieldType,
      title,
      desc,
      default: defaultValue,
      min: minVal,
      max: maxVal,
      step: stepVal,
    });
  }

  return fields;
}
