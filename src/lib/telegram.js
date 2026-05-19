const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${TOKEN}`;

export async function sendMessage(chatId, text) {
  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      const fallback = text.length > 200 ? text.substring(0, 200) + "…" : text;
      try {
        await fetch(`${API_BASE}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text: fallback }),
        });
      } catch {}
    }
    return data.ok;
  } catch (err) {
    try {
      const fallback = text.length > 200 ? text.substring(0, 200) + "…" : text;
      await fetch(`${API_BASE}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: fallback }),
      });
    } catch {}
    return false;
  }
}

export async function setWebhook(url) {
  try {
    const res = await fetch(`${API_BASE}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { ok: false };
  }
}

export function formatSensorMessage(record) {
  const lines = [
    `<b>🌱 Greenhouse Update</b>`,
    `<b>━━━━━━━━━━━━━━━━━━━</b>`,
    `⏰ ${formatDT(record.datetime)} WIB`,
    ``,
    `<b>📊 Kondisi Lingkungan</b>`,
    `🌡 Suhu: <b>${record.suhu}°C</b>${record.suhu > 35 ? " ⚠ PANAS!" : ""}`,
    `💧 Humidity Udara: <b>${record.humidity_udara}%</b>${record.humidity_udara > 80 ? " ⚠ LEMBAP!" : ""}`,
    `☀ Cahaya: <b>${record.cahaya}%</b>`,
    `💨 Fan PWM: <b>${record.fan_pwm}</b> (MPC ${record.fan_mpc_control}%)`,
    ``,
    `<b>🌧 Sensor Hujan</b>`,
    `Hujan: <b>${record.hujan_percent}%</b> — ${record.hujan_status}`,
    ``,
    `<b>🌿 Kelembapan Tanah</b>`,
    `Sensor 1: <b>${record.kelembapan_tanah}%</b>`,
    `Sensor 2: <b>${record.soil2_percent}%</b>`,
    ``,
    `<b>💡 Durasi Cahaya</b>`,
    `Alami: ${record.natural_light_hours}j | Lampu: ${record.lamp_light_hours}j`,
    `Total: <b>${record.total_light_hours}j</b> / Target ${record.target_light_hours}j`,
    ``,
    `<b>⚙ Aktuator</b>`,
    `Fan: <b>${record.fan_status}</b> | P.Air: <b>${record.pump_air_status}</b> | P.Nut: <b>${record.pump_nutrisi_status}</b>`,
    `P.Humid: <b>${record.pump_humid_status}</b> | Lampu: <b>${record.lamp_status}</b>`,
    ``,
    `<b>🧠 MPC Control</b>`,
    `Fan MPC: ${record.fan_mpc_control}% | Soil MPC: ${record.soil_mpc_control}%`,
    `Pump ON: ${record.pump_on_time}s | Horizon: ${record.prediction_horizon_sec}s`,
    ``,
    `<b>🔒 Manual Lock</b>`,
    `Fan: ${record.manual_lock_fan ? "🔒 LOCKED" : "✅ FREE"} | Pump: ${record.manual_lock_pump3 ? "🔒 LOCKED" : "✅ FREE"} | Lamp: ${record.manual_lock_lamp ? "🔒 LOCKED" : "✅ FREE"}`,
    `Nutrient: ${record.nutrient_running ? "🟢 RUNNING" : "⚪ IDLE"}`,
  ];

  const errors = [];
  if (record.dht_error) errors.push("⚠ DHT Error");
  if (record.soil1_error) errors.push("⚠ Soil1 Error");
  if (errors.length) {
    lines.push("");
    lines.push(`<b>🚨 SENSOR ERROR</b>`);
    lines.push(errors.join(" | "));
  }

  return lines.join("\n");
}

export function formatStatusMessage({ serverUptimeSec, iotHealthy, iotUptimeSec, iotLastSeenStr, sensorData }) {
  const lines = [
    `<b>📊 AlisGreenhouse Status</b>`,
    `<b>━━━━━━━━━━━━━━━━━━━</b>`,
    ``,
    `<b>🖥 Server</b>`,
    `Status: <b>✅ Online</b>`,
    `Uptime: <b>${formatDuration(serverUptimeSec)}</b>`,
    ``,
    `<b>📡 IoT Device (ESP32)</b>`,
    `Status: <b>${iotHealthy ? "✅ Healthy" : "⚠ PROBLEM — no data >5min"}</b>`,
    `Uptime: <b>${formatDuration(iotUptimeSec)}</b>`,
    `Last seen: <b>${iotLastSeenStr}</b>`,
  ];

  if (!iotHealthy) {
    lines.push("");
    lines.push(`<b>🚨 Kemungkinan masalah:</b>`);
    lines.push(`• ESP32 mati / lose power`);
    lines.push(`• WiFi disconnected`);
    lines.push(`• Lampu / power supply mati`);
    lines.push(`• Kabel sensor terputus`);
  }

  if (sensorData) {
    lines.push("");
    lines.push(`<b>━━━━━━━━━━━━━━━━━━━</b>`);
    lines.push(`<b>🌱 Data Terbaru</b>`);
    lines.push(`Suhu: <b>${sensorData.suhu}°C</b> | Humid: <b>${sensorData.humidity_udara}%</b>`);
    lines.push(`Tanah1: <b>${sensorData.kelembapan_tanah}%</b> | Tanah2: <b>${sensorData.soil2_percent}%</b>`);
    lines.push(`Cahaya: <b>${sensorData.cahaya}%</b> | Hujan: <b>${sensorData.hujan_percent}%</b> (${sensorData.hujan_status})`);
    lines.push(`Fan: <b>${sensorData.fan_status}</b> (${sensorData.fan_pwm} PWM) | Lamp: <b>${sensorData.lamp_status}</b>`);
    lines.push(`P.Air: <b>${sensorData.pump_air_status}</b> | P.Nut: <b>${sensorData.pump_nutrisi_status}</b> | P.Humid: <b>${sensorData.pump_humid_status}</b>`);
  }

  return lines.join("\n");
}

function formatDT(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function formatDuration(sec) {
  if (!sec || sec <= 0) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}