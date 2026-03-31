import serial
import serial.tools.list_ports

class YoloSerial:
    def __init__(self, baud):
        port = self.get_port()
        self.ser = None
        
        if port != "None":
            try:
                self.ser = serial.Serial(port, baud, timeout=1)
                print(f"[SERIAL] Connected to {port}")
            except Exception as e:
                print(f"[SERIAL] Error connecting to {port}: {e}")
        else:
            print(f"[SERIAL] No YoloBit/USB Device found. Simulation Mode.")

    def get_port(self):
        ports = serial.tools.list_ports.comports()
        commPort = "None"
        # Duyệt qua tất cả các cổng tìm thấy
        for port in ports:
            strPort = str(port)
            # Kiểm tra nhiều từ khóa nhận diện mạch nạp của YoloBit
            if "USB Serial" in strPort or "CP210" in strPort or "CH340" in strPort:
                splitPort = strPort.split(" ")
                commPort = splitPort[0]
                break # Dừng lại ngay khi tìm thấy mạch
        return commPort

    def read_full_data(self):
        if self.ser and self.ser.in_waiting > 0:
            try:
                line = self.ser.readline().decode('utf-8').strip()
                if not line or ':' not in line: return None
                parts = line.split(',')
                data = {}
                for p in parts:
                    if ':' in p:
                        k, v = p.split(':')
                        data[k.strip()] = float(v.strip())
                return data
            except: return None
        return None

    def send_command(self, prefix, value):
        if self.ser:
            cmd = f"!{prefix}:{value}#\n"
            self.ser.write(cmd.encode())