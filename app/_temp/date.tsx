"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@/components/wheel-picker";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DatePickerLocale = "en" | "fa" | "ar";

export interface DatePickerValue {
  /** Always Gregorian yyyy-mm-dd — send this to your API */
  iso: string;
  /** Human-readable string in the selected locale/calendar */
  display: string;
}

interface LocaleDatePickerProps {
  locale: DatePickerLocale;
  onChange?: (value: DatePickerValue) => void;
  defaultValue?: string;
}

// ─── Jalali (Shamsi / Persian) helpers ───────────────────────────────────────

function toJalali(gy: number, gm: number, gd: number) {
  let jy: number, jm: number, jd: number;
  gy -= 1600;
  gm--;
  gd--;
  let g =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);
  for (let i = 0; i < gm; i++)
    g += [
      31,
      28 + ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 1 : 0),
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ][i];
  g += gd;
  let jdno = g - 79;
  const jnp = Math.floor(jdno / 12053);
  jdno %= 12053;
  jy = 979 + 33 * jnp + 4 * Math.floor(jdno / 1461);
  jdno %= 1461;
  if (jdno >= 366) {
    jy += Math.floor((jdno - 1) / 365);
    jdno = (jdno - 1) % 365;
  }
  let i = 0;
  const jml = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30];
  for (; i < 11 && jdno >= jml[i]; i++) jdno -= jml[i];
  jm = i + 1;
  jd = jdno + 1;
  return { jy, jm, jd };
}

function fromJalali(jy: number, jm: number, jd: number) {
  const jy2 = jy - 979,
    jm2 = jm - 1,
    jd2 = jd - 1;
  let jdn =
    365 * jy2 +
    Math.floor(jy2 / 4) * 8 +
    Math.floor(jy2 / 33) * 7 +
    Math.floor(jy2 / 100) * 3;
  const jml2 = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (let i = 0; i < jm2; i++) jdn += jml2[i];
  jdn += jd2;
  let gdn = jdn + 79;
  let gy = 1600 + 400 * Math.floor(gdn / 146097);
  gdn %= 146097;
  if (gdn >= 36525) {
    gdn--;
    gy += 100 * Math.floor(gdn / 36524);
    gdn %= 36524;
    if (gdn >= 365) gdn++;
  }
  gy += 4 * Math.floor(gdn / 1461);
  gdn %= 1461;
  if (gdn >= 366) {
    gdn--;
    gy += Math.floor(gdn / 365);
    gdn %= 365;
  }
  const mdays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (; gm < 12 && gdn >= mdays[gm]; gm++) gdn -= mdays[gm];
  return { gy, gm: gm + 1, gd: gdn + 1 };
}

// ─── Hijri Qamari helpers ─────────────────────────────────────────────────────
// Verified: 29 Jun 2026 → 14 Muharram 1448

