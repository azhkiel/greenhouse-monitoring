export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export function getRainLabel(pct) {
  if (pct <= 34) return {
    label: "Tidak Hujan",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-500",
  };
  if (pct <= 64) return {
    label: "Gerimis / Mulai Basah",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-800",
    bar: "bg-amber-400",
  };
  return {
    label: "Hujan",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800",
    bar: "bg-blue-500",
  };
}

export function getSoilLabel(pct) {
  if (pct <= 20) return { label: "Sangat Kering",   badge: "bg-orange-100 text-orange-800", bar: "bg-orange-400" };
  if (pct <= 45) return { label: "Kering",           badge: "bg-yellow-100 text-yellow-800", bar: "bg-yellow-400" };
  if (pct <= 70) return { label: "Lembap Optimal",   badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" };
  return           { label: "Sangat Basah",          badge: "bg-blue-100 text-blue-800", bar: "bg-blue-500" };
}

export function getActuators(data) {
  return [
    { key: "fan_status",          label: "Fan",           icon: "Wind" },
    { key: "pump_air_status",     label: "Pompa Air",     icon: "Droplets" },
    { key: "pump_nutrisi_status", label: "Pompa Nutrisi", icon: "Leaf" },
    { key: "pump_peltier_status", label: "Pompa Peltier", icon: "Snowflake" },
    { key: "lamp_status",         label: "Lampu",         icon: "Lightbulb" },
  ].map((a) => ({ ...a, on: data[a.key] === "ON" }));
}