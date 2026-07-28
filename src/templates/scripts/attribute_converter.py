# OPSAFE ADPipe - Attribute Converter Template
import pandas as pd

def process(input_data_list):
    """
    Конвертація та об'єднання кількох джерел даних у підсумкову атрибутивну таблицю
    """
    results = []
    for item in input_data_list:
        if isinstance(item, pd.DataFrame):
            results.append(item)
            
    if not results:
        return pd.DataFrame()
        
    combined_df = pd.concat(results, ignore_index=True)
    return combined_df
