import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import emitter from "@/lib/events";
import { sendMessage, formatSensorMessage } from "@/lib/telegram";

const API_KEY = process.env.API_KEY;
const IOT_TIMEOUT_MS = 5 * 60 * 1000;

export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== API_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Provide valid x-api-key header." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if ((body.action === "create" || !body.action) && body.data) {
      const { datetime, sensor = {}, mpc = {} } = body.data;

      if (!datetime) {
        return NextResponse.json(
          { success: false, error: "Missing required field: datetime" },
          { status: 400 }
        );
      }

      const parsedDate = new Date(datetime);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid datetime format" },
          { status: 400 }
        );
      }

      const record = await prisma.sensorData.create({
        data: {
          datetime: parsedDate,
          suhu: sensor.suhu ?? 0,
          humidity_udara: sensor.humidity_udara ?? 0,
          kelembapan_tanah: sensor.kelembapan_tanah ?? 0,
          soil2_percent: sensor.soil2_percent ?? 0,
          cahaya: sensor.cahaya ?? 0,
          natural_light_hours: sensor.natural_light_hours ?? 0,
          lamp_light_hours: sensor.lamp_light_hours ?? 0,
          total_light_hours: sensor.total_light_hours ?? 0,
          target_light_hours: sensor.target_light_hours ?? 0,
          hujan_percent: sensor.hujan_percent ?? 0,
          hujan_status: sensor.hujan_status ?? "",
          fan_status: sensor.fan_status ?? "OFF",
          pump_air_status: sensor.pump_air_status ?? "OFF",
          pump_nutrisi_status: sensor.pump_nutrisi_status ?? "OFF",
          pump_humid_status: sensor.pump_humid_status ?? "OFF",
          lamp_status: sensor.lamp_status ?? "OFF",
          dht_error: sensor.dht_error ?? false,
          soil1_error: sensor.soil1_error ?? false,
          fan_mpc_control: mpc.fan_mpc_control ?? 0,
          fan_pwm: mpc.fan_pwm ?? 0,
          soil_mpc_control: mpc.soil_mpc_control ?? 0,
          pump_on_time: mpc.pump_on_time ?? 0,
          prediction_horizon_sec: mpc.prediction_horizon_sec ?? 0,
          control_horizon_sec: mpc.control_horizon_sec ?? 0,
          manual_lock_fan: mpc.manual_lock_fan ?? false,
          manual_lock_pump3: mpc.manual_lock_pump3 ?? false,
          manual_lock_lamp: mpc.manual_lock_lamp ?? false,
          nutrient_running: mpc.nutrient_running ?? false,
          last_nutrient_epoch: mpc.last_nutrient_epoch ?? 0,
        },
      });

      const formatted = formatRecord(record);
      emitter.emit("new-data", formatted);

      const prev = await prisma.sensorData.findFirst({
        where: { id: { not: record.id } },
        orderBy: { datetime: "desc" },
      });

      const changed = !prev || isDifferent(formatRecord(prev), formatted);

      if (changed) {
        broadcastTelegram(formatted).catch(() => {});
      }

      return NextResponse.json({ success: true, data: formatted, changed }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'create'." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const latestOnly = searchParams.get("latest") === "true";

    if (latestOnly) {
      const record = await prisma.sensorData.findFirst({
        orderBy: { datetime: "desc" },
      });

      if (!record) {
        return NextResponse.json(
          { success: false, error: "No data available" },
          { status: 404 }
        );
      }

      const now = Date.now();
      const iotAgeMs = now - record.datetime.getTime();
      const iotHealthy = iotAgeMs < IOT_TIMEOUT_MS;

      const response = formatRecord(record);
      response.iot_healthy = iotHealthy;
      response.iot_last_seen_ms = iotAgeMs;

      return NextResponse.json({ success: true, data: response });
    }

    const records = await prisma.sensorData.findMany({
      orderBy: { datetime: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: records.map(formatRecord),
      total: records.length,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

async function broadcastTelegram(record) {
  const users = await prisma.telegramUser.findMany();
  if (!users.length) return;
  const msg = formatSensorMessage(record);
  for (const user of users) {
    await sendMessage(user.chatId, msg);
  }
}

function isDifferent(a, b) {
  const keys = [
    "suhu", "humidity_udara", "kelembapan_tanah", "soil2_percent",
    "cahaya", "natural_light_hours", "lamp_light_hours",
    "total_light_hours", "target_light_hours",
    "hujan_percent", "hujan_status",
    "fan_status", "pump_air_status", "pump_nutrisi_status",
    "pump_humid_status", "lamp_status",
    "dht_error", "soil1_error",
    "fan_mpc_control", "fan_pwm", "soil_mpc_control",
    "pump_on_time", "prediction_horizon_sec", "control_horizon_sec",
    "manual_lock_fan", "manual_lock_pump3", "manual_lock_lamp",
    "nutrient_running", "last_nutrient_epoch",
  ];
  return keys.some((k) => a[k] !== b[k]);
}

function formatRecord(record) {
  return {
    id: record.id,
    datetime: record.datetime.toISOString(),
    suhu: record.suhu,
    humidity_udara: record.humidity_udara,
    kelembapan_tanah: record.kelembapan_tanah,
    soil2_percent: record.soil2_percent,
    cahaya: record.cahaya,
    natural_light_hours: record.natural_light_hours,
    lamp_light_hours: record.lamp_light_hours,
    total_light_hours: record.total_light_hours,
    target_light_hours: record.target_light_hours,
    hujan_percent: record.hujan_percent,
    hujan_status: record.hujan_status,
    fan_status: record.fan_status,
    pump_air_status: record.pump_air_status,
    pump_nutrisi_status: record.pump_nutrisi_status,
    pump_humid_status: record.pump_humid_status,
    lamp_status: record.lamp_status,
    dht_error: record.dht_error,
    soil1_error: record.soil1_error,
    fan_mpc_control: record.fan_mpc_control,
    fan_pwm: record.fan_pwm,
    soil_mpc_control: record.soil_mpc_control,
    pump_on_time: record.pump_on_time,
    prediction_horizon_sec: record.prediction_horizon_sec,
    control_horizon_sec: record.control_horizon_sec,
    manual_lock_fan: record.manual_lock_fan,
    manual_lock_pump3: record.manual_lock_pump3,
    manual_lock_lamp: record.manual_lock_lamp,
    nutrient_running: record.nutrient_running,
    last_nutrient_epoch: record.last_nutrient_epoch,
  };
}