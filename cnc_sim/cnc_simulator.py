import json
import time
import random
import threading
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

# ---------------- STATE MAP ----------------
STATE_MAP = {
    "STOPPED": 0,
    "RUNNING": 1,
    "IDLE": 2
}

JOBS = [101, 102, 103]

# ---------------- CNC CLASS ----------------
class CNCMachine:
    def __init__(self, machine_id, client, job_run=(20, 40), job_idle=(5, 10)):
        self.machine_id = machine_id
        self.client = client
        self.job_run = job_run
        self.job_idle = job_idle

        self.status = "IDLE"
        self.running_time = 0
        self.part_count = 0
        self.temperature = 35.0
        self.current_job = None

        self.lock = threading.Lock()

        self.TOPIC_TELEMETRY = f"cnc/{machine_id}/telemetry"
        self.TOPIC_STATE = f"cnc/{machine_id}/state"
        self.TOPIC_BUSINESS = f"cnc/{machine_id}/business"
        self.TOPIC_JOB = f"cnc/{machine_id}/job"

    # -------- STATE (1 Hz) --------
    def publish_state(self):
        while True:
            with self.lock:
                payload = {
                    "machine_state": STATE_MAP[self.status],
                    "timestamp": int(time.time() * 1000)
                }
            self.client.publish(self.TOPIC_STATE, json.dumps(payload))
            time.sleep(1)

    # -------- TELEMETRY: SPEED (100 Hz) --------
    def publish_spindle_speed(self):
        while True:
            with self.lock:
                speed = random.randint(1000, 6000) if self.status == "RUNNING" else 0
                payload = {
                    "spindle_speed": speed,
                    "timestamp": int(time.time() * 1000)
                }
            self.client.publish(self.TOPIC_TELEMETRY, json.dumps(payload))
            time.sleep(0.01)

    # -------- TELEMETRY: TEMP (10 Hz) --------
    def publish_temperature(self):
        while True:
            with self.lock:
                if self.status == "RUNNING":
                    self.temperature += random.uniform(0.0, 0.3)
                else:
                    self.temperature -= random.uniform(0.0, 0.2)

                self.temperature = max(30.0, min(self.temperature, 75.0))
                payload = {
                    "temperature": round(self.temperature, 2),
                    "timestamp": int(time.time() * 1000)
                }
            self.client.publish(self.TOPIC_TELEMETRY, json.dumps(payload))
            time.sleep(0.1)

    # -------- TELEMETRY: RUNTIME (1 Hz) --------
    def publish_running_time(self):
        while True:
            with self.lock:
                if self.status == "RUNNING":
                    self.running_time += 1

                payload = {
                    "running_time": self.running_time,
                    "timestamp": int(time.time() * 1000)
                }
            self.client.publish(self.TOPIC_TELEMETRY, json.dumps(payload))
            time.sleep(1)

    # -------- BUSINESS (1 Hz) --------
    def publish_business(self):
        while True:
            with self.lock:
                if self.status == "RUNNING" and self.running_time % 5 == 0:
                    self.part_count += 1

                payload = {
                    "part_count": self.part_count,
                    "timestamp": int(time.time() * 1000)
                }
            self.client.publish(self.TOPIC_BUSINESS, json.dumps(payload))
            time.sleep(1)

    # -------- JOB EVENTS --------
    def publish_job_event(self, job_id, event):
        payload = {
            "job_id": job_id,
            "event": event,  # 1 = start, 0 = end
            "timestamp": int(time.time() * 1000)
        }
        self.client.publish(self.TOPIC_JOB, json.dumps(payload))

    # -------- JOB SIMULATOR --------
    def simulate_jobs(self):
        while True:
            job_id = random.choice(JOBS)

            # Job start
            with self.lock:
                self.current_job = job_id
                self.status = "RUNNING"

            self.publish_job_event(job_id, 1)
            print(f"[{self.machine_id}] Job {job_id} STARTED")

            # Job execution time
            time.sleep(random.randint(*self.job_run))

            # Job end
            with self.lock:
                self.current_job = None
                self.status = "IDLE"

            self.publish_job_event(job_id, 0)
            print(f"[{self.machine_id}] Job {job_id} ENDED")

            time.sleep(random.randint(*self.job_idle))

    # -------- START ALL THREADS --------
    def start(self):
        threads = [
            threading.Thread(target=self.publish_state),
            threading.Thread(target=self.publish_spindle_speed),
            threading.Thread(target=self.publish_temperature),
            threading.Thread(target=self.publish_running_time),
            threading.Thread(target=self.publish_business),
            threading.Thread(target=self.simulate_jobs),
        ]

        for t in threads:
            t.daemon = True
            t.start()


# ---------------- MAIN ----------------
client = mqtt.Client()
client.connect(BROKER, PORT, 60)

print("Multi-CNC Simulator with Job Events Started")

machines = [
    CNCMachine("machine1", client, job_run=(30, 50), job_idle=(5, 10)),
    CNCMachine("machine2", client, job_run=(15, 25), job_idle=(10, 20)),
]

for machine in machines:
    machine.start()

while True:
    time.sleep(1)
