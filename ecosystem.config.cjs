module.exports = {
  apps: [
    /* ---------------- INFLUXDB ---------------- */
    {
      name: "influxdb",
      script: "C:\\Users\\Saloni\\Downloads\\influxdb2-2.8.0-windows_amd64\\influxd.exe",
      autorestart: true,
      out_file: "./logs/influxdb-out.log",
      error_file: "./logs/influxdb-error.log",
    },

    /* ---------------- TELEGRAF ---------------- */
    {
      name: "telegraf",
      script: "C:\\Users\\Saloni\\Downloads\\telegraf-1.37.1_windows_amd64\\telegraf-1.37.1\\telegraf.exe",
      args: "--config \"C:\\CNC\\cnc_sim\\cnc.conf\"",
      autorestart: true,
      out_file: "./logs/telegraf-out.log",
      error_file: "./logs/telegraf-error.log",
    },




    /* ---------------- FASTAPI BACKEND ---------------- */
    {
      name: "backend-api",
      script: "C:\\CNC\\.venv\\Scripts\\python.exe",
      args: "-m uvicorn app.main:app --host 0.0.0.0 --port 8000",
      cwd: "./backend",
      autorestart: true,
      out_file: "./logs/backend-out.log",
      error_file: "./logs/backend-error.log",
    },

    /* ---------------- FRONTEND ---------------- */
    {
      name: "frontend",
      script: "cmd.exe",
      args: "/c npm run dev",
      cwd: "./frontend",
      autorestart: true,
      out_file: "./logs/frontend-out.log",
      error_file: "./logs/frontend-error.log",
    },
  ],
};
