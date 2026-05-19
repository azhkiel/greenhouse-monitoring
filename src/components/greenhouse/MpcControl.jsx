"use client";

import { Cpu, Wind, Sprout, Timer, Lock, FlaskConical, Clock } from "lucide-react";
import { formatEpoch } from "../../utils/greenhouse";

const MPC_ITEMS = [
  { key: "fan_mpc_control",       label: "Fan MPC",          icon: Wind,   unit: "%",  iconClass: "text-gh-rose",   bg: "bg-gh-rose-50" },
  { key: "fan_pwm",               label: "Fan PWM",           icon: Wind,   unit: "",   iconClass: "text-gh-pink",   bg: "bg-gh-pink-50" },
  { key: "soil_mpc_control",      label: "Soil MPC",          icon: Sprout, unit: "%",  iconClass: "text-gh-rose",   bg: "bg-gh-rose-50" },
  { key: "pump_on_time",          label: "Pump ON Time",      icon: Timer,  unit: "s",  iconClass: "text-gh-rose",   bg: "bg-gh-blush" },
  { key: "prediction_horizon_sec", label: "Horizon Prediksi", icon: Timer,  unit: "s",  iconClass: "text-gh-pink",   bg: "bg-gh-blush" },
  { key: "control_horizon_sec",   label: "Horizon Kontrol",   icon: Timer,  unit: "s",  iconClass: "text-gh-pink",   bg: "bg-gh-blush" },
];

const LOCK_ITEMS = [
  { key: "manual_lock_fan",   label: "Fan Lock",   icon: Lock },
  { key: "manual_lock_pump3", label: "Pump Lock",  icon: Lock },
  { key: "manual_lock_lamp",  label: "Lamp Lock",  icon: Lock },
];

export default function MpcControl({ data }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gh-blush">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gh-rose-50 flex items-center justify-center">
          <Cpu size={18} strokeWidth={1.8} className="text-gh-rose" />
        </div>
        <span className="text-sm font-semibold text-slate-700">MPC Control</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {MPC_ITEMS.map(({ key, label, icon: Icon, unit, iconClass, bg }) => (
          <div key={key} className={`${bg} rounded-lg p-3 flex flex-col gap-1`}>
            <Icon size={14} strokeWidth={1.8} className={iconClass} />
            <span className="text-[10px] text-gh-pink leading-tight font-medium">{label}</span>
            <span className="text-lg font-bold text-slate-800 tabular-nums">
              {data[key]}{unit}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gh-blush pt-4 mt-2">
        <p className="text-xs font-semibold text-gh-pink uppercase tracking-wider mb-3">Manual Lock & Nutrient</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LOCK_ITEMS.map(({ key, label, icon: Icon }) => (
            <div key={key} className={`rounded-lg border p-2.5 flex items-center gap-2 ${data[key] ? "bg-gh-cream border-gh-cream" : "bg-gh-blush border-gh-blush"}`}>
              <Lock size={14} strokeWidth={1.8} className={data[key] ? "text-gh-rose" : "text-gh-pink"} />
              <div>
                <span className="text-[10px] text-gh-pink font-medium">{label}</span>
                <span className={`text-xs font-bold ml-1 ${data[key] ? "text-gh-rose" : "text-gh-pink"}`}>
                  {data[key] ? "LOCKED" : "FREE"}
                </span>
              </div>
            </div>
          ))}
          <div className={`rounded-lg border p-2.5 flex items-center gap-2 ${data.nutrient_running ? "bg-gh-rose-50 border-gh-rose-200" : "bg-gh-blush border-gh-blush"}`}>
            <FlaskConical size={14} strokeWidth={1.8} className={data.nutrient_running ? "text-gh-rose" : "text-gh-pink"} />
            <div>
              <span className="text-[10px] text-gh-pink font-medium">Nutrient</span>
              <span className={`text-xs font-bold ml-1 ${data.nutrient_running ? "text-gh-rose" : "text-gh-pink"}`}>
                {data.nutrient_running ? "RUNNING" : "IDLE"}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-gh-blush bg-gh-blush p-2.5 flex items-center gap-2">
            <Clock size={14} strokeWidth={1.8} className="text-gh-pink" />
            <div>
              <span className="text-[10px] text-gh-pink font-medium">Last Nutrient</span>
              <span className="text-xs font-bold text-slate-600 ml-1">
                {formatEpoch(data.last_nutrient_epoch)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}