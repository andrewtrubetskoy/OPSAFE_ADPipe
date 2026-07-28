/**
 * ADPipe Client Script Static Analysis & Validation Engine
 * Aligned with client_script_validation.py:
 * 1. Static syntax analysis (unbalanced quotes/brackets/invalid tokens).
 * 2. DataType = Literal["csv"] or Literal["geojson"] single concrete type declaration.
 * 3. class ConfigSchema(BaseModel) structure inspection.
 * 4. FeedbackHandler interface inspection.
 * 5. def process_data(data_type, input_data_items_list, config, feedback) parameter inspection.
 */

export function validatePythonScript(code) {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return {
      isValid: false,
      errors: ['Помилка: код скрипта порожній.'],
    };
  }

  const errors = [];

  // 1. Basic Static Syntax Analysis (brackets, quotes)
  const syntaxError = checkBasicSyntax(code);
  if (syntaxError) {
    errors.push(syntaxError);
  }

  // 2. Inspect DataType = Literal["csv"] or Literal["geojson"]
  const dataTypeMatch = code.match(/\bDataType\s*=\s*Literal\s*\[\s*(["'])([^"'\s]+)\1\s*\]/);
  if (!dataTypeMatch) {
    errors.push(
      "Скрипт повинен однозначно вказувати один конкретний тип даних, наприклад: DataType = Literal[\"csv\"] або DataType = Literal[\"geojson\"]."
    );
  }

  // 3. Inspect ConfigSchema(BaseModel)
  const hasConfigSchemaClass = /\bclass\s+ConfigSchema\b/.test(code);
  if (!hasConfigSchemaClass) {
    errors.push(
      "Відсутній клас конфігурації 'class ConfigSchema(BaseModel)'. " +
      "Скрипт повинен містити ConfigSchema для зчитування налаштувань у GUI."
    );
  } else {
    const inheritsBaseModel = /\bclass\s+ConfigSchema\s*\([^)]*BaseModel[^)]*\)/.test(code);
    if (!inheritsBaseModel) {
      errors.push(
        "Клас 'ConfigSchema' повинен успадковуватись від 'BaseModel' (наприклад: class ConfigSchema(BaseModel): ...)."
      );
    }
  }

  // 4. Inspect FeedbackHandler
  const hasFeedbackHandler = /\bclass\s+FeedbackHandler\b/.test(code);
  if (!hasFeedbackHandler) {
    errors.push(
      "Відсутній задекларований інтерфейс зворотного зв'язку 'class FeedbackHandler(Protocol): ...'."
    );
  } else {
    const hasUpdateProgress = /\bdef\s+update_progress\s*\(/.test(code);
    if (!hasUpdateProgress) {
      errors.push(
        "Інтерфейс 'FeedbackHandler' повинен містити метод 'def update_progress(self, percent, stage_description)'."
      );
    }
  }

  // 5. Inspect process_data Function Signature
  const processDataMatch = code.match(/\bdef\s+process_data\s*\(([^)]*)\)/s);
  if (!processDataMatch) {
    errors.push(
      "Відсутня задекларована головна функція 'def process_data(...)'. " +
      "Скрипт повинен містити точку входу process_data."
    );
  } else {
    const paramsString = processDataMatch[1];
    const expectedParams = ['data_type', 'input_data_items_list', 'config', 'feedback'];
    const missingParams = expectedParams.filter((param) => !paramsString.includes(param));

    if (missingParams.length > 0) {
      errors.push(
        `Головна функція 'process_data' повинна містити параметри: ${expectedParams.join(', ')}. ` +
        `Відсутні параметри: ${missingParams.join(', ')}.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function checkBasicSyntax(src) {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let line = 1;
  const stack = [];

  for (let i = 0; i < src.length; i++) {
    const char = src[i];
    if (char === '\n') line++;

    if (char === "'" && !inDoubleQuote && src[i - 1] !== '\\') {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && src[i - 1] !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === '(' || char === '[' || char === '{') {
        stack.push({ char, line });
      } else if (char === ')' || char === ']' || char === '}') {
        if (stack.length === 0) {
          return `Синтаксична помилка (рядок ${line}): незакрита дужка '${char}'.`;
        }
        const last = stack.pop();
        const expected = last.char === '(' ? ')' : last.char === '[' ? ']' : '}';
        if (char !== expected) {
          return `Синтаксична помилка (рядок ${line}): очікувалась '${expected}', отримано '${char}'.`;
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack.pop();
    return `Синтаксична помилка (рядок ${unclosed.line}): незакрита дужка '${unclosed.char}'.`;
  }

  return null;
}