function toHijri(gy: number, gm: number, gd: number) {
  // Gregorian → JDN
  const a = Math.floor((14 - gm) / 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  const jdn =
    gd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // JDN → Hijri
  const z = jdn - 1948438;
  const hy = Math.floor((30 * z + 15) / 10631);
  const z2 = z - Math.floor((10631 * hy + 15) / 30);
  const hm = Math.min(12, Math.floor((11 * z2 + 330) / 325));
  const hd = z2 - Math.floor((325 * hm - 320) / 11);
  return { hy, hm, hd };
}

function fromHijri(hy: number, hm: number, hd: number) {
  // Hijri → JDN (tabular)
  const jdn =
    hd +
    Math.ceil(29.5 * (hm - 1)) +
    (hy - 1) * 354 +
    Math.floor((3 + 11 * hy) / 30) +
    1948438 -
    1;

  // JDN → Gregorian
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const mo = Math.floor((5 * e + 2) / 153);
  const gd = e - Math.floor((153 * mo + 2) / 5) + 1;
  const gm = mo + 3 - 12 * Math.floor(mo / 10);
  const gy = 100 * b + d - 4800 + Math.floor(mo / 10);
  return { gy, gm, gd };
}

// ─── Calendar config factory ──────────────────────────────────────────────────

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const FA_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const AR_MONTHS = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoToGregorian(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { gy: y, gm: m, gd: d };
}

interface CalendarDate {
  y: number;
  m: number;
  d: number;
}

interface CalendarConfig {
  dir: "ltr" | "rtl";
  monthLabel: string;
  dayLabel: string;
  yearLabel: string;
  months: WheelPickerOption[];
  years: WheelPickerOption[];
  daysInMonth: (y: number, m: number) => number;
  toCalendar: (gy: number, gm: number, gd: number) => CalendarDate;
  toGregorian: (
    y: number,
    m: number,
    d: number,
  ) => { gy: number; gm: number; gd: number };
  formatDisplay: (y: number, m: number, d: number) => string;
}

function buildConfig(locale: DatePickerLocale): CalendarConfig {
  const today = new Date();
  const todayG = {
    gy: today.getFullYear(),
    gm: today.getMonth() + 1,
    gd: today.getDate(),
  };

  if (locale === "en") {
    const maxY = todayG.gy;
    const years: WheelPickerOption[] = Array.from({ length: 101 }, (_, i) => ({
      value: String(maxY - i),
      label: String(maxY - i),
    }));
    const months: WheelPickerOption[] = EN_MONTHS.map((n, i) => ({
      value: String(i + 1),
      label: n,
    }));
    return {
      dir: "ltr",
      monthLabel: "Month",
      dayLabel: "Day",
      yearLabel: "Year",
      months,
      years,
      daysInMonth: (y, m) => new Date(y, m, 0).getDate(),
      toCalendar: (gy, gm, gd) => ({ y: gy, m: gm, d: gd }),
      toGregorian: (y, m, d) => ({ gy: y, gm: m, gd: d }),
      formatDisplay: (y, m, d) => `${d} ${EN_MONTHS[m - 1]} ${y}`,
    };
  }

  if (locale === "fa") {
    const todayJ = toJalali(todayG.gy, todayG.gm, todayG.gd);
    const maxY = todayJ.jy;
    const years: WheelPickerOption[] = Array.from({ length: 101 }, (_, i) => ({
      value: String(maxY - i),
      label: String(maxY - i),
    }));
    const months: WheelPickerOption[] = FA_MONTHS.map((n, i) => ({
      value: String(i + 1),
      label: n,
    }));
    return {
      dir: "rtl",
      monthLabel: "ماه",
      dayLabel: "روز",
      yearLabel: "سال",
      months,
      years,
      daysInMonth: (y, m) => (m <= 6 ? 31 : m <= 11 ? 30 : 29),
      toCalendar: (gy, gm, gd) => {
        const j = toJalali(gy, gm, gd);
        return { y: j.jy, m: j.jm, d: j.jd };
      },
      toGregorian: (y, m, d) => {
        const g = fromJalali(y, m, d);
        return { gy: g.gy, gm: g.gm, gd: g.gd };
      },
      formatDisplay: (y, m, d) => `${d} ${FA_MONTHS[m - 1]} ${y}`,
    };
  }

  // ar — Hijri Qamari
  const todayH = toHijri(todayG.gy, todayG.gm, todayG.gd);
  const maxY = todayH.hy; // correct Hijri year e.g. 1448
  const years: WheelPickerOption[] = Array.from({ length: 101 }, (_, i) => ({
    value: String(maxY - i),
    label: String(maxY - i),
  }));
  const months: WheelPickerOption[] = AR_MONTHS.map((n, i) => ({
    value: String(i + 1),
    label: n,
  }));
  return {
    dir: "rtl",
    monthLabel: "الشهر",
    dayLabel: "اليوم",
    yearLabel: "السنة",
    months,
    years,
    daysInMonth: (_y, m) => (m % 2 === 1 ? 30 : 29),
    toCalendar: (gy, gm, gd) => {
      const h = toHijri(gy, gm, gd);
      return { y: h.hy, m: h.hm, d: h.hd };
    },
    toGregorian: (y, m, d) => {
      const g = fromHijri(y, m, d);
      return { gy: g.gy, gm: g.gm, gd: g.gd };
    },
    formatDisplay: (y, m, d) => `${d} ${AR_MONTHS[m - 1]} ${y}`,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocaleDatePicker({
  locale,
  onChange,
  defaultValue,
}: LocaleDatePickerProps) {
  const cfg = useMemo(() => {
    return buildConfig(locale);
  }, [locale]);

  const initGregorian = defaultValue
    ? isoToGregorian(defaultValue)
    : (() => {
        const t = new Date();
        return { gy: t.getFullYear(), gm: t.getMonth() + 1, gd: t.getDate() };
      })();

  const initCal = cfg.toCalendar(
    initGregorian.gy,
    initGregorian.gm,
    initGregorian.gd,
  );

  const [selYear, setSelYear] = useState(String(initCal.y));
  const [selMonth, setSelMonth] = useState(String(initCal.m));
  const [selDay, setSelDay] = useState(String(initCal.d));

  useEffect(() => {
    const newCfg = buildConfig(locale);
    const t = new Date();
    const g = defaultValue
      ? isoToGregorian(defaultValue)
      : { gy: t.getFullYear(), gm: t.getMonth() + 1, gd: t.getDate() };
    const cal = newCfg.toCalendar(g.gy, g.gm, g.gd);
    setSelYear(String(cal.y));
    setSelMonth(String(cal.m));
    setSelDay(String(cal.d));
  }, [locale]);

  const daysInCurrentMonth = cfg.daysInMonth(Number(selYear), Number(selMonth));
  const dayOptions: WheelPickerOption[] = Array.from(
    { length: daysInCurrentMonth },
    (_, i) => ({ value: String(i + 1), label: String(i + 1) }),
  );

  const clampedDay = Math.min(Number(selDay), daysInCurrentMonth);

  const emit = useCallback(
    (y: string, m: string, d: string) => {
      if (!onChange) return;
      const dy = cfg.daysInMonth(Number(y), Number(m));
      const safeD = Math.min(Number(d), dy);
      const g = cfg.toGregorian(Number(y), Number(m), safeD);
      const iso = `${g.gy}-${pad2(g.gm)}-${pad2(g.gd)}`;
      const display = cfg.formatDisplay(Number(y), Number(m), safeD);
      onChange({ iso, display });
    },
    [cfg, onChange],
  );

  const handleMonthChange = (v: string) => {
    setSelMonth(v);
    const dy = cfg.daysInMonth(Number(selYear), Number(v));
    const safeD = Math.min(Number(selDay), dy);
    setSelDay(String(safeD));
    emit(selYear, v, String(safeD));
  };

  const handleDayChange = (v: string) => {
    setSelDay(v);
    emit(selYear, selMonth, v);
  };

  const handleYearChange = (v: string) => {
    setSelYear(v);
    const dy = cfg.daysInMonth(Number(v), Number(selMonth));
    const safeD = Math.min(Number(selDay), dy);
    setSelDay(String(safeD));
    emit(v, selMonth, String(safeD));
  };

  useEffect(() => {
    emit(selYear, selMonth, String(clampedDay));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-1 px-1">
        <span className="flex-1 text-center text-xs text-muted-foreground">
          {cfg.monthLabel}
        </span>
        <span className="flex-1 text-center text-xs text-muted-foreground">
          {cfg.dayLabel}
        </span>
        <span className="flex-1 text-center text-xs text-muted-foreground">
          {cfg.yearLabel}
        </span>
      </div>

      <WheelPickerWrapper>
        <WheelPicker
          options={cfg.months}
          value={selMonth}
          onValueChange={handleMonthChange}
        />
        <WheelPicker
          options={dayOptions}
          value={String(clampedDay)}
          onValueChange={handleDayChange}
        />
        <WheelPicker
          options={cfg.years}
          value={selYear}
          onValueChange={handleYearChange}
        />
      </WheelPickerWrapper>
    </div>
  );
}
