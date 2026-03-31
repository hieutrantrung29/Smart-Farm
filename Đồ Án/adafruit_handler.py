from Adafruit_IO import MQTTClient
import config

class AdafruitGateway:
    def __init__(self, on_message_callback):
        self.client = MQTTClient(config.ADAFRUIT_IO_USERNAME, config.ADAFRUIT_IO_KEY)
        self.client.on_connect = self.connected
        self.client.on_message = on_message_callback
        self.client.connect()

    def connected(self, client):
        print("[ADAFRUIT] Connected successfully!")
        self.client.subscribe(config.FEED_PUMP)
        self.client.subscribe(config.FEED_RELAY)
        self.client.subscribe(config.FEED_RGB) # Đăng ký nhận màu từ web
        self.client.publish(config.FEED_LCD, "Gateway: Online")

    def publish_all(self, data):
        for key, feed_key in config.FEEDS_SENSOR.items():
            if key in data:
                self.client.publish(feed_key, data[key])

    def loop(self):
        self.client.loop()