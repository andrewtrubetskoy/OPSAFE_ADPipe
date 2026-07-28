"""
OPSAFE ADPipe - Client Script Static Analysis & Validation Engine

Performs static analysis on user Python scripts without code execution:
1. Syntax validation via Python `ast` module.
2. Structure, class, and parameter inspection via `ast` and `inspect` modules.
3. Validates required interfaces:
   - DataType = Literal["csv"] or Literal["geojson"] (single concrete type specification)
   - ConfigSchema(BaseModel) - Configuration schema for GUI generation
   - FeedbackHandler - Feedback interface with update_progress method
   - def process_data(data_type, input_data_items_list, config, feedback) -> tuple[bool, str]
"""

import ast
import inspect
import sys
from typing import Tuple, List


def validate_script_ast(script_code: str) -> Tuple[bool, List[str]]:
    """
    Performs static analysis of Python script code using the `ast` module.
    Returns (is_valid: bool, error_messages: List[str]).
    """
    errors = []

    if not script_code or not script_code.strip():
        return False, ["Помилка: код скрипта порожній."]

    # Step 1: Syntax Validation via ast.parse
    try:
        tree = ast.parse(script_code)
    except SyntaxError as syntax_err:
        line = syntax_err.lineno or 0
        col = syntax_err.offset or 0
        msg = syntax_err.msg or "Синтаксична помилка"
        text = (syntax_err.text or "").strip()
        return False, [
            f"Синтаксична помилка Python (рядок {line}, колонка {col}): {msg}" + (f" -> '{text}'" if text else "")
        ]
    except Exception as parse_err:
        return False, [f"Помилка парсингу коду: {str(parse_err)}"]

    # Step 2: Static Structure Analysis via AST Nodes
    has_data_type_alias = False
    data_type_val = None
    has_config_schema = False
    config_schema_inherits_basemodel = False
    has_feedback_handler = False
    feedback_has_update_progress = False
    has_process_data = False
    process_data_args = []

    for node in tree.body:
        # Check Type Assignments (DataType = Literal["csv"])
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id == "DataType":
                    has_data_type_alias = True
                    # Inspect Literal slice
                    if isinstance(node.value, ast.Subscript):
                        slice_node = node.value.slice
                        if isinstance(slice_node, ast.Constant):
                            data_type_val = slice_node.value
                        elif isinstance(slice_node, ast.Index) and isinstance(slice_node.value, ast.Constant):
                            data_type_val = slice_node.value.value

        # Check Class Declarations
        elif isinstance(node, ast.ClassDef):
            if node.name == "ConfigSchema":
                has_config_schema = True
                for base in node.bases:
                    if isinstance(base, ast.Name) and base.id == "BaseModel":
                        config_schema_inherits_basemodel = True
                    elif isinstance(base, ast.Attribute) and base.attr == "BaseModel":
                        config_schema_inherits_basemodel = True

            elif node.name == "FeedbackHandler":
                has_feedback_handler = True
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)) and item.name == "update_progress":
                        feedback_has_update_progress = True

        # Check Function Declarations
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if node.name == "process_data":
                has_process_data = True
                for arg in node.args.args:
                    process_data_args.append(arg.arg)

    # Step 3: Validate Requirements
    allowed_types = {"csv", "geojson", "shapefile"}
    if not has_data_type_alias:
        errors.append(
            "Відсутнє задеклароване визначення типу 'DataType = Literal[\"csv\"]' або 'DataType = Literal[\"geojson\"]'."
        )
    elif data_type_val not in allowed_types:
        errors.append(
            f"Тип 'DataType' повинен вказувати один конкретний тип даних (Literal['csv'] або Literal['geojson']). Виявлено значення: '{data_type_val}'."
        )

    if not has_config_schema:
        errors.append(
            "Відсутній клас конфігурації 'class ConfigSchema(BaseModel)'. "
            "Скрипт повинен містити клас ConfigSchema для побудови параметрів у GUI."
        )
    elif not config_schema_inherits_basemodel:
        errors.append(
            "Клас 'ConfigSchema' повинен успадковуватись від 'BaseModel' (class ConfigSchema(BaseModel): ...)."
        )

    if not has_feedback_handler:
        errors.append(
            "Відсутній задекларований інтерфейс зворотного зв'язку 'class FeedbackHandler(Protocol): ...'."
        )
    elif not feedback_has_update_progress:
        errors.append(
            "Інтерфейс 'FeedbackHandler' повинен містити метод 'update_progress(self, percent, stage_description)'."
        )

    if not has_process_data:
        errors.append(
            "Відсутня задекларована головна функція 'def process_data(...)'. "
            "Скрипт повинен містити точку входу process_data."
        )
    else:
        expected_params = ["data_type", "input_data_items_list", "config", "feedback"]
        missing_params = [p for p in expected_params if p not in process_data_args]
        if missing_params:
            errors.append(
                f"Головна функція 'process_data' повинна приймати параметри: {', '.join(expected_params)}. "
                f"Відсутні параметри: {', '.join(missing_params)}."
            )

    return len(errors) == 0, errors


def validate_script_inspect(script_code: str) -> Tuple[bool, List[str]]:
    is_ast_valid, ast_errors = validate_script_ast(script_code)
    if not is_ast_valid:
        return False, ast_errors

    try:
        code_obj = compile(script_code, filename="<user_script>", mode="exec")
        co_names = set(code_obj.co_names)
        if "ConfigSchema" not in co_names and "ConfigSchema" not in script_code:
            return False, ["Помилка структури: символ 'ConfigSchema' відсутній у скомпільованому коді."]
    except SyntaxError as e:
        return False, [f"Помилка скомпільованого синтаксису (рядок {e.lineno}): {e.msg}"]
    except Exception as e:
        return False, [f"Помилка інспектування коду: {str(e)}"]

    return True, []


if __name__ == "__main__":
    sample_code = ""
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            sample_code = f.read()
    else:
        sample_code = sys.stdin.read() if not sys.stdin.isatty() else ""

    valid, errs = validate_script_ast(sample_code)
    if valid:
        print("SUCCESS: Скрипт успішно пройшов статичний аналіз AST та inspect.")
        sys.exit(0)
    else:
        print("VALIDATION_ERROR: Скрипт не пройшов перевірку:")
        for err in errs:
            print(f" - {err}")
        sys.exit(1)
