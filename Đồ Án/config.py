# Thông tin tài khoản Adafruit IO
ADAFRUIT_IO_USERNAME = "xamnhach"
ADAFRUIT_IO_KEY = "aio_ybHl30sJ7mXIJIva1XZ0abwSelJ4"

# Cấu hình phần cứng
COM_PORT = "COM3" 
BAUD_RATE = 115200

# Ngưỡng logic tự động
SOIL_THRESHOLD = 50 
TEMP_THRESHOLD = 35

# KEY CỦA FEED
FEEDS_SENSOR = {
    'T': 'sensor1',  # Temperature
    'H': 'sensor2',  # Humidity
    'S': 'sensor3',  # Soil Moisture
    'L': 'sensor4'   # Light
}
FEED_PUMP = 'button1'
FEED_RELAY = 'button2'
FEED_LCD = 'lcd-display'
FEED_RGB = 'color-rgb'