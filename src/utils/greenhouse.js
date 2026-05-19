export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export function formatDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export function getRainLabel(pct) {
  if (pct <= 34) return {
    label: "Tidak Hujan",
    dot: "bg-gh-rose",
    badge: "bg-gh-rose-100 text-gh-rose-700",
    bar: "bg-gh-rose",
  };
  if (pct <= 64) return {
    label: "Gerimis / Mulai Basah",
    dot: "bg-gh-pink",
    badge: "bg-gh-pink-100 text-gh-pink-700",
    bar: "bg-gh-pink",
  };
  return {
    label: "Hujan",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800",
    bar: "bg-blue-500",
  };
}

export function getSoilLabel(pct) {
  if (pct <= 20) return { label: "Sangat Kering",   badge: "bg-gh-blush text-gh-rose", bar: "bg-gh-rose" };
  if (pct <= 45) return { label: "Kering",           badge: "bg-gh-cream text-yellow-800", bar: "bg-gh-pink" };
  if (pct <= 70) return { label: "Lembap Optimal",   badge: "bg-gh-rose-100 text-gh-rose", bar: "bg-gh-rose" };
  return           { label: "Sangat Basah",          badge: "bg-blue-100 text-blue-800", bar: "bg-blue-500" };
}

export function getActuators(data) {
  return [
    { key: "fan_status",          label: "Fan",           icon: "Wind" },
    { key: "pump_air_status",     label: "Pompa Air",     icon: "Droplets" },
    { key: "pump_nutrisi_status", label: "Pompa Nutrisi", icon: "Leaf" },
    { key: "pump_humid_status",   label: "Pompa Humid",   icon: "Snowflake" },
    { key: "lamp_status",         label: "Lampu",         icon: "Lightbulb" },
  ].map((a) => ({ ...a, on: data[a.key] === "ON" }));
}

export function formatEpoch(epoch) {
  if (!epoch) return "—";
  return new Date(epoch * 1000).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}