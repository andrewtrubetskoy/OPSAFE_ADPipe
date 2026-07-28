import importlib.util
import inspect
from typing import Literal, get_args, get_origin
from pydantic import BaseModel


def validate_client_script(file_path: str) -> tuple[bool, str]:
    """
    Валідує скрипт клієнта на відповідність контракту (script_template.py).
    Повертає (True, "OK") або (False, "Опис помилки").
    """
    # 1. Спроба завантажити файл як Python-модуль
    try:
        spec = importlib.util.spec_from_file_location("user_script", file_path)
        if spec is None or spec.loader is None:
            return False, "Не вдалося зчитати Python-файл."
        
        user_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(user_module)
    except Exception as e:
        return False, f"Синтаксична помилка у коді скрипта: {e}"

    # 2. Перевірка наявності та конкретності типу DataType = Literal["csv"] або Literal["geojson"]
    if not hasattr(user_module, "DataType"):
        return False, "У скрипті відсутнє оголошення типу 'DataType'."
    
    data_type_alias = getattr(user_module, "DataType")
    dt_origin = get_origin(data_type_alias)
    dt_args = get_args(data_type_alias)

    allowed_types = {"csv", "geojson", "shapefile"}
    if dt_origin is not Literal or len(dt_args) != 1 or dt_args[0] not in allowed_types:
        return False, (
            f"Тип 'DataType' повинен однозначно вказувати один конкретний тип даних, "
            f"наприклад: DataType = Literal['csv'] або DataType = Literal['geojson']. Виявлено: {data_type_alias}"
        )

    # 3. Перевірка наявності ConfigSchema
    if not hasattr(user_module, "ConfigSchema"):
        return False, "У скрипті відсутній клас 'ConfigSchema'."
    
    config_cls = getattr(user_module, "ConfigSchema")
    if not (isinstance(config_cls, type) and issubclass(config_cls, BaseModel)):
        return False, "Клас 'ConfigSchema' повинен успадковуватися від pydantic.BaseModel."

    # 4. Перевірка наявності FeedbackHandler
    if not hasattr(user_module, "FeedbackHandler"):
        return False, "У скрипті відсутній задекларований інтерфейс 'FeedbackHandler'."

    # 5. Перевірка наявності process_data
    if not hasattr(user_module, "process_data"):
        return False, "У скрипті відсутня функція 'process_data'."
    
    func = getattr(user_module, "process_data")
    if not inspect.isfunction(func):
        return False, "'process_data' має бути функцією."

    # 6. Перевірка сигнатури функції
    sig = inspect.signature(func)
    params = list(sig.parameters.values())

    # Перевіряємо кількість параметрів (очікуємо 4: data_type, input_data_items_list, config, feedback)
    if len(params) != 4:
        return False, f"Функція 'process_data' повинна приймати рівно 4 параметри, виявлено: {len(params)}."

    expected_param_names = ["data_type", "input_data_items_list", "config", "feedback"]
    actual_param_names = [p.name for p in params]

    if actual_param_names != expected_param_names:
        return False, f"Невірна назва або порядок параметрів. Очікувалося: {expected_param_names}, виявлено: {actual_param_names}"

    # 7. Перевірка Return Type Hint
    return_annotation = sig.return_annotation
    
    origin = get_origin(return_annotation)
    args = get_args(return_annotation)

    if origin is not tuple or args != (bool, str):
        return False, f"Функція 'process_data' повинна явно повертати 'tuple[bool, str]'. Виявлено: {return_annotation}"

    return True, "Скрипт повністю відповідає вимогам."