"use client";

import { useState } from "react";
import { Clock, Calendar, Sun, Moon, AlertTriangle, CheckCircle2, Settings } from "lucide-react";

interface WorkSchedule {
  day: string;
  active: boolean;
  startTime: string;
  endTime: string;
}

const defaultSchedule: WorkSchedule[] = [
  { day: "Monday", active: true, startTime: "09:00", endTime: "17:00" },
  { day: "Tuesday", active: true, startTime: "09:00", endTime: "17:00" },
  { day: "Wednesday", active: true, startTime: "09:00", endTime: "17:00" },
  { day: "Thursday", active: true, startTime: "09:00", endTime: "17:00" },
  { day: "Friday", active: true, startTime: "09:00", endTime: "17:00" },
  { day: "Saturday", active: false, startTime: "10:00", endTime: "14:00" },
  { day: "Sunday", active: false, startTime: "10:00", endTime: "14:00" },
];

export default function WorkHoursSystem() {
  const [schedule, setSchedule] = useState<WorkSchedule[]>(defaultSchedule);
  const [timezone, setTimezone] = useState("America/New_York");
  const [overtimeAlerts, setOvertimeAlerts] = useState(true);
  const [autoPause, setAutoPause] = useState(true);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  const updateTime = (index: number, field: "startTime" | "endTime", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const isCurrentlyWorkHours = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    const today = schedule[adjustedIndex];
    
    if (!today.active) return false;
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMin] = today.startTime.split(":").map(Number);
    const [endHour, endMin] = today.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return currentTime >= startMinutes && currentTime < endMinutes;
  };

  const getActiveDaysCount = () => schedule.filter(s => s.active).length;
  const getWeeklyHours = () => {
    return schedule.reduce((total, day) => {
      if (!day.active) return total;
      const [startHour, startMin] = day.startTime.split(":").map(Number);
      const [endHour, endMin] = day.endTime.split(":").map(Number);
      return total + (endHour - startHour) + (endMin - startMin) / 60;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`rounded-xl p-6 border ${isCurrentlyWorkHours() ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCurrentlyWorkHours() ? 'bg-green-100' : 'bg-amber-100'}`}>
            {isCurrentlyWorkHours() ? (
              <Sun className="w-6 h-6 text-green-600" />
            ) : (
              <Moon className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-mouse-charcoal">
              {isCurrentlyWorkHours() ? "Work Hours Active" : "Outside Work Hours"}
            </h3>
            <p className="text-sm text-mouse-slate">
              {isCurrentlyWorkHours() 
                ? "AI employees are actively processing tasks" 
                : "AI employees are in standby mode. Emergency tasks still processed."}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${isCurrentlyWorkHours() ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {isCurrentlyWorkHours() ? (
                <><CheckCircle2 className="w-4 h-4" /> Active</>
              ) : (
                <><Clock className="w-4 h-4" /> Standby</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-mouse-teal" />
            <h3 className="font-semibold text-mouse-charcoal">Weekly Schedule</h3>
          </div>
          <div className="text-sm text-mouse-slate">
            {getActiveDaysCount()} active days • {getWeeklyHours().toFixed(1)} hrs/week
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {schedule.map((day, index) => (
            <div key={day.day} className="px-6 py-4 flex items-center gap-4">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.active}
                  onChange={() => toggleDay(index)}
                  className="w-5 h-5 rounded border-gray-300 text-mouse-teal focus:ring-mouse-teal"
                />
                <span className={`font-medium ${day.active ? 'text-mouse-charcoal' : 'text-gray-400'}`}>
                  {day.day}
                </span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => updateTime(index, "startTime", e.target.value)}
                  disabled={!day.active}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-mouse-teal focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => updateTime(index, "endTime", e.target.value)}
                  disabled={!day.active}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-mouse-teal focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-mouse-teal" />
          <h3 className="font-semibold text-mouse-charcoal">Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-mouse-charcoal">Timezone</p>
              <p className="text-sm text-mouse-slate">All times are in this timezone</p>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-mouse-teal"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-mouse-charcoal">Overtime Alerts</p>
              <p className="text-sm text-mouse-slate">Get notified when employees work outside schedule</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={overtimeAlerts}
                onChange={(e) => setOvertimeAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-mouse-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-mouse-charcoal">Auto-Pause Outside Hours</p>
              <p className="text-sm text-mouse-slate">Automatically pause non-urgent tasks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPause}
                onChange={(e) => setAutoPause(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-mouse-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mouse-teal"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">Work Hours Impact</p>
          <p className="text-sm text-blue-700 mt-1">
            During work hours, AI employees process all tasks at full capacity. Outside work hours, 
            only high-priority and emergency tasks are processed. Your account is still billed for 
            standby time to maintain employee availability.
          </p>
        </div>
      </div>
    </div>
  );
}
