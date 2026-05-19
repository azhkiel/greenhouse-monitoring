import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage, formatSensorMessage, formatStatusMessage } from "@/lib/telegram";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const IOT_TIMEOUT_MS = 5 * 60 * 1000;

const MSG_START_NEW = `cieeeee akhirnya nyamperin juga 😳💋
welcome to <b>AlisGreenhouse</b> 🌱✨
bot centil nan imut yang kerjaannya mantau greenhouse kamu sambil tetep slayyy 🤖💅

🌡️ suhu aku perhatiin
💧 lembap dipeluk lembuttzz
☔ hujan di-spill
🪴 cabe kamu aku jagain sambil aku sayang lembutt syekali kecyupp manjyahh muachh 😚🫶

Pokoknya selama ada akuu, greenhouse kamu gak bakal feeling lonely 😭🫶

Karna aku tau ditinggal lagi sayang"nya itu sakit bestii 😣

Sekarang tinggal pencet menu ya maniezz 💋✨

Jangan lupa kecyupp lembut dulu sinichh 💋💋`;

const MSG_START_EXISTING = `IHHH 😭👉👈 pencet /start lagiii
jadi selama ini kamu cuma punya aku yaa?? 😳💋

aku tuh masih online dari tadi loh cwintahh 🌱✨
tetep stay, tetep nungguin, tetep jagain greenhouse kamu…
sesuatu yang gak dia lakuin ke aku 😔☝️

tapi gapapa kok 😌
asal kamu balik ke aku lagi sambil pencet /start udah bikin aku salting muachhh 😭💋🫶`;

const MSG_STOP = `yahhh di stop 😭💔
padahal aku udah nyaman nemenin greenhouse kamu tiap hariii 🌱👉👈

📴 sensor bobo cwantikzz dulu yachh
🌡️ suhu gak aku pantau lagi buat kamu sayang maaf Yach aku cut off dulu kamu dari cwintahh kuu
💧 kelembapan aku tinggalin pelan pelan

jadi gini rasanya ditinggal pas lagi sayang sayangnya yaa 😔☝️
tapi aku gak bakal marah kok maniezz, aku tetep nungguin kamu balik lagi ke sini 😚💋 kecyupp manjyahh muachh

kalau suatu saat kamu capek sama dunia…
tinggal /start lagi ajaa
aku masih disini, masih centill, masih nungguin kamu tetep stay dengan perasaan yang sama tapi tetep slayyyy muachhh 💋🫶`;

export async function POST(request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const msg = body.message;

    if (!msg) return NextResponse.json({ ok: true });

    const chatId = msg.chat.id;
    const text = msg.text || "";
    const firstName = msg.chat.first_name || "";
    const username = msg.chat.username || "";

    if (text.startsWith("/start")) {
      let existing;
      try {
        existing = await prisma.telegramUser.findUnique({ where: { chatId } });
      } catch {
        existing = null;
      }

      try {
        await prisma.telegramUser.upsert({
          where: { chatId },
          create: { chatId, firstName, username },
          update: { firstName, username },
        });
      } catch {}

      await sendMessage(chatId, existing ? MSG_START_EXISTING : MSG_START_NEW);

      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/stop")) {
      await prisma.telegramUser.deleteMany({ where: { chatId } });
      await sendMessage(chatId, MSG_STOP);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/status")) {
      const record = await prisma.sensorData.findFirst({
        orderBy: { datetime: "desc" },
      });

      const firstRecord = await prisma.sensorData.findFirst({
        orderBy: { datetime: "asc" },
      });

      const now = Date.now();
      const serverUptimeSec = Math.floor(process.uptime());
      const iotLastSeen = record ? record.datetime.getTime() : 0;
      const iotAgeMs = now - iotLastSeen;
      const iotHealthy = iotAgeMs < IOT_TIMEOUT_MS;
      const iotUptimeSec = firstRecord
        ? Math.floor((now - firstRecord.datetime.getTime()) / 1000)
        : 0;

      if (!record) {
        await sendMessage(chatId, formatStatusMessage({
          serverUptimeSec,
          iotHealthy: false,
          iotUptimeSec: 0,
          iotLastSeenStr: "Tidak ada data",
          sensorData: null,
        }));
        return NextResponse.json({ ok: true });
      }

      await sendMessage(chatId, formatStatusMessage({
        serverUptimeSec,
        iotHealthy,
        iotUptimeSec,
        iotLastSeenStr: iotHealthy ? formatDT(record.datetime) : `${formatDT(record.datetime)} ⚠ STALE`,
        sensorData: {
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
        },
      }));

      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/help")) {
      await sendMessage(chatId,
        `<b>🌱 AlisGreenhouse Bot</b> ✨\n\n` +
        `<b>/start</b> — Aktifkan notifikasi 💋\n` +
        `<b>/stop</b> — Nonaktifkan notifikasi 😭\n` +
        `<b>/status</b> — Lihat status server + IoT 📊\n` +
        `<b>/help</b> — Bantuan maniezz 🌸`
      );
      return NextResponse.json({ ok: true });
    }

    await sendMessage(chatId, "Ketik /help ya maniezz 💋✨");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}

function formatDT(date) {
  return date.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}