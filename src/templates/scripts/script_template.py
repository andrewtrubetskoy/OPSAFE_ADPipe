from typing import Literal, Protocol
from pydantic import BaseModel, Field

# ==============================================================================
# ВКАЖІТЬ ТИП ДАНИХ ДЛЯ ВХОДУ ТА ВИХОДУ:
# Оберіть один конкретний тип зі списку: Literal["csv"] або Literal["geojson"]
# ==============================================================================
DataType = Literal["csv"]       # Вкажіть "csv" або "geojson"

# 1. Схема конфігурації для побудови GUI
class ConfigSchema(BaseModel):
    threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        multiple_of=0.1,
        title="Поріг чутливості"
    )
    max_retries: int = Field(
        default=3,
        ge=0,
        le=10,
        multiple_of=1,
        title="Кількість спроб"
    )


# 2. Інтерфейс зворотного зв'язку
class FeedbackHandler(Protocol):
    def update_progress(self, percent: float, stage_description: str) -> None:
        ...


# 3. Головна функція
def process_data(
    data_type: DataType,
    input_data_items_list: list[str],
    config: ConfigSchema,
    feedback: FeedbackHandler
) -> tuple[bool, str]:
    
    try:
        feedback.update_progress(0.0, f"Старт обробки файлу типу {data_type}")
        
        total_items = len(input_data_items_list)
        processed_lines = []
        
        for index, item in enumerate(input_data_items_list, start=1):
            # --- Логіка обробки клієнта ---
            processed_lines.append(item.strip().upper())
            
            # Відправка прогресу
            progress = (index / total_items) * 100
            feedback.update_progress(progress, f"Оброблено елементів: {index}/{total_items}")

        # Збираємо фінальний результат
        result_output = "\n".join(processed_lines)
        
        feedback.update_progress(100.0, "Завершено успішно")
        
        # Повертаємо (Успіх, Результат)
        return True, result_output

    except Exception as e:
        # У разі збою повертаємо (Невдача, Текст помилки)
        return False, f"Помилка під час виконання: {str(e)}"