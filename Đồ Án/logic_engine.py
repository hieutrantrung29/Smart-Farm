# logic_engine.py
import config

# def apply_smart_logic(temp, soil, current_state):
#     # Nếu đất thấp hơn 40: Bật bơm
#     if soil < config.SOIL_THRESHOLD:
#         if current_state == 0: return 1
#     # Nếu đất từ 40 trở lên: Tắt bơm ngay lập tức để đồng bộ với LED Xanh
#     else:
#         if current_state == 1: return 0
#     return None

def get_status_color(temp, soil):
    if soil < config.SOIL_THRESHOLD:
        return "#FF0000", "DRY!"   # Đỏ: Khô
    return "#00FF00", "Normal"      # Xanh lá: Tốt
