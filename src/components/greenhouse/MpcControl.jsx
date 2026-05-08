import { Cpu, Wind, Sprout, Timer } from "lucide-react";

const MPC_ITEMS = [
  { key: "fan_mpc_control",      label: "Fan MPC",          icon: Wind,   unit: "%",  iconClass: "text-violet-500" },
  { key: "fan_pwm",              label: "Fan PWM",           icon: Wind,   unit: "",   iconClass: "text-violet-400" },
  { key: "soil_mpc_control",     label: "Soil MPC",          icon: Sprout, unit: "%",  iconClass: "text-emerald-500" },
  { key: "pump_air_on_time",     label: "Pump ON Time",      icon: Timer,  unit: "s",  iconClass: "text-cyan-500" },
  { key: "prediction_horizon_sec", label: "Horizon Prediksi",icon: Timer,  unit: "s",  iconClass: "text-slate-400" },
  { key: "control_horizon_sec",  label: "Horizon Kontrol",   icon: Timer,  unit: "s",  iconClass: "text-slate-400" },
];

export default function MpcControl({ data }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        <Cpu size={18} strokeWidth={1.8} />
        <span>MPC Control</span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {MPC_ITEMS.map(({ key, label, icon: Icon, unit, iconClass }) => (
          <div key={key} className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1">
            <Icon size={15} strokeWidth={1.8} className={iconClass} />
            <span className="text-[11px] text-slate-400 leading-tight">{label}</span>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {data[key]}{unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}