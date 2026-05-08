import { Wind, Droplets, Leaf, Snowflake, Lightbulb } from "lucide-react";
import { getActuators } from "../../utils/greenhouse";

const ICON_MAP = { Wind, Droplets, Leaf, Snowflake, Lightbulb };

export default function ActuatorPanel({ data }) {
  const actuators = getActuators(data);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
        <Wind size={18} strokeWidth={1.8} />
        <span>Status Aktuator</span>
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {actuators.map(({ key, label, icon, on }) => {
          const Icon = ICON_MAP[icon];
          return (
            <div
              key={key}
              className={`rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-colors
                ${on
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-slate-50 border-slate-200"
                }`}
            >
              <Icon
                size={20}
                strokeWidth={1.8}
                className={on ? "text-emerald-600" : "text-slate-400"}
              />
              <span className="text-[11px] text-slate-600 font-medium text-center leading-tight">
                {label}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                  ${on
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                  }`}
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