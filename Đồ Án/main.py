import time
import config
from adafruit_handler import AdafruitGateway
from serial_handler import YoloSerial

# Khai báo trạng thái thiết bị
current_pump = 0
last_publish = 0

# Hàm hỗ trợ chuyển đổi Hex sang RGB để gửi xuống YoloBit
def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def handle_message(client, feed_id, payload):
    global current_pump
    print(f"[CLOUD] Lệnh nhận được: {feed_id} -> {payload}")
    
    # 1. Điều khiển Bơm
    if feed_id == config.FEED_PUMP:
        current_pump = int(payload)
        yolo.send_command("PUMP", current_pump)
        
    # 2. Điều khiển Relay
    elif feed_id == config.FEED_RELAY:
        yolo.send_command("RELAY", int(payload))
        
    # 3. Điều khiển Màu đèn RGB (Chỉ đổi màu khi bạn chọn trên Dashboard)
    elif feed_id == config.FEED_RGB:
        try:
            r, g, b = hex_to_rgb(payload)
            yolo.send_command("RGB", f"{r},{g},{b}")
            print(f"[SERIAL] Gửi màu RGB: {r},{g},{b}")
        except:
            print("[ERROR] Sai định dạng màu Hex từ Dashboard")

# Khởi tạo kết nối
yolo = YoloSerial(config.BAUD_RATE) 
ada = AdafruitGateway(handle_message)

print("Hệ thống bắt đầu chạy ở chế độ ĐIỀU KHIỂN THỦ CÔNG...")

while True:
    # Luôn lắng nghe lệnh từ Adafruit
    ada.loop()
    
    # Đọc dữ liệu từ YoloBit
    data = yolo.read_full_data()
    
    if data:
        now = time.time()
        
        # Gửi dữ liệu định kỳ lên Dashboard (Data Rate < 30)
        # Tăng lên 30 giây để hệ thống ổn định nhất
        if now - last_publish > 15: 
            # Gửi các chỉ số cảm biến (T, H, S, L)
            ada.publish_all(data)
            
            # Cập nhật dòng trạng thái lên LCD ảo trên Dashboard
            t, s = data.get('T', 0), data.get('S', 0)
            p_st = "ON" if current_pump == 1 else "OFF"
            # Lấy thêm trạng thái Relay từ YoloBit gửi lên (R)
            r_st = "ON" if data.get('R') == 1 else "OFF"
            
            lcd_msg = f"PUMP:{p_st} | RELAY:{r_st} | T:{t} H:{data.get('H',0)} | S:{s}"
            ada.client.publish(config.FEED_LCD, lcd_msg)
            
            last_publish = now
            print(f"[STATUS] Đã cập nhật dữ liệu lên Dashboard lúc: {time.ctime(now)}")

    # Nghỉ ngắn để không treo CPU
    time.sleep(0.1)
