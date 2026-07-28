# OPSAFE ADPipe - Python Spatial Buffer Filter Template
import geopandas as gpd

def process(input_data, buffer_dist=50.0):
    """
    Обробка геопросторового шару: побудова буферної зони навколо об'єктів
    """
    if input_data is None:
        return None
        
    # Створення буферної зони для векторних геометрій
    buffered_gdf = input_data.copy()
    buffered_gdf['geometry'] = buffered_gdf.geometry.buffer(buffer_dist)
    
    return buffered_gdf
