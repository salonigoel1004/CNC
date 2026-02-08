from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    INFLUX_URL = os.getenv("INFLUX_URL")
    INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
    INFLUX_ORG = os.getenv("INFLUX_ORG")
    INFLUX_BUCKET_REALTIME = os.getenv("INFLUX_BUCKET_REALTIME")
    INFLUX_BUCKET_1S = os.getenv("INFLUX_BUCKET_1S")
    
    # Auth setting
    SECRET_KEY = os.getenv("SECRET_KEY")
    
settings = Settings()