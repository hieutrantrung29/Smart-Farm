import time
import random
from Adafruit_IO import MQTTClient

# --- CẤU HÌNH THÔNG TIN ---
ADAFRUIT_IO_USERNAME = "xamnhach"
ADAFRUIT_IO_KEY = "aio_JpLc88HYr3e7JXUZOe4PeL3P8zJL"

# Biến lưu trạng thái giả lập
current_pump = 0
current_relay = 0

def connected(client):
    print("=== KẾT NỐI ADAFRUIT THÀNH CÔNG ===")
    client.subscribe('button1')      
    client.subscribe('button2')      
    client.subscribe('color-rgb')    
    client.publish('lcd-display', "System: Testing...")

def message(client, feed_id, payload):
    global current_pump, current_relay
    print(f"\n[DASHBOARD] Feed '{feed_id}' gửi lệnh: {payload}")
    if feed_id == 'button1':
        current_pump = int(payload)
    elif feed_id == 'button2':
        current_relay = int(payload)

# --- KHỞI TẠO CLIENT ---
client = MQTTClient(ADAFRUIT_IO_USERNAME, ADAFRUIT_IO_KEY)
client.on_connect = connected
client.on_message = message
client.connect()
client.loop_background()

try:
    while True:
        # 1. Giả lập dữ liệu cảm biến
        t = random.randint(25, 40)   
        h = random.randint(50, 80)   
        s = random.randint(20, 90)   
        l = random.randint(100, 900) 
        
        # 2. Gửi dữ liệu lên Gauges/Charts
        client.publish('sensor1', t)
        client.publish('sensor2', h)
        client.publish('sensor3', s)
        client.publish('sensor4', l)
        
        # 3. Logic Đèn RGB và xác định nhãn trạng thái
        color_code = "#00FF00" 
        status_msg = "Normal" # Đây là biến đúng
        
        if t > 35:
            color_code = "#FF0000" 
            status_msg = "HOT!"
        elif s < 50:
            color_code = "#FFFF00" 
            status_msg = "DRY!"
            
        client.publish('color-rgb', color_code) 
        
        # 4. Hiển thị đầy đủ thông số lên LCD (Đã sửa lỗi status_text)
        p_st = "ON" if current_pump == 1 else "OFF"
        r_st = "ON" if current_relay == 1 else "OFF"
        
        # Sử dụng status_msg đã khai báo ở trên
        lcd_msg = f"[{status_msg}] P:{p_st} R:{r_st} | T:{t}C H:{h}% | S:{s}% L:{l}"
        client.publish('lcd-display', lcd_msg)
        
        print(f"\nPublishing: {lcd_msg}")
        print(f"RGB Color: {color_code}")

        # 5. Logic tự động hóa giả lập
        if s < 50 and current_pump == 0:
            current_pump = 1
            client.publish('button1', 1)
        elif s > 80 and current_pump == 1:
            current_pump = 0
            client.publish('button1', 0)

        time.sleep(15) 
        
except KeyboardInterrupt:
    print("\nKết thúc chương trình test.")
