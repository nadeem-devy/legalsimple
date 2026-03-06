"use client";

import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface DateDropdownPickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  fromYear?: number;
  toYear?: number;
  defaultYear?: number;
}

export function DateDropdownPicker({
  value,
  onChange,
  fromYear = 1940,
  toYear = new Date().getFullYear(),
  defaultYear,
}: DateDropdownPickerProps) {
  const [month, setMonth] = useState<string>(
    value ? String(value.getMonth()) : ""
  );
  const [day, setDay] = useState<string>(
    value ? String(value.getDate()) : ""
  );
  const [year, setYear] = useState<string>(
    value ? String(value.getFullYear()) : ""
  );

  useEffect(() => {
    if (!value) {
      setMonth("");
      setDay("");
      setYear("");
    }
  }, [value]);

  useEffect(() => {
    if (month !== "" && day !== "" && year !== "") {
      const m = parseInt(month);
      const d = parseInt(day);
      const y = parseInt(year);
      const maxDays = getDaysInMonth(m, y);
      const safeDay = Math.min(d, maxDays);
      if (safeDay !== d) {
        setDay(String(safeDay));
        return;
      }
      const date = new Date(y, m, safeDay);
      if (!value || value.getTime() !== date.getTime()) {
        onChange(date);
      }
    }
  }, [month, day, year, value, onChange]);

  const selectedMonth = month !== "" ? parseInt(month) : undefined;
  const selectedYear = year !== "" ? parseInt(year) : undefined;
  const maxDays =
    selectedMonth !== undefined && selectedYear !== undefined
      ? getDaysInMonth(selectedMonth, selectedYear)
      : 31;

  const years = [];
  for (let y = toYear; y >= fromYear; y--) {
    years.push(y);
  }

  const allSelected = month !== "" && day !== "" && year !== "";

  return (
    <div className="flex flex-col gap-1.5 flex-1">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-xl border bg-white p-1.5 transition-all duration-200",
          allSelected
            ? "border-blue-200 bg-blue-50/30 shadow-sm shadow-blue-100/50"
            : "border-slate-200"
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100/80 text-slate-400 shrink-0">
          <CalendarDays className="w-4 h-4" />
        </div>

        {/* Month */}
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger
            className={cn(
              "h-9 rounded-lg border-0 bg-transparent shadow-none px-2.5 flex-[3] text-sm font-medium focus-visible:ring-1 focus-visible:ring-blue-200",
              month !== "" ? "text-slate-900" : "text-slate-400"
            )}
          >
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_FULL.map((name, i) => (
              <SelectItem key={i} value={String(i)}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Day */}
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger
            className={cn(
              "h-9 rounded-lg border-0 bg-transparent shadow-none px-2.5 flex-[1.5] text-sm font-medium focus-visible:ring-1 focus-visible:ring-blue-200",
              day !== "" ? "text-slate-900" : "text-slate-400"
            )}
          >
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxDays }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {String(i + 1).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Year */}
        <Select
          value={year}
          onValueChange={setYear}
          defaultValue={defaultYear ? String(defaultYear) : undefined}
        >
          <SelectTrigger
            className={cn(
              "h-9 rounded-lg border-0 bg-transparent shadow-none px-2.5 flex-[2] text-sm font-medium focus-visible:ring-1 focus-visible:ring-blue-200",
              year !== "" ? "text-slate-900" : "text-slate-400"
            )}
          >
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {allSelected && (
        <p className="text-xs text-blue-500 font-medium pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {MONTH_FULL[parseInt(month)]} {parseInt(day)}, {year}
        </p>
      )}
    </div>
  );
}
