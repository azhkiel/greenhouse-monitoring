"use client";

import { Wind, Droplets, Leaf, Snowflake, Lightbulb } from "lucide-react";
import { getActuators } from "../../utils/greenhouse";

const ICON_MAP = { Wind, Droplets, Leaf, Snowflake, Lightbulb };

export default function ActuatorPanel({ data }) {
  const actuators = getActuators(data);

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gh-blush">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gh-blush flex items-center justify-center">
          <Wind size={18} strokeWidth={1.8} className="text-gh-rose" />
        </div>
        <span className="text-sm font-semibold text-slate-700">Status Aktuator</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {actuators.map(({ key, label, icon, on }) => {
          const Icon = ICON_MAP[icon];
          return (
            <div
              key={key}
              className={`rounded-lg border p-3 flex flex-col items-center gap-1.5 transition-all
                ${on
                  ? "bg-gh-rose-50 border-gh-rose-200 shadow-sm"
                  : "bg-gh-blush border-gh-blush"
                }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={on ? "text-gh-rose" : "text-gh-pink"}
              />
              <span className="text-[11px] text-slate-600 font-medium text-center leading-tight">
                {label}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                  ${on ? "bg-gh-rose-100 text-gh-rose-700" : "bg-gh-blush text-gh-pink"}`}
              >
                {on ? "ON" : "OFF"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}