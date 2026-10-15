import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Ban,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Bell,
  Sun,
  Moon,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Sliders,
  X,
  Check,
  Printer,
  FileText,
  Grid,
  RefreshCw,
  Sparkles,
  Download,
  Upload,
  Settings,
  Palette,
  Database,
  Cloud,
  LogOut,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Palmtree,
  Trophy,
  Coffee
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useGitHubAutoUpdater, GitHubSettingsUpdateCard, GitHubStartupUpdateModal } from './GitHubUpdater';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getDatabase(firebaseApp);

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const GRADE_POINTS = {
  'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D': 1.0, 'F': 0.0,
  'In Progress': null, 'Pass': null
};

const COURSE_COLORS = [
  { id: 'violet', name: 'Violet', lightBg: '#EADDFF', lightText: '#21005D', darkBg: '#4F378B', darkText: '#EADDFF', border: '#D0BCFF', pdfRgb: [0.92, 0.87, 1.0] },
  { id: 'teal', name: 'Teal', lightBg: '#BCECE0', lightText: '#00201A', darkBg: '#005043', darkText: '#BCECE0', border: '#82D5C2', pdfRgb: [0.74, 0.93, 0.88] },
  { id: 'amber', name: 'Amber', lightBg: '#FFDEA8', lightText: '#271900', darkBg: '#5C4000', darkText: '#FFDEA8', border: '#F5BF5B', pdfRgb: [1.0, 0.87, 0.66] },
  { id: 'rose', name: 'Rose', lightBg: '#FFD9E2', lightText: '#3E001D', darkBg: '#702045', darkText: '#FFD9E2', border: '#FFB1C8', pdfRgb: [1.0, 0.85, 0.89] },
  { id: 'sky', name: 'Sky', lightBg: '#D0E4FF', lightText: '#001D36', darkBg: '#00497D', darkText: '#D0E4FF', border: '#9CCAFF', pdfRgb: [0.82, 0.89, 1.0] }
];

const DEFAULT_GEN_EDS = [
  { id: 'A', code: 'A', name: 'Aesthetics & Humanities', mode: 'simple', requiredCount: 1, acceptedTags: ['A'], subRules: [] },
  { id: 'C', code: 'C', name: 'Composition & Communication', mode: 'simple', requiredCount: 1, acceptedTags: ['C', 'O', 'J'], subRules: [] },
  { id: 'G', code: 'G', name: 'Global Interdependencies', mode: 'simple', requiredCount: 1, acceptedTags: ['G'], subRules: [] },
  { id: 'L', code: 'L', name: 'Laboratory Science', mode: 'simple', requiredCount: 1, acceptedTags: ['L'], subRules: [] },
  { id: 'M', code: 'M', name: 'Mathematics / Reasoning', mode: 'simple', requiredCount: 1, acceptedTags: ['M'], subRules: [] },
  { id: 'N', code: 'N', name: 'Social Science', mode: 'simple', requiredCount: 1, acceptedTags: ['N'], subRules: [] },
  { id: 'P', code: 'P', name: 'Pluralism in the US', mode: 'simple', requiredCount: 1, acceptedTags: ['P'], subRules: [] },
  { id: 'Y', code: 'Y/B', name: 'Physical Activity & Wellness', mode: 'simple', requiredCount: 1, acceptedTags: ['Y', 'B', 'S'], subRules: [] },
  {
    id: 'WRIT',
    code: 'C/W',
    name: 'Writing & Composition Sequence',
    mode: 'composite',
    requiredCount: 1,
    acceptedTags: ['C', 'J', 'W'],
    subRules: [
      { id: 'sr_1', label: 'Composition (C or J)', requiredCount: 2, acceptedTags: ['C', 'J'] },
      { id: 'sr_2', label: 'Writing Intensive (W)', requiredCount: 3, acceptedTags: ['W'] }
    ]
  }
];

const INITIAL_COURSES = [
  {
    id: 'c1',
    code: 'PLSC 111',
    title: 'Intro to American Politics',
    credits: 4,
    grade: 'A',
    color: 'violet',
    startDate: '2026-08-25',
    endDate: '2026-12-15',
    genEds: ['N', 'P'],
    sections: [
      {
        id: 'sec_101',
        type: 'Lecture',
        sectionNumber: '01',
        professor: 'Dr. E. Vance',
        schedule: [
          { day: 1, startTime: '10:05', endTime: '11:00', room: 'Lecture Hall 1' },
          { day: 3, startTime: '10:05', endTime: '11:00', room: 'Lecture Hall 1' }
        ]
      },
      {
        id: 'sec_102',
        type: 'Discussion',
        sectionNumber: 'A2',
        professor: 'TA M. Brooks',
        schedule: [
          { day: 5, startTime: '13:15', endTime: '14:10', room: 'Academic A G08' }
        ]
      }
    ]
  },
  {
    id: 'c2',
    code: 'ECON 160',
    title: 'Principles of Microeconomics',
    credits: 4,
    grade: 'A-',
    color: 'teal',
    startDate: '2026-08-25',
    endDate: '2026-12-15',
    genEds: ['N', 'M'],
    sections: [
      {
        id: 'sec_201',
        type: 'Lecture',
        sectionNumber: '02',
        professor: 'Prof. R. Sterling',
        schedule: [
          { day: 2, startTime: '11:40', endTime: '13:05', room: 'Classroom Wing 212' },
          { day: 4, startTime: '11:40', endTime: '13:05', room: 'Classroom Wing 212' }
        ]
      }
    ]
  }
];

const DEFAULT_STUDY_DATA = {
  dailyGoalMinutes: 60,
  pomoWorkMins: 25,
  pomoBreakMins: 5,
  normalMins: 45,
  logs: {},
  vacationDays: [],
  reminders: []
};

const DEFAULT_CLASS_NOTIF_CONFIG = {
  enabled: true,
  leadMinutes: [30]
};

const LIVE_TIMER_NOTIF_ID = 888888;
const GOAL_PRESETS = [15, 30, 45, 60, 90, 120];
const CLASS_NOTIF_PRESETS = [5, 10, 15, 30, 45, 60, 120];

function UniversityLogoIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M4 10v9" />
      <path d="M8 11.5v7.5" />
      <path d="M12 13v6" />
      <path d="M16 11.5v7.5" />
      <path d="M20 10v9" />
      <path d="M2 19h20" />
      <path d="M1 22h22" />
    </svg>
  );
}

function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#D0BCFF', '#6347A6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#A7F3D0'];
    const particles = Array.from({ length: 130 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 140,
      y: canvas.height * 0.42,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 18 - 6,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 13,
      gravity: 0.36,
      drag: 0.985
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyVisible = false;
      particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.y < canvas.height + 50) anyVisible = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      });

      if (anyVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[120]" />;
}

function normalizeStudyData(raw) {
  if (!raw || typeof raw !== 'object') return DEFAULT_STUDY_DATA;
  return {
    dailyGoalMinutes: Math.max(1, Number(raw.dailyGoalMinutes) || 60),
    pomoWorkMins: Math.max(1, Number(raw.pomoWorkMins) || 25),
    pomoBreakMins: Math.max(1, Number(raw.pomoBreakMins) || 5),
    normalMins: Math.max(1, Number(raw.normalMins) || 45),
    logs: raw.logs && typeof raw.logs === 'object' ? raw.logs : {},
    vacationDays: Array.isArray(raw.vacationDays) ? raw.vacationDays : [],
    reminders: Array.isArray(raw.reminders) ? raw.reminders : [],
    activeTimer: raw.activeTimer && typeof raw.activeTimer === 'object' ? raw.activeTimer : null
  };
}

function normalizeClassNotifConfig(raw) {
  if (!raw || typeof raw !== 'object') return DEFAULT_CLASS_NOTIF_CONFIG;
  const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : true;
  const rawList = Array.isArray(raw.leadMinutes) ? raw.leadMinutes : [30];
  const cleaned = Array.from(
    new Set(
      rawList
        .map((m) => Math.max(1, Math.min(1440, Math.round(Number(m) || 0))))
        .filter((m) => m > 0)
    )
  ).sort((a, b) => a - b);
  return {
    enabled,
    leadMinutes: cleaned.length > 0 ? cleaned : [30]
  };
}

function normalizeGenEds(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) return DEFAULT_GEN_EDS;
  return rawList.map((g, idx) => {
    const code = (g.code || `G${idx + 1}`).trim().toUpperCase();
    const acceptedTags =
      Array.isArray(g.acceptedTags) && g.acceptedTags.length > 0
        ? g.acceptedTags.map((t) => String(t).trim().toUpperCase()).filter(Boolean)
        : code.split(/[/,\s]+/).map((t) => t.trim().toUpperCase()).filter(Boolean);
    return {
      id: g.id || `${code}_${idx}`,
      code,
      name: g.name || code,
      mode: g.mode === 'composite' ? 'composite' : 'simple',
      requiredCount: Math.max(1, Number(g.requiredCount) || 1),
      acceptedTags: acceptedTags.length > 0 ? acceptedTags : [code],
      subRules: Array.isArray(g.subRules)
        ? g.subRules.map((sr, sIdx) => ({
            id: sr.id || `sr_${idx}_${sIdx}`,
            label: sr.label || `Part ${sIdx + 1}`,
            requiredCount: Math.max(1, Number(sr.requiredCount) || 1),
            acceptedTags: Array.isArray(sr.acceptedTags)
              ? sr.acceptedTags.map((t) => String(t).trim().toUpperCase()).filter(Boolean)
              : String(sr.acceptedTags || '')
                  .split(/[/,\s]+/)
                  .map((t) => t.trim().toUpperCase())
                  .filter(Boolean)
          }))
        : []
    };
  });
}

function normalizeCourses(rawCourses) {
  if (!Array.isArray(rawCourses)) return INITIAL_COURSES;
  return rawCourses.map((c, idx) => {
    if (Array.isArray(c.sections) && c.sections.length > 0) return c;
    const legacySchedule = c.schedule || c.meetings || c.times || [];
    return {
      id: c.id || `course_${idx}_${Date.now()}`,
      code: c.code || 'COURSE',
      title: c.title || c.name || 'Untitled Course',
      credits: Number(c.credits) || 4,
      grade: c.grade || 'In Progress',
      color: c.color || 'violet',
      startDate: c.startDate || '2026-08-25',
      endDate: c.endDate || '2026-12-15',
      genEds: Array.isArray(c.genEds) ? c.genEds : (c.attributes || []),
      sections: [
        {
          id: `${c.id || idx}_sec1`,
          type: 'Lecture',
          sectionNumber: '01',
          professor: c.professor || c.instructor || '',
          schedule: Array.isArray(legacySchedule)
            ? legacySchedule.map((s) => ({
                day: Number(s.day ?? s.dayOfWeek ?? 1),
                startTime: s.startTime || s.start || '09:00',
                endTime: s.endTime || s.end || '10:00',
                room: s.room || s.location || c.room || ''
              }))
            : []
        }
      ]
    };
  });
}

function evaluateGenEdProgress(req, courses, manualOverrides) {
  const activeCourses = courses.filter((c) => c.grade !== 'F');
  const manualCounts = manualOverrides?.manualGenEdCounts || {};
  const legacyFulfilled = manualOverrides?.fulfilledGenEds || [];

  if (req.mode === 'composite' && Array.isArray(req.subRules) && req.subRules.length > 0) {
    const subResults = req.subRules.map((sr) => {
      const tags = (sr.acceptedTags || []).map((t) => t.toUpperCase());
      const matchingCourses = activeCourses.filter((c) =>
        (c.genEds || []).some((g) => tags.includes(String(g).toUpperCase()))
      );
      const manualKey = `${req.id}__${sr.id}`;
      const manualAdd = Math.max(0, Number(manualCounts[manualKey]) || 0);
      const current = matchingCourses.length + manualAdd;
      const target = Math.max(1, Number(sr.requiredCount) || 1);
      return {
        ...sr,
        manualKey,
        courseCount: matchingCourses.length,
        manualAdd,
        current,
        target,
        fulfilled: current >= target
      };
    });

    const totalCurrent = subResults.reduce((acc, r) => acc + Math.min(r.current, r.target), 0);
    const totalTarget = subResults.reduce((acc, r) => acc + r.target, 0);
    const isFulfilled = subResults.every((r) => r.fulfilled);

    return {
      isComposite: true,
      isFulfilled,
      current: totalCurrent,
      target: totalTarget,
      subResults
    };
  }

  const tags = (req.acceptedTags && req.acceptedTags.length > 0 ? req.acceptedTags : [req.code]).map((t) =>
    String(t).toUpperCase()
  );
  const matchingCourses = activeCourses.filter((c) =>
    (c.genEds || []).some((g) => tags.includes(String(g).toUpperCase()))
  );

  const rawManual = manualCounts[req.id] ?? manualCounts[req.code];
  const manualAdd =
    rawManual !== undefined
      ? Math.max(0, Number(rawManual) || 0)
      : legacyFulfilled.includes(req.code)
      ? 1
      : 0;

  const target = Math.max(1, Number(req.requiredCount) || 1);
  const current = matchingCourses.length + manualAdd;

  return {
    isComposite: false,
    isFulfilled: current >= target,
    courseCount: matchingCourses.length,
    manualAdd,
    current,
    target,
    matchingCourses
  };
}

function formatTime12h(time24) {
  if (!time24 || !time24.includes(':')) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

function formatTimerClock(totalSecs) {
  const safe = Math.max(0, Math.floor(totalSecs));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function timeToMinutes(time24) {
  if (!time24 || !time24.includes(':')) return 0;
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}

function toLocalDateString(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function pdfEscape(str) {
  return String(str || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function uint8ToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function stringToBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  return uint8ToBase64(bytes);
}

function buildSchedulePdfBytes(courses, format, stats, periodLabel) {
  const pageWidth = format === 'calendar' ? 792 : 612;
  const pageHeight = format === 'calendar' ? 612 : 792;
  const ops = [];

  const rectFillStroke = (x, yTop, w, h, fillRgb, strokeRgb) => {
    const y = pageHeight - yTop - h;
    ops.push(`${fillRgb[0].toFixed(2)} ${fillRgb[1].toFixed(2)} ${fillRgb[2].toFixed(2)} rg`);
    if (strokeRgb) {
      ops.push(`${strokeRgb[0].toFixed(2)} ${strokeRgb[1].toFixed(2)} ${strokeRgb[2].toFixed(2)} RG 0.8 w`);
      ops.push(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re B`);
    } else {
      ops.push(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
    }
  };

  const drawText = (text, x, yTop, size = 10, bold = false, rgb = [0.1, 0.1, 0.15]) => {
    const y = pageHeight - yTop - size;
    const font = bold ? '/F2' : '/F1';
    ops.push('BT');
    ops.push(`${font} ${size} Tf`);
    ops.push(`${rgb[0].toFixed(2)} ${rgb[1].toFixed(2)} ${rgb[2].toFixed(2)} rg`);
    ops.push(`${x.toFixed(1)} ${y.toFixed(1)} Td`);
    ops.push(`(${pdfEscape(text)}) Tj`);
    ops.push('ET');
  };

  rectFillStroke(28, 24, pageWidth - 56, 48, [0.39, 0.28, 0.65], null);
  drawText('Class Track — College Course Schedule', 42, 35, 16, true, [1, 1, 1]);
  drawText(
    `${periodLabel}   |   Courses Shown: ${courses.length}   |   Cumulative GPA: ${stats.cumulativeGpa}`,
    42,
    54,
    9,
    false,
    [0.92, 0.88, 1]
  );

  if (format === 'calendar') {
    const colGap = 10;
    const totalW = pageWidth - 56;
    const colW = (totalW - colGap * 4) / 5;
    const startY = 86;
    const colH = pageHeight - startY - 28;

    [1, 2, 3, 4, 5].forEach((dayNum, idx) => {
      const colX = 28 + idx * (colW + colGap);
      rectFillStroke(colX, startY, colW, colH, [0.97, 0.97, 0.99], [0.85, 0.85, 0.9]);
      rectFillStroke(colX, startY, colW, 24, [0.91, 0.88, 0.98], null);
      drawText(DAYS_FULL[dayNum].toUpperCase(), colX + 10, startY + 7, 10, true, [0.2, 0.1, 0.4]);

      const dayItems = [];
      courses.forEach((course) => {
        (course.sections || []).forEach((sec) => {
          (sec.schedule || []).forEach((slot) => {
            if (Number(slot.day) === dayNum) dayItems.push({ course, sec, slot });
          });
        });
      });
      dayItems.sort((a, b) => timeToMinutes(a.slot.startTime) - timeToMinutes(b.slot.startTime));

      let cardY = startY + 32;
      dayItems.forEach(({ course, sec, slot }) => {
        if (cardY + 68 > startY + colH) return;
        const cObj = COURSE_COLORS.find((c) => c.id === course.color) || COURSE_COLORS[0];
        rectFillStroke(colX + 6, cardY, colW - 12, 66, cObj.pdfRgb, [0.75, 0.72, 0.85]);
        drawText(`${course.code} (${sec.type} ${sec.sectionNumber || ''})`.slice(0, 26), colX + 12, cardY + 7, 8.5, true, [0.1, 0.08, 0.2]);
        drawText(String(course.title || '').slice(0, 25), colX + 12, cardY + 20, 8, false, [0.15, 0.15, 0.2]);
        drawText(`${formatTime12h(slot.startTime)} - ${formatTime12h(slot.endTime)}`, colX + 12, cardY + 34, 8, true, [0.1, 0.1, 0.2]);
        const meta = [slot.room, sec.professor].filter(Boolean).join(' · ').slice(0, 27);
        if (meta) drawText(meta, colX + 12, cardY + 48, 7.5, false, [0.25, 0.25, 0.3]);
        cardY += 74;
      });
    });
  } else {
    let curY = 88;
    courses.forEach((course) => {
      const secCount = Math.max(1, (course.sections || []).length);
      const boxH = 34 + secCount * 32;
      if (curY + boxH > pageHeight - 30) return;

      const cObj = COURSE_COLORS.find((c) => c.id === course.color) || COURSE_COLORS[0];
      rectFillStroke(28, curY, pageWidth - 56, boxH, [0.97, 0.97, 0.99], [0.84, 0.84, 0.9]);
      rectFillStroke(28, curY, 10, boxH, cObj.pdfRgb, null);

      drawText(`${course.code} — ${course.title}`, 48, curY + 9, 11, true, [0.1, 0.1, 0.18]);
      drawText(
        `${course.credits} Credits  |  Grade: ${course.grade}  |  GenEds: ${(course.genEds || []).join(', ') || 'None'}`,
        pageWidth - 260,
        curY + 10,
        8.5,
        true,
        [0.35, 0.32, 0.45]
      );

      let secY = curY + 30;
      (course.sections || []).forEach((sec) => {
        const timesStr = (sec.schedule || [])
          .map((s) => `${DAYS_SHORT[s.day]} ${formatTime12h(s.startTime)}-${formatTime12h(s.endTime)}${s.room ? ' (' + s.room + ')' : ''}`)
          .join(', ');
        drawText(
          `• ${sec.type} ${sec.sectionNumber || ''} ${sec.professor ? '[' + sec.professor + ']' : ''}: ${timesStr}`.slice(0, 95),
          48,
          secY + 4,
          8.5,
          false,
          [0.2, 0.2, 0.28]
        );
        secY += 28;
      });

      curY += boxH + 10;
    });
  }

  const streamContent = ops.join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
    `6 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('unitrack_theme') === 'dark');
  const [uiStyle, setUiStyle] = useState(() => localStorage.getItem('classtrack_ui_style') || 'glassy');
  const [latePolicy, setLatePolicy] = useState(() => localStorage.getItem('classtrack_late_policy') || 'present');
  const [activeTab, setActiveTab] = useState('today');

  const [animTrigger, setAnimTrigger] = useState(1);
  const gitHubUpdater = useGitHubAutoUpdater();

  // --- Customizable Multi-Alert Class Notification Settings (Default: Enabled, 30m before) ---
  const [classNotifConfig, setClassNotifConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('classtrack_class_notifs_v1');
      return saved ? normalizeClassNotifConfig(JSON.parse(saved)) : DEFAULT_CLASS_NOTIF_CONFIG;
    } catch (e) {
      return DEFAULT_CLASS_NOTIF_CONFIG;
    }
  });
  const [customClassLeadInput, setCustomClassLeadInput] = useState('');

  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('unitrack_courses_v2');
      if (saved) return normalizeCourses(JSON.parse(saved));
      const legacy = localStorage.getItem('unitrack_courses');
      if (legacy) return normalizeCourses(JSON.parse(legacy));
    } catch (e) {}
    return INITIAL_COURSES;
  });

  const [attendance, setAttendance] = useState(() => {
    try {
      const saved = localStorage.getItem('unitrack_attendance_v2') || localStorage.getItem('unitrack_attendance');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [genEds, setGenEds] = useState(() => {
    try {
      const saved = localStorage.getItem('unitrack_geneds_v2') || localStorage.getItem('unitrack_geneds');
      return saved ? normalizeGenEds(JSON.parse(saved)) : DEFAULT_GEN_EDS;
    } catch (e) {
      return DEFAULT_GEN_EDS;
    }
  });

  const [manualOverrides, setManualOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('unitrack_overrides');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          transferCredits: Number(parsed.transferCredits) || 0,
          priorGpaCredits: Number(parsed.priorGpaCredits) || 0,
          priorGpaPoints: Number(parsed.priorGpaPoints) || 0,
          fulfilledGenEds: Array.isArray(parsed.fulfilledGenEds) ? parsed.fulfilledGenEds : [],
          manualGenEdCounts: parsed.manualGenEdCounts && typeof parsed.manualGenEdCounts === 'object' ? parsed.manualGenEdCounts : {}
        };
      }
    } catch (e) {}
    return { transferCredits: 0, priorGpaCredits: 0, priorGpaPoints: 0, fulfilledGenEds: [], manualGenEdCounts: {} };
  });

  const [studyData, setStudyData] = useState(() => {
    try {
      const saved = localStorage.getItem('classtrack_study_v1');
      return saved ? normalizeStudyData(JSON.parse(saved)) : DEFAULT_STUDY_DATA;
    } catch (e) {
      return DEFAULT_STUDY_DATA;
    }
  });

  const todayStr = toLocalDateString(new Date());

  // --- Study Timer Runtime States ---
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [pomoPhase, setPomoPhase] = useState('work');
  const [studyTopic, setStudyTopic] = useState('');
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(() => (studyData.pomoWorkMins || 25) * 60);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(() => (studyData.pomoWorkMins || 25) * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerTargetEndMsRef = useRef(null);
  const lastPostedQuarterRef = useRef(-1);

  const [confettiActive, setConfettiActive] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState('');

  const [newVacationDate, setNewVacationDate] = useState(() => todayStr);
  const [newReminderTopic, setNewReminderTopic] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('18:00');
  const [reminderSavedToast, setReminderSavedToast] = useState('');
  const [studyPromptModal, setStudyPromptModal] = useState(null);
  const firedRemindersRef = useRef(new Set());

  const [notifGranted, setNotifGranted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => todayStr);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [showAttendanceDrawer, setShowAttendanceDrawer] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = useState('');
  const fileInputRef = useRef(null);

  const [cloudUser, setCloudUser] = useState(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('');
  const [cloudReadyToPush, setCloudReadyToPush] = useState(false);
  const isApplyingRemoteRef = useRef(false);
  const lastSyncedStampRef = useRef('');

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [customCourseTagInput, setCustomCourseTagInput] = useState('');

  const [isGenEdModalOpen, setIsGenEdModalOpen] = useState(false);
  const [editingGenEd, setEditingGenEd] = useState(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState('calendar');
  const [pdfDateFilterMode, setPdfDateFilterMode] = useState('date');
  const [pdfTargetDate, setPdfTargetDate] = useState(() => todayStr);
  const [pdfRangeStart, setPdfRangeStart] = useState(() => todayStr);
  const [pdfRangeEnd, setPdfRangeEnd] = useState('2026-12-20');
  const [pdfStatusMsg, setPdfStatusMsg] = useState('');

  useEffect(() => { localStorage.setItem('unitrack_theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { localStorage.setItem('classtrack_ui_style', uiStyle); }, [uiStyle]);
  useEffect(() => { localStorage.setItem('classtrack_late_policy', latePolicy); }, [latePolicy]);
  useEffect(() => { localStorage.setItem('classtrack_class_notifs_v1', JSON.stringify(classNotifConfig)); }, [classNotifConfig]);
  useEffect(() => { localStorage.setItem('unitrack_courses_v2', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('unitrack_attendance_v2', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('unitrack_geneds_v2', JSON.stringify(genEds)); }, [genEds]);
  useEffect(() => { localStorage.setItem('unitrack_overrides', JSON.stringify(manualOverrides)); }, [manualOverrides]);
  useEffect(() => { localStorage.setItem('classtrack_study_v1', JSON.stringify(studyData)); }, [studyData]);

  const triggerConfettiCelebration = (message) => {
    setCelebrationBanner(message);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 4300);
    setTimeout(() => setCelebrationBanner(''), 5500);
  };

  // --- Calculate Daily Study Progress, Goal Completion & Vacation-Protected Streak ---
  const studyMetrics = useMemo(() => {
    const todayMins = Math.round(Number(studyData.logs?.[todayStr]) || 0);
    const goalMins = Math.max(1, Number(studyData.dailyGoalMinutes) || 60);
    const goalPct = Math.min(100, Math.round((todayMins / goalMins) * 100));
    const isTodayVacation = (studyData.vacationDays || []).includes(todayStr);
    const isGoalCompleted = todayMins >= goalMins;
    const isTodayStreakCompleted = isGoalCompleted || isTodayVacation;

    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dStr = toLocalDateString(checkDate);
      const mins = Number(studyData.logs?.[dStr]) || 0;
      const isVac = (studyData.vacationDays || []).includes(dStr);

      if (mins >= goalMins) {
        streak++;
      } else if (isVac) {
        // Vacation day freezes and protects the streak
      } else if (i === 0) {
        // Today still in progress
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const totalAllTimeMins = Object.values(studyData.logs || {}).reduce(
      (acc, v) => acc + (Number(v) || 0),
      0
    );

    return {
      todayMins,
      goalMins,
      goalPct,
      isTodayVacation,
      isGoalCompleted,
      isTodayStreakCompleted,
      streak,
      totalAllTimeMins
    };
  }, [studyData, todayStr]);

  // --- Dynamic Encouraging Messages During Study Timer ---
  const encouragingMessage = useMemo(() => {
    if (timerMode === 'pomodoro' && pomoPhase === 'break') {
      return 'Break time! Stretch, hydrate, and rest your eyes.';
    }
    const elapsed = Math.max(0, timerTotalSeconds - timerSecondsLeft);
    const pct = timerTotalSeconds > 0 ? (elapsed / timerTotalSeconds) * 100 : 0;

    if (!timerRunning && elapsed === 0) {
      return 'Ready when you are — lock in and crush this session!';
    }
    if (pct < 25) {
      return 'Great start! Clear your mind and settle into your flow.';
    }
    if (pct < 50) {
      return 'You are building real momentum — stay locked in!';
    }
    if (pct < 75) {
      return 'Past the halfway mark! Your focus is paying off.';
    }
    if (pct < 95) {
      return 'Home stretch! Finish strong, you are almost there!';
    }
    return 'Final seconds — incredible discipline!';
  }, [timerMode, pomoPhase, timerTotalSeconds, timerSecondsLeft, timerRunning]);

  // --- True Native Android Live Chronometer Notification + Exact Hardware Completion Alarm ---
  const startNativeLiveTimerNotification = async (endMs, isBreakPhase, currentEncourageMsg) => {
    const phaseLabel =
      timerMode === 'pomodoro'
        ? isBreakPhase
          ? 'Pomodoro Break'
          : 'Pomodoro Focus'
        : 'Study Session';
    const topicPart = studyTopic.trim() ? ` (${studyTopic.trim()})` : '';
    const title = `${phaseLabel}${topicPart}`;
    const body = currentEncourageMsg || 'Stay locked in!';

    const minsCompleted = Math.max(1, Math.round(timerTotalSeconds / 60));
    const doneTitle = isBreakPhase
      ? 'Break Complete! ⏰'
      : 'Study Session Complete! 🎉';
    const doneBody = isBreakPhase
      ? 'Your break is over — tap to start your next focus round!'
      : `Awesome job! You completed your ${minsCompleted}m ${studyTopic.trim() || 'study'} session.`;

    if (typeof window !== 'undefined' && window.AndroidLiveTimer) {
      try {
        window.AndroidLiveTimer.startLiveTimer(title, body, Number(endMs), doneTitle, doneBody);
        return;
      } catch (e) {}
    }

    if (Capacitor.isNativePlatform() && notifGranted) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: LIVE_TIMER_NOTIF_ID,
              title,
              body,
              channelId: 'study-live-timer',
              ongoing: true,
              autoCancel: false
            }
          ]
        });
      } catch (e) {}
    }
  };

  const stopNativeLiveTimerNotification = async () => {
    if (typeof window !== 'undefined' && window.AndroidLiveTimer) {
      try {
        window.AndroidLiveTimer.stopLiveTimer();
      } catch (e) {}
    }
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: LIVE_TIMER_NOTIF_ID }] });
      } catch (e) {}
    }
  };

  // --- Accurate Timestamp-Based Study Countdown Engine ---
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      if (!timerTargetEndMsRef.current) return;
      const nowMs = Date.now();
      const remaining = Math.max(0, Math.ceil((timerTargetEndMsRef.current - nowMs) / 1000));
      setTimerSecondsLeft(remaining);

      if (remaining > 0) {
        const elapsed = Math.max(0, timerTotalSeconds - remaining);
        const quarter = timerTotalSeconds > 0 ? Math.floor((elapsed / timerTotalSeconds) * 4) : 0;
        if (quarter !== lastPostedQuarterRef.current) {
          lastPostedQuarterRef.current = quarter;
          startNativeLiveTimerNotification(
            timerTargetEndMsRef.current,
            timerMode === 'pomodoro' && pomoPhase === 'break',
            encouragingMessage
          );
        }
      } else {
        clearInterval(interval);
        setTimerRunning(false);
        timerTargetEndMsRef.current = null;
        lastPostedQuarterRef.current = -1;
        stopNativeLiveTimerNotification();

        const isBreak = timerMode === 'pomodoro' && pomoPhase === 'break';
        if (!isBreak) {
          const completedMinutes = Math.max(1, Math.round(timerTotalSeconds / 60));
          const prevToday = Number(studyData.logs?.[todayStr]) || 0;
          const nextToday = prevToday + completedMinutes;
          const goal = Math.max(1, Number(studyData.dailyGoalMinutes) || 60);

          setStudyData((prev) => ({
            ...prev,
            logs: {
              ...(prev.logs || {}),
              [todayStr]: (Number(prev.logs?.[todayStr]) || 0) + completedMinutes
            }
          }));

          if (typeof window !== 'undefined' && window.AndroidLiveTimer) {
            try {
              window.AndroidLiveTimer.showInstantStudyAlert(
                'Study Session Complete! 🎉',
                `Awesome job! +${completedMinutes}m added to your study log (${nextToday}m today).`,
                991001
              );
            } catch (e) {}
          }

          if (prevToday < goal && nextToday >= goal) {
            triggerConfettiCelebration(`Daily Goal Complete! (${nextToday} mins studied today!)`);
          } else {
            triggerConfettiCelebration(`Session Complete! +${completedMinutes} mins logged!`);
          }

          if (timerMode === 'pomodoro') {
            setPomoPhase('break');
            const breakSecs = (Number(studyData.pomoBreakMins) || 5) * 60;
            setTimerTotalSeconds(breakSecs);
            setTimerSecondsLeft(breakSecs);
          } else {
            setTimerSecondsLeft(timerTotalSeconds);
          }
        } else {
          if (typeof window !== 'undefined' && window.AndroidLiveTimer) {
            try {
              window.AndroidLiveTimer.showInstantStudyAlert(
                'Break Complete! ⏰',
                'Ready for your next focus round!',
                991002
              );
            } catch (e) {}
          }
          setPomoPhase('work');
          const workSecs = (Number(studyData.pomoWorkMins) || 25) * 60;
          setTimerTotalSeconds(workSecs);
          setTimerSecondsLeft(workSecs);
          triggerConfettiCelebration('Break complete! Ready for your next focus round.');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerTotalSeconds, timerMode, pomoPhase, studyData, todayStr, encouragingMessage]);

    // --- Sync Active Running Timer Between Phone & Wear OS Watch ---
  const lastRemoteTimerStampRef = useRef(0);

  useEffect(() => {
    const remote = studyData.activeTimer;
    if (!remote || !remote.updatedAt || remote.updatedAt <= lastRemoteTimerStampRef.current) return;
    lastRemoteTimerStampRef.current = remote.updatedAt;

    if (remote.running && remote.targetEndMs > Date.now()) {
      const remSecs = Math.max(1, Math.ceil((remote.targetEndMs - Date.now()) / 1000));
      setTimerMode(remote.mode || 'pomodoro');
      setPomoPhase(remote.phase || 'work');
      if (remote.topic !== undefined) setStudyTopic(remote.topic);
      setTimerTotalSeconds(remote.totalSeconds || remSecs);
      setTimerSecondsLeft(remSecs);
      timerTargetEndMsRef.current = remote.targetEndMs;
      if (!timerRunning) {
        setTimerRunning(true);
        startNativeLiveTimerNotification(remote.targetEndMs, (remote.mode === 'pomodoro' && remote.phase === 'break'), 'Synced from Wear OS Watch');
      }
    } else if (!remote.running && timerRunning) {
      setTimerRunning(false);
      timerTargetEndMsRef.current = null;
      if (remote.remainingSeconds) setTimerSecondsLeft(remote.remainingSeconds);
      stopNativeLiveTimerNotification();
    }
  }, [studyData.activeTimer]);
  const startOrPauseTimer = async () => {
    if (timerRunning) {
      setTimerRunning(false);
      timerTargetEndMsRef.current = null;
      lastPostedQuarterRef.current = -1;
      await stopNativeLiveTimerNotification();
    } else {
      if (!notifGranted && Capacitor.isNativePlatform()) {
        try {
          const perm = await LocalNotifications.requestPermissions();
          if (perm.display === 'granted') setNotifGranted(true);
        } catch (e) {}
      }
      const secs = timerSecondsLeft > 0 ? timerSecondsLeft : timerTotalSeconds;
      const targetEndMs = Date.now() + secs * 1000;
      timerTargetEndMsRef.current = targetEndMs;
      lastPostedQuarterRef.current = 0;
      setTimerRunning(true);
      await startNativeLiveTimerNotification(
        targetEndMs,
        timerMode === 'pomodoro' && pomoPhase === 'break',
        'Great start! Clear your mind and settle into your flow.'
      );
    }
  };

  const resetStudyTimer = (customMode = timerMode, customPhase = pomoPhase, customStudy = studyData) => {
    setTimerRunning(false);
    timerTargetEndMsRef.current = null;
    lastPostedQuarterRef.current = -1;
    stopNativeLiveTimerNotification();

    if (customMode === 'pomodoro') {
      const mins = customPhase === 'break' ? customStudy.pomoBreakMins : customStudy.pomoWorkMins;
      const secs = Math.max(1, Number(mins) || 25) * 60;
      setTimerTotalSeconds(secs);
      setTimerSecondsLeft(secs);
    } else {
      const secs = Math.max(1, Number(customStudy.normalMins) || 45) * 60;
      setTimerTotalSeconds(secs);
      setTimerSecondsLeft(secs);
    }
  };

  // --- Check Native Study Reminder Tap Intent on Launch & Resume ---
  useEffect(() => {
    const checkPendingNativeReminder = () => {
      if (typeof window !== 'undefined' && window.AndroidLiveTimer?.consumePendingReminderTopic) {
        try {
          const topic = window.AndroidLiveTimer.consumePendingReminderTopic();
          if (topic && topic.trim()) {
            setActiveTab('study');
            setStudyPromptModal({ topic: topic.trim() });
          }
        } catch (e) {}
      }
    };

    checkPendingNativeReminder();
    document.addEventListener('visibilitychange', checkPendingNativeReminder);
    window.addEventListener('focus', checkPendingNativeReminder);

    if (Capacitor.isNativePlatform()) {
      const sub = LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        const extra = action?.notification?.extra;
        if (extra && extra.type === 'study-reminder') {
          setActiveTab('study');
          setStudyPromptModal({ topic: extra.topic || 'Scheduled Study Session' });
        }
      });
      return () => {
        document.removeEventListener('visibilitychange', checkPendingNativeReminder);
        window.removeEventListener('focus', checkPendingNativeReminder);
        sub.then((h) => h.remove()).catch(() => {});
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', checkPendingNativeReminder);
      window.removeEventListener('focus', checkPendingNativeReminder);
    };
  }, []);

  // --- Apply Cloud Snapshot (Saves and Restores ALL Data Including Streak Data!) ---
  const applyCloudSnapshot = (data) => {
    if (!data) return;
    if (data.updatedAt && data.updatedAt === lastSyncedStampRef.current) return;
    isApplyingRemoteRef.current = true;
    if (data.updatedAt) lastSyncedStampRef.current = data.updatedAt;

    if (Array.isArray(data.courses)) setCourses(normalizeCourses(data.courses));
    if (data.attendance && typeof data.attendance === 'object') setAttendance(data.attendance);
    if (Array.isArray(data.genEds)) setGenEds(normalizeGenEds(data.genEds));
    if (data.manualOverrides && typeof data.manualOverrides === 'object') {
      setManualOverrides({
        transferCredits: Number(data.manualOverrides.transferCredits) || 0,
        priorGpaCredits: Number(data.manualOverrides.priorGpaCredits) || 0,
        priorGpaPoints: Number(data.manualOverrides.priorGpaPoints) || 0,
        fulfilledGenEds: Array.isArray(data.manualOverrides.fulfilledGenEds) ? parsedFulfilled(data) : [],
        manualGenEdCounts: data.manualOverrides.manualGenEdCounts || {}
      });
    }
    // Cloud Sync restores full studyData including streak logs and vacationDays
    if (data.studyData && typeof data.studyData === 'object') {
      setStudyData(normalizeStudyData(data.studyData));
    }
    if (data.settings) {
      if (typeof data.settings.darkMode === 'boolean') setDarkMode(data.settings.darkMode);
      if (data.settings.uiStyle) setUiStyle(data.settings.uiStyle);
      if (data.settings.latePolicy) setLatePolicy(data.settings.latePolicy);
      if (data.settings.classNotifConfig) {
        setClassNotifConfig(normalizeClassNotifConfig(data.settings.classNotifConfig));
      }
    }

    setTimeout(() => {
      isApplyingRemoteRef.current = false;
    }, 350);
  };

  function parsedFulfilled(data) {
    return Array.isArray(data?.manualOverrides?.fulfilledGenEds) ? data.manualOverrides.fulfilledGenEds : [];
  }

  // --- 1. Auto-Sync on App Startup, Auth Change & Real-Time Listener ---
  useEffect(() => {
    let dbUnsub = null;
    const authUnsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (dbUnsub) {
        dbUnsub();
        dbUnsub = null;
      }
      setCloudUser(user || null);

      if (user) {
        const userRef = ref(firebaseDb, `users/${user.uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            applyCloudSnapshot(snapshot.val());
          } else {
            const stamp = new Date().toISOString();
            lastSyncedStampRef.current = stamp;
            await set(userRef, {
              updatedAt: stamp,
              settings: { darkMode, uiStyle, latePolicy, classNotifConfig },
              courses,
              attendance,
              genEds,
              manualOverrides,
              studyData
            });
          }
          setCloudReadyToPush(true);
          setCloudSyncStatus('');
        } catch (err) {
          setCloudReadyToPush(true);
        }

        dbUnsub = onValue(userRef, (snap) => {
          if (snap.exists()) {
            applyCloudSnapshot(snap.val());
          }
        });
      } else {
        setCloudReadyToPush(false);
        setCloudSyncStatus('');
      }
    });

    return () => {
      authUnsub();
      if (dbUnsub) dbUnsub();
    };
  }, []);

  // --- 2. Auto-Sync Every Time You Open / Resume the App ---
  useEffect(() => {
    const syncOnAppOpen = async () => {
      if (document.visibilityState === 'visible' && firebaseAuth.currentUser) {
        try {
          const snapshot = await get(ref(firebaseDb, `users/${firebaseAuth.currentUser.uid}`));
          if (snapshot.exists()) {
            applyCloudSnapshot(snapshot.val());
          }
        } catch (e) {}
      }
    };

    document.addEventListener('visibilitychange', syncOnAppOpen);
    window.addEventListener('focus', syncOnAppOpen);
    return () => {
      document.removeEventListener('visibilitychange', syncOnAppOpen);
      window.removeEventListener('focus', syncOnAppOpen);
    };
  }, []);

  // --- 3. Auto-Push Any Local Change (Including Streak Data & Class Notif Settings) to Cloud ---
  useEffect(() => {
    if (!cloudUser || !cloudReadyToPush || isApplyingRemoteRef.current) return;
    const timer = setTimeout(async () => {
      try {
        const stamp = new Date().toISOString();
        lastSyncedStampRef.current = stamp;
        await set(ref(firebaseDb, `users/${cloudUser.uid}`), {
          updatedAt: stamp,
          settings: { darkMode, uiStyle, latePolicy, classNotifConfig },
          courses,
          attendance,
          genEds,
          manualOverrides,
          studyData
        });
      } catch (e) {}
    }, 600);
    return () => clearTimeout(timer);
  }, [courses, attendance, genEds, manualOverrides, studyData, darkMode, uiStyle, latePolicy, classNotifConfig, cloudUser, cloudReadyToPush]);

  const handleGoogleSignIn = async () => {
    try {
      setCloudSyncStatus('Signing in...');
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result?.credential?.idToken;
        if (!idToken) {
          setCloudSyncStatus('');
          return;
        }
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(firebaseAuth, credential);
      } else {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(firebaseAuth, provider);
      }
      setCloudSyncStatus('');
    } catch (err) {
      setCloudSyncStatus('Sign-In failed: ' + (err?.message || 'Check connection'));
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut().catch(() => {});
      }
      await signOut(firebaseAuth);
      setCloudUser(null);
      setCloudSyncStatus('');
    } catch (e) {}
  };

  // --- Full Edge-to-Edge Status Bar Integration ---
  useEffect(() => {
    const bgHex = darkMode
      ? uiStyle === 'glassy'
        ? '#070510'
        : '#141218'
      : uiStyle === 'glassy'
      ? '#EDE4FF'
      : '#FEF7FF';

    document.documentElement.style.backgroundColor = bgHex;
    document.body.style.backgroundColor = bgHex;

    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#00000000' }).catch(() => {});
      StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light }).catch(() => {});
    }
  }, [darkMode, uiStyle]);

  const allAvailableAttributeTags = useMemo(() => {
    const tagSet = new Set();
    genEds.forEach((g) => {
      if (g.code && !g.code.includes('/')) tagSet.add(g.code.toUpperCase());
      (g.acceptedTags || []).forEach((t) => tagSet.add(String(t).toUpperCase()));
      (g.subRules || []).forEach((sr) => {
        (sr.acceptedTags || []).forEach((t) => tagSet.add(String(t).toUpperCase()));
      });
    });
    courses.forEach((c) => {
      (c.genEds || []).forEach((t) => tagSet.add(String(t).toUpperCase()));
    });
    if (editingCourse && Array.isArray(editingCourse.genEds)) {
      editingCourse.genEds.forEach((t) => tagSet.add(String(t).toUpperCase()));
    }
    return Array.from(tagSet).filter(Boolean).sort();
  }, [genEds, courses, editingCourse]);

  const pdfFilteredCourses = useMemo(() => {
    if (pdfDateFilterMode === 'all') return courses;
    if (pdfDateFilterMode === 'date') {
      const target = pdfTargetDate || todayStr;
      return courses.filter((c) => {
        if (c.startDate && c.startDate > target) return false;
        if (c.endDate && c.endDate < target) return false;
        return true;
      });
    }
    const start = pdfRangeStart || '0000-01-01';
    const end = pdfRangeEnd || '9999-12-31';
    return courses.filter((c) => {
      const cStart = c.startDate || '0000-01-01';
      const cEnd = c.endDate || '9999-12-31';
      return cStart <= end && cEnd >= start;
    });
  }, [courses, pdfDateFilterMode, pdfTargetDate, pdfRangeStart, pdfRangeEnd, todayStr]);

  const pdfPeriodLabel = useMemo(() => {
    if (pdfDateFilterMode === 'all') return 'All Semesters';
    if (pdfDateFilterMode === 'date') return `Active on ${pdfTargetDate}`;
    return `Period: ${pdfRangeStart} to ${pdfRangeEnd}`;
  }, [pdfDateFilterMode, pdfTargetDate, pdfRangeStart, pdfRangeEnd]);

  useEffect(() => {
    async function checkInitialPermission() {
      if (Capacitor.isNativePlatform()) {
        try {
          const status = await LocalNotifications.checkPermissions();
          if (status.display === 'granted') setNotifGranted(true);
        } catch (e) {}
      } else if ('Notification' in window && Notification.permission === 'granted') {
        setNotifGranted(true);
      }
    }
    checkInitialPermission();
  }, []);

  // --- Sync Customizable Multi-Alert Class Reminders & Native Hardware Study Reminders ---
  const syncNotificationsWithOS = async (currentCourses, currentAttendance, currentStudyData, currentClassNotif = classNotifConfig) => {
    // 1. Schedule Exact Native Android AlarmManager Study Reminders
    if (typeof window !== 'undefined' && window.AndroidLiveTimer?.scheduleReminderAlarm) {
      try {
        for (let slot = 500000; slot < 500150; slot++) {
          window.AndroidLiveTimer.cancelReminderAlarm(slot);
        }

        const now = new Date();
        let slotId = 500000;
        if (currentStudyData && Array.isArray(currentStudyData.reminders)) {
          for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + dayOffset);

            currentStudyData.reminders.forEach((rem) => {
              if (!rem.enabled || !rem.time) return;
              const [rH, rM] = rem.time.split(':').map(Number);
              const remTime = new Date(targetDate);
              remTime.setHours(rH, rM, 0, 0);

              const diffMs = remTime.getTime() - now.getTime();
              const finalTriggerMs =
                dayOffset === 0 && diffMs <= 0 && diffMs > -55000
                  ? now.getTime() + 4000
                  : remTime.getTime();

              if (finalTriggerMs > now.getTime() && slotId < 500150) {
                window.AndroidLiveTimer.scheduleReminderAlarm(
                  slotId++,
                  finalTriggerMs,
                  `Time to Study: ${rem.topic || 'Study Session'}`,
                  `Tap to start a Pomodoro or Standard timer session for ${rem.topic || 'your classes'}!`,
                  rem.topic || 'Study Session'
                );
              }
            });
          }
        }
      } catch (e) {}
    }

    if (!Capacitor.isNativePlatform()) return;
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') return;

      await LocalNotifications.createChannel({
        id: 'class-reminders',
        name: 'Class Reminders',
        description: 'Alerts before scheduled college classes and discussions',
        importance: 5,
        visibility: 1,
        vibration: true
      });

      const pending = await LocalNotifications.getPending();
      const nonLivePending = (pending.notifications || []).filter((n) => n.id !== LIVE_TIMER_NOTIF_ID);
      if (nonLivePending.length > 0) {
        await LocalNotifications.cancel({ notifications: nonLivePending });
      }

      // If user disabled class notifications in Settings, stop here after clearing pending class alerts
      if (!currentClassNotif?.enabled) return;

      const leadTimes =
        Array.isArray(currentClassNotif.leadMinutes) && currentClassNotif.leadMinutes.length > 0
          ? currentClassNotif.leadMinutes
          : [30];

      const notifications = [];
      const now = new Date();
      let notifId = 1000;

      for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + dayOffset);
        const dateStr = toLocalDateString(targetDate);
        const dayOfWeek = targetDate.getDay();

        currentCourses.forEach((course) => {
          if (course.startDate && dateStr < course.startDate) return;
          if (course.endDate && dateStr > course.endDate) return;

          (course.sections || []).forEach((section) => {
            const sessionKey = `${course.id}_${section.id}_${dateStr}`;
            const legacyKey = `${course.id}_${dateStr}`;
            if (currentAttendance[sessionKey] === 'cancelled' || currentAttendance[legacyKey] === 'cancelled') return;

            (section.schedule || []).forEach((slot) => {
              if (Number(slot.day) !== dayOfWeek || !slot.startTime) return;
              const [hours, minutes] = slot.startTime.split(':').map(Number);
              const classStart = new Date(targetDate);
              classStart.setHours(hours, minutes, 0, 0);

              // Schedule a notification for EACH custom lead time configured by the user
              leadTimes.forEach((leadMin) => {
                const triggerTime = new Date(classStart.getTime() - Number(leadMin) * 60 * 1000);
                if (triggerTime > now) {
                  const secLabel = section.type ? `${section.type}${section.sectionNumber ? ' ' + section.sectionNumber : ''}` : '';
                  notifications.push({
                    id: notifId++,
                    title: `${course.code}${secLabel ? ' (' + secLabel + ')' : ''} in ${leadMin} Min`,
                    body: `${course.title} starts at ${formatTime12h(slot.startTime)}${slot.room ? ' in ' + slot.room : ''}.`,
                    channelId: 'class-reminders',
                    schedule: { at: triggerTime, allowWhileIdle: true }
                  });
                }
              });
            });
          });
        });
      }

      if (notifications.length > 0) await LocalNotifications.schedule({ notifications });
    } catch (e) {}
  };

  useEffect(() => {
    if (notifGranted) syncNotificationsWithOS(courses, attendance, studyData, classNotifConfig);
  }, [courses, attendance, studyData.reminders, classNotifConfig, notifGranted]);

  const requestNotificationAccess = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display === 'granted') {
          setNotifGranted(true);
          await syncNotificationsWithOS(courses, attendance, studyData, classNotifConfig);
          return true;
        }
      } catch (e) {}
      return false;
    } else if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifGranted(true);
        return true;
      }
      return false;
    } else {
      setNotifGranted(true);
      return true;
    }
  };

  const toggleClassLeadMinute = (mins) => {
    setClassNotifConfig((prev) => {
      const current = Array.isArray(prev.leadMinutes) ? prev.leadMinutes : [30];
      const exists = current.includes(mins);
      let next = exists ? current.filter((m) => m !== mins) : [...current, mins];
      if (next.length === 0) next = [30];
      return {
        ...prev,
        leadMinutes: next.sort((a, b) => a - b)
      };
    });
  };

  const addCustomClassLeadMinute = () => {
    const val = Math.round(Number(customClassLeadInput));
    if (!val || val < 1 || val > 1440) return;
    setClassNotifConfig((prev) => {
      const current = Array.isArray(prev.leadMinutes) ? prev.leadMinutes : [30];
      const next = Array.from(new Set([...current, val])).sort((a, b) => a - b);
      return { ...prev, enabled: true, leadMinutes: next };
    });
    setCustomClassLeadInput('');
  };

  const removeClassLeadMinute = (mins) => {
    setClassNotifConfig((prev) => {
      const current = Array.isArray(prev.leadMinutes) ? prev.leadMinutes : [30];
      const next = current.filter((m) => m !== mins);
      return {
        ...prev,
        leadMinutes: next.length > 0 ? next : [30]
      };
    });
  };

  const handleAddStudyReminder = async () => {
    if (!newReminderTime) return;
    const cleanTopic = newReminderTopic.trim() || 'Study Session';

    let hasPerm = notifGranted;
    if (!hasPerm) {
      hasPerm = await requestNotificationAccess();
    }

    const updatedReminders = [
      ...(studyData.reminders || []),
      {
        id: `rem_${Date.now()}`,
        topic: cleanTopic,
        time: newReminderTime,
        enabled: true
      }
    ];
    const nextStudyData = { ...studyData, reminders: updatedReminders };
    setStudyData(nextStudyData);
    setNewReminderTopic('');

    await syncNotificationsWithOS(courses, attendance, nextStudyData, classNotifConfig);
    if (hasPerm) {
      setReminderSavedToast(`Exact phone alarm set daily for ${formatTime12h(newReminderTime)}!`);
    } else {
      setReminderSavedToast('Reminder added! Allow notifications so your phone can ring.');
    }
    setTimeout(() => setReminderSavedToast(''), 4000);
  };

  const getSessionsForDate = (dateStr) => {
    const [yyyy, mm, dd] = dateStr.split('-').map(Number);
    const dateObj = new Date(yyyy, mm - 1, dd);
    const dayOfWeek = dateObj.getDay();

    const sessions = [];
    courses.forEach((course) => {
      if (course.startDate && dateStr < course.startDate) return;
      if (course.endDate && dateStr > course.endDate) return;

      (course.sections || []).forEach((section) => {
        (section.schedule || []).forEach((slot) => {
          if (Number(slot.day) === dayOfWeek) {
            const logKey = `${course.id}_${section.id}_${dateStr}`;
            const legacyKey = `${course.id}_${dateStr}`;
            const status = attendance[logKey] || attendance[legacyKey] || null;
            sessions.push({ sessionKey: logKey, course, section, slot, status });
          }
        });
      });
    });

    return sessions.sort((a, b) => (a.slot.startTime || '').localeCompare(b.slot.startTime || ''));
  };

  const markSessionAttendance = (sessionKey, newStatus) => {
    setAttendance((prev) => {
      const current = prev[sessionKey];
      const updated = { ...prev };
      if (current === newStatus) delete updated[sessionKey];
      else updated[sessionKey] = newStatus;
      return updated;
    });
  };

  const attendanceSummary = useMemo(() => {
    let present = 0, late = 0, absent = 0, cancelled = 0;
    Object.values(attendance).forEach((s) => {
      if (s === 'present') present++;
      else if (s === 'late') late++;
      else if (s === 'absent') absent++;
      else if (s === 'cancelled') cancelled++;
    });
    const totalCounted = present + late + absent;
    const lateWeight = latePolicy === 'present' ? 1.0 : latePolicy === 'absent' ? 0.0 : 0.5;
    const rate = totalCounted > 0 ? Math.round(((present + late * lateWeight) / totalCounted) * 100) : 100;
    return { present, late, absent, cancelled, totalCounted, rate };
  }, [attendance, latePolicy]);

  const academicStats = useMemo(() => {
    let courseCreditsCompleted = 0;
    let courseCreditsInProgress = 0;
    let upcomingCredits = 0;
    let gpaCredits = Number(manualOverrides.priorGpaCredits) || 0;
    let gpaQualityPoints = Number(manualOverrides.priorGpaPoints) || 0;

    courses.forEach((course) => {
      const cr = Number(course.credits) || 0;
      const pts = GRADE_POINTS[course.grade];
      const isFutureCourse = Boolean(course.startDate && course.startDate > todayStr);

      if (course.grade === 'In Progress') {
        if (isFutureCourse) {
          upcomingCredits += cr;
        } else {
          courseCreditsInProgress += cr;
        }
      } else if (course.grade === 'Pass') {
        if (!isFutureCourse) courseCreditsCompleted += cr;
      } else if (pts !== undefined && pts !== null) {
        if (pts > 0) courseCreditsCompleted += cr;
        gpaCredits += cr;
        gpaQualityPoints += cr * pts;
      }
    });

    const totalEarnedCredits = courseCreditsCompleted + (Number(manualOverrides.transferCredits) || 0);
    const cumulativeGpa = gpaCredits > 0 ? (gpaQualityPoints / gpaCredits).toFixed(2) : '4.00';
    return { totalEarnedCredits, courseCreditsInProgress, upcomingCredits, cumulativeGpa };
  }, [courses, manualOverrides, todayStr]);

  const handleExportPdfFile = async () => {
    try {
      setPdfStatusMsg('Generating PDF...');
      const pdfBytes = buildSchedulePdfBytes(pdfFilteredCourses, printFormat, academicStats, pdfPeriodLabel);
      const fileName = `ClassTrack_Schedule_${printFormat}.pdf`;

      if (Capacitor.isNativePlatform()) {
        const base64Data = uint8ToBase64(pdfBytes);

        try {
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents
          });
        } catch (docErr) {}

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        setPdfStatusMsg('Opening Android Save / Share menu...');
        await Share.share({
          title: 'Class Track Schedule PDF',
          text: `My college course schedule (${pdfPeriodLabel})`,
          url: savedFile.uri,
          dialogTitle: 'Save or Print Schedule PDF'
        });

        setPdfStatusMsg('Saved to Documents & Shared!');
        setTimeout(() => setPdfStatusMsg(''), 3500);
        return;
      }

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setPdfStatusMsg('Downloaded PDF!');
      setTimeout(() => setPdfStatusMsg(''), 3000);
    } catch (err) {
      setPdfStatusMsg('');
    }
  };

  // --- Local Backup File Export: Intentionally Excludes Streak Data (logs & vacationDays) ---
  const handleExportBackupData = async () => {
    try {
      setBackupStatusMsg('Preparing backup file...');
      const studyPreferencesOnly = {
        dailyGoalMinutes: studyData.dailyGoalMinutes,
        pomoWorkMins: studyData.pomoWorkMins,
        pomoBreakMins: studyData.pomoBreakMins,
        normalMins: studyData.normalMins,
        reminders: studyData.reminders || []
        // logs and vacationDays are intentionally omitted from local JSON files so streaks cannot be edited/forged
      };

      const payload = {
        app: 'ClassTrack',
        version: 4,
        exportedAt: new Date().toISOString(),
        settings: { darkMode, uiStyle, latePolicy, classNotifConfig },
        courses,
        attendance,
        genEds,
        manualOverrides,
        studyPreferences: studyPreferencesOnly
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const fileName = `ClassTrack_Backup_${todayStr}.classtrack.json`;

      if (Capacitor.isNativePlatform()) {
        const base64Data = stringToBase64Utf8(jsonStr);
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents
          });
        } catch (e) {}

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'Class Track Backup',
          text: 'Class Track backup file (.classtrack.json)',
          url: savedFile.uri,
          dialogTitle: 'Save Class Track Backup File'
        });

        setBackupStatusMsg('Backup exported (streak data excluded)!');
        setTimeout(() => setBackupStatusMsg(''), 4000);
        return;
      }

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setBackupStatusMsg('Backup downloaded (streak data excluded)!');
      setTimeout(() => setBackupStatusMsg(''), 3500);
    } catch (err) {
      setBackupStatusMsg('');
    }
  };

  // --- Local Backup File Import: Restores Courses/Settings but Never Imports Streak Data from JSON ---
  const handleImportBackupFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result || ''));
        if (!parsed || (!Array.isArray(parsed.courses) && !Array.isArray(parsed.genEds))) {
          setBackupStatusMsg('Invalid backup file format.');
          setTimeout(() => setBackupStatusMsg(''), 4000);
          return;
        }

        if (Array.isArray(parsed.courses)) setCourses(normalizeCourses(parsed.courses));
        if (parsed.attendance && typeof parsed.attendance === 'object') setAttendance(parsed.attendance);
        if (Array.isArray(parsed.genEds)) setGenEds(normalizeGenEds(parsed.genEds));
        if (parsed.manualOverrides && typeof parsed.manualOverrides === 'object') {
          setManualOverrides({
            transferCredits: Number(parsed.manualOverrides.transferCredits) || 0,
            priorGpaCredits: Number(parsed.manualOverrides.priorGpaCredits) || 0,
            priorGpaPoints: Number(parsed.manualOverrides.priorGpaPoints) || 0,
            fulfilledGenEds: Array.isArray(parsed.manualOverrides.fulfilledGenEds) ? parsed.manualOverrides.fulfilledGenEds : [],
            manualGenEdCounts: parsed.manualOverrides.manualGenEdCounts || {}
          });
        }

        // Only import timer durations & reminders; strictly keep existing local/cloud streak logs & vacationDays
        const incomingStudy = parsed.studyPreferences || parsed.studyData;
        if (incomingStudy && typeof incomingStudy === 'object') {
          setStudyData((prev) => ({
            ...prev,
            dailyGoalMinutes: Math.max(1, Number(incomingStudy.dailyGoalMinutes) || prev.dailyGoalMinutes || 60),
            pomoWorkMins: Math.max(1, Number(incomingStudy.pomoWorkMins) || prev.pomoWorkMins || 25),
            pomoBreakMins: Math.max(1, Number(incomingStudy.pomoBreakMins) || prev.pomoBreakMins || 5),
            normalMins: Math.max(1, Number(incomingStudy.normalMins) || prev.normalMins || 45),
            reminders: Array.isArray(incomingStudy.reminders) ? incomingStudy.reminders : prev.reminders,
            logs: prev.logs || {},
            vacationDays: prev.vacationDays || []
          }));
        }

        if (parsed.settings) {
          if (typeof parsed.settings.darkMode === 'boolean') setDarkMode(parsed.settings.darkMode);
          if (parsed.settings.uiStyle) setUiStyle(parsed.settings.uiStyle);
          if (parsed.settings.latePolicy) setLatePolicy(parsed.settings.latePolicy);
          if (parsed.settings.classNotifConfig) {
            setClassNotifConfig(normalizeClassNotifConfig(parsed.settings.classNotifConfig));
          }
        }

        setBackupStatusMsg('Data restored (streak data kept intact)!');
        setTimeout(() => setBackupStatusMsg(''), 4000);
      } catch (err) {
        setBackupStatusMsg('Could not read backup file.');
        setTimeout(() => setBackupStatusMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const adjustManualGenEdCount = (key, delta, legacyCode = null) => {
    setManualOverrides((prev) => {
      const counts = { ...(prev.manualGenEdCounts || {}) };
      const legacyList = Array.isArray(prev.fulfilledGenEds) ? prev.fulfilledGenEds : [];
      const fallbackBase =
        counts[key] !== undefined
          ? Number(counts[key])
          : legacyCode && legacyList.includes(legacyCode)
          ? 1
          : 0;
      const nextVal = Math.max(0, fallbackBase + delta);
      counts[key] = nextVal;
      return {
        ...prev,
        fulfilledGenEds: legacyCode ? legacyList.filter((c) => c !== legacyCode) : legacyList,
        manualGenEdCounts: counts
      };
    });
  };

  const openAddGenEdModal = () => {
    setEditingGenEd({
      id: `gened_${Date.now()}`,
      code: '',
      name: '',
      mode: 'simple',
      requiredCount: 1,
      acceptedTagsInput: '',
      subRules: [
        { id: `sr_${Date.now()}_1`, label: 'Part 1', requiredCount: 2, acceptedTagsInput: '' },
        { id: `sr_${Date.now()}_2`, label: 'Part 2', requiredCount: 3, acceptedTagsInput: '' }
      ]
    });
    setIsGenEdModalOpen(true);
  };

  const openEditGenEdModal = (req) => {
    const existingSubRules =
      Array.isArray(req.subRules) && req.subRules.length > 0
        ? req.subRules.map((sr) => ({
            ...sr,
            acceptedTagsInput: (sr.acceptedTags || []).join(', ')
          }))
        : [
            { id: `sr_${Date.now()}_1`, label: 'Part 1', requiredCount: 2, acceptedTagsInput: req.code || '' },
            { id: `sr_${Date.now()}_2`, label: 'Part 2', requiredCount: 3, acceptedTagsInput: '' }
          ];

    setEditingGenEd({
      id: req.id,
      code: req.code || '',
      name: req.name || '',
      mode: req.mode === 'composite' ? 'composite' : 'simple',
      requiredCount: Math.max(1, Number(req.requiredCount) || 1),
      acceptedTagsInput: (req.acceptedTags && req.acceptedTags.length > 0 ? req.acceptedTags : [req.code]).join(', '),
      subRules: existingSubRules
    });
    setIsGenEdModalOpen(true);
  };

  const saveGenEdModal = () => {
    if (!editingGenEd) return;
    const cleanCode = editingGenEd.code.trim().toUpperCase();
    if (!cleanCode) return;

    const parsedAccepted = String(editingGenEd.acceptedTagsInput || '')
      .split(/[,/\s]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const defaultTags = cleanCode
      .split(/[,/\s]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const finalAcceptedTags = parsedAccepted.length > 0 ? parsedAccepted : defaultTags.length > 0 ? defaultTags : [cleanCode];

    const cleanedSubRules =
      editingGenEd.mode === 'composite'
        ? (editingGenEd.subRules || []).map((sr, idx) => {
            const tags = String(sr.acceptedTagsInput || '')
              .split(/[,/\s]+/)
              .map((t) => t.trim().toUpperCase())
              .filter(Boolean);
            return {
              id: sr.id || `sr_${Date.now()}_${idx}`,
              label: (sr.label || `Part ${idx + 1}`).trim(),
              requiredCount: Math.max(1, Number(sr.requiredCount) || 1),
              acceptedTags: tags.length > 0 ? tags : [cleanCode]
            };
          })
        : [];

    const savedObj = {
      id: editingGenEd.id,
      code: cleanCode,
      name: editingGenEd.name.trim() || cleanCode,
      mode: editingGenEd.mode,
      requiredCount: Math.max(1, Number(editingGenEd.requiredCount) || 1),
      acceptedTags: finalAcceptedTags,
      subRules: cleanedSubRules
    };

    setGenEds((prev) => {
      const exists = prev.some((g) => g.id === savedObj.id);
      return exists ? prev.map((g) => (g.id === savedObj.id ? savedObj : g)) : [...prev, savedObj];
    });

    setIsGenEdModalOpen(false);
    setEditingGenEd(null);
  };

  const deleteGenEdRequirement = (id) => {
    setGenEds((prev) => prev.filter((g) => g.id !== id));
    setIsGenEdModalOpen(false);
    setEditingGenEd(null);
  };

  const openAddCourseModal = () => {
    setCustomCourseTagInput('');
    setEditingCourse({
      id: `course_${Date.now()}`,
      code: '',
      title: '',
      credits: 4,
      grade: 'In Progress',
      color: 'violet',
      startDate: todayStr,
      endDate: '2026-12-15',
      genEds: [],
      sections: [
        {
          id: `sec_${Date.now()}_1`,
          type: 'Lecture',
          sectionNumber: '01',
          professor: '',
          schedule: [{ day: 1, startTime: '10:00', endTime: '11:00', room: '', isCustom: false }]
        }
      ]
    });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course) => {
    setCustomCourseTagInput('');
    const cloned = JSON.parse(JSON.stringify(course));
    cloned.sections = (cloned.sections || []).map((sec) => {
      const sched = sec.schedule || [];
      if (sched.length <= 1) return sec;
      const first = sched[0];
      return {
        ...sec,
        schedule: sched.map((slot, idx) => {
          if (idx === 0) return { ...slot, isCustom: false };
          const matchesFirst =
            slot.startTime === first.startTime &&
            slot.endTime === first.endTime &&
            (slot.room || '') === (first.room || '');
          return { ...slot, isCustom: slot.isCustom ?? !matchesFirst };
        })
      };
    });
    setEditingCourse(cloned);
    setIsCourseModalOpen(true);
  };

  const saveCourseModal = () => {
    if (!editingCourse.title.trim() && !editingCourse.code.trim()) return;
    setCourses((prev) => {
      const exists = prev.some((c) => c.id === editingCourse.id);
      return exists ? prev.map((c) => (c.id === editingCourse.id ? editingCourse : c)) : [...prev, editingCourse];
    });
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const deleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const addSectionToEditingCourse = () => {
    setEditingCourse((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `sec_${Date.now()}_${prev.sections.length + 1}`,
          type: 'Discussion',
          sectionNumber: 'A1',
          professor: '',
          schedule: [{ day: 5, startTime: '13:00', endTime: '14:00', room: '', isCustom: false }]
        }
      ]
    }));
  };

  const updateSectionField = (secIndex, field, value) => {
    setEditingCourse((prev) => {
      const updated = [...prev.sections];
      updated[secIndex] = { ...updated[secIndex], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const removeSectionFromEditingCourse = (secIndex) => {
    setEditingCourse((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== secIndex)
    }));
  };

  const toggleDayInSection = (secIndex, dayNum) => {
    setEditingCourse((prev) => {
      const updatedSections = [...prev.sections];
      const sec = { ...updatedSections[secIndex] };
      const exists = sec.schedule.some((s) => Number(s.day) === dayNum);
      if (exists) {
        sec.schedule = sec.schedule.filter((s) => Number(s.day) !== dayNum);
      } else {
        const firstSlot = sec.schedule[0] || { startTime: '10:00', endTime: '11:00', room: '' };
        sec.schedule = [
          ...sec.schedule,
          {
            day: dayNum,
            startTime: firstSlot.startTime,
            endTime: firstSlot.endTime,
            room: firstSlot.room,
            isCustom: false
          }
        ].sort((a, b) => a.day - b.day);
      }
      updatedSections[secIndex] = sec;
      return { ...prev, sections: updatedSections };
    });
  };

  const updateSlotInSection = (secIndex, dayNum, field, value) => {
    setEditingCourse((prev) => {
      const updatedSections = [...prev.sections];
      const sec = { ...updatedSections[secIndex] };
      const sortedSchedule = [...sec.schedule].sort((a, b) => a.day - b.day);
      const isFirstDay = sortedSchedule.length > 0 && Number(sortedSchedule[0].day) === dayNum;
      const oldFirstVal = isFirstDay ? sortedSchedule[0][field] : null;

      sec.schedule = sortedSchedule.map((slot, idx) => {
        if (Number(slot.day) === dayNum) {
          return { ...slot, [field]: value, isCustom: idx === 0 ? false : true };
        }
        if (isFirstDay && (!slot.isCustom || slot[field] === oldFirstVal)) {
          return { ...slot, [field]: value };
        }
        return slot;
      });

      updatedSections[secIndex] = sec;
      return { ...prev, sections: updatedSections };
    });
  };

  const resyncSlotToFirstDay = (secIndex, dayNum) => {
    setEditingCourse((prev) => {
      const updatedSections = [...prev.sections];
      const sec = { ...updatedSections[secIndex] };
      const firstSlot = sec.schedule[0];
      if (!firstSlot) return prev;
      sec.schedule = sec.schedule.map((slot) =>
        Number(slot.day) === dayNum
          ? {
              ...slot,
              startTime: firstSlot.startTime,
              endTime: firstSlot.endTime,
              room: firstSlot.room,
              isCustom: false
            }
          : slot
      );
      updatedSections[secIndex] = sec;
      return { ...prev, sections: updatedSections };
    });
  };

  const isGlassy = uiStyle === 'glassy';
  const theme = {
    bg: darkMode
      ? isGlassy
        ? 'bg-[#070510] text-[#F5F0FF]'
        : 'bg-[#141218] text-[#E6E0E9]'
      : isGlassy
      ? 'bg-[#EDE4FF] text-[#1A1426]'
      : 'bg-[#FEF7FF] text-[#1D1B20]',
    glassCard: isGlassy
      ? darkMode
        ? 'glass-panel-dark'
        : 'glass-panel-light'
      : darkMode
      ? 'bg-[#211F26] border-2 border-[#36343B] shadow-md'
      : 'bg-[#F3EDF7] border-2 border-[#E6DDF3] shadow-sm',
    surfaceElevated: isGlassy
      ? darkMode
        ? 'glass-sub-dark'
        : 'glass-sub-light'
      : darkMode
      ? 'bg-[#2C2933] border border-white/5'
      : 'bg-white border border-[#E7E0EC]',
    subtext: darkMode ? 'text-[#CCC4DC]' : 'text-[#4E465E]',
    border: darkMode ? 'border-white/15' : 'border-indigo-950/10',
    primaryPill: darkMode
      ? 'bg-[#D0BCFF] text-[#32186A] shadow-md shadow-purple-950/30'
      : 'bg-[#6347A6] text-white shadow-md shadow-indigo-900/20',
    tonalPill: isGlassy
      ? darkMode
        ? 'bg-purple-500/30 text-purple-100 border border-purple-300/30 backdrop-blur-md'
        : 'bg-purple-500/20 text-[#260868] border border-white/80 backdrop-blur-md'
      : darkMode
      ? 'bg-[#4A3582] text-[#EADDFF]'
      : 'bg-[#E8DDFF] text-[#23065E]'
  };

  const getColorStyle = (colorId) => {
    const found = COURSE_COLORS.find((c) => c.id === colorId) || COURSE_COLORS[0];
    return {
      bg: darkMode ? found.darkBg : found.lightBg,
      text: darkMode ? found.darkText : found.lightText,
      border: found.border
    };
  };

  const todaySessions = getSessionsForDate(todayStr);
  const selectedDateSessions = getSessionsForDate(selectedDate);

  const timerProgressFraction =
    timerTotalSeconds > 0
      ? Math.min(1, Math.max(0, (timerTotalSeconds - timerSecondsLeft) / timerTotalSeconds))
      : 0;
  const ringRadius = 108;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference * (1 - timerProgressFraction);

  return (
    <div
      className={`min-h-screen pb-40 transition-colors duration-500 font-sans relative overflow-x-hidden ${theme.bg} ${
        isGlassy ? 'mode-glassy' : 'mode-expressive'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 26px)' }}
    >
      <ConfettiCanvas active={confettiActive} />
      <GitHubStartupUpdateModal updater={gitHubUpdater} theme={theme} />

      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* 1. EXPRESSIVE BOUNCY ANIMATIONS */
        @keyframes launchExpressiveBounce {
          0% {
            opacity: 0;
            transform: translateY(36px) scale(0.92);
          }
          60% {
            opacity: 1;
            transform: translateY(-8px) scale(1.015);
          }
          82% {
            transform: translateY(3px) scale(0.995);
          }
          100% {
            opacity: 1;
            transform: none;
          }
        }
        .app-launch-expressive {
          animation: launchExpressiveBounce 0.72s cubic-bezier(0.34, 1.65, 0.64, 1);
        }

        /* 2. SILKY SMOOTH GLASSY FADE-IN ANIMATION */
        @keyframes glassSmoothFadeIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: none;
          }
        }
        .app-launch-glass {
          animation: glassSmoothFadeIn 0.62s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }

        .mode-glassy .m3-card-enter > * {
          animation: glassSmoothFadeIn 0.58s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        .mode-glassy .m3-card-enter > *:nth-child(1) { animation-delay: 0.03s; }
        .mode-glassy .m3-card-enter > *:nth-child(2) { animation-delay: 0.09s; }
        .mode-glassy .m3-card-enter > *:nth-child(3) { animation-delay: 0.15s; }
        .mode-glassy .m3-card-enter > *:nth-child(4) { animation-delay: 0.21s; }
        .mode-glassy .m3-card-enter > *:nth-child(5) { animation-delay: 0.27s; }

        /* TRUE FROSTED GLASSY SURFACES */
        .glass-panel-light {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.24) 100%);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 30px 0 rgba(55, 30, 110, 0.1),
                      inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
        }
        .glass-panel-dark {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.13) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 34px 0 rgba(0, 0, 0, 0.45),
                      inset 0 1px 1px 0 rgba(255, 255, 255, 0.25);
        }
        .glass-sub-light {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(16px) saturate(170%);
          -webkit-backdrop-filter: blur(16px) saturate(170%);
          border: 1px solid rgba(255, 255, 255, 0.75);
        }
        .glass-sub-dark {
          background: rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(16px) saturate(170%);
          -webkit-backdrop-filter: blur(16px) saturate(170%);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Red Streak Glow & Green Goal Glow */
        .streak-glow-red {
          background: rgba(239, 68, 68, 0.16) !important;
          border: 1.5px solid rgba(239, 68, 68, 0.65) !important;
          box-shadow: 0 0 26px rgba(239, 68, 68, 0.42), inset 0 0 14px rgba(239, 68, 68, 0.22) !important;
        }
        .goal-glow-green {
          background: rgba(16, 185, 129, 0.16) !important;
          border: 1.5px solid rgba(16, 185, 129, 0.65) !important;
          box-shadow: 0 0 26px rgba(16, 185, 129, 0.42), inset 0 0 14px rgba(16, 185, 129, 0.22) !important;
        }

        /* Floating Drifting Color Orbs Behind Frosted Glass */
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, 50px) scale(1.12); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-45px, -35px) scale(1.14); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        .orb-float-1 { animation: floatOrb1 12s ease-in-out infinite; }
        .orb-float-2 { animation: floatOrb2 15s ease-in-out infinite; }
        .orb-float-3 { animation: floatOrb3 13s ease-in-out infinite; }

        /* BUTTON & CARD INTERACTIONS */
        .m3-btn {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background-color 0.22s ease,
                      color 0.22s ease,
                      opacity 0.22s ease;
        }
        .m3-btn:active {
          transform: scale(0.91);
        }
        .mode-expressive .m3-btn {
          transition: transform 0.48s cubic-bezier(0.34, 2.05, 0.64, 1),
                      background-color 0.25s ease;
        }
        .mode-expressive .m3-btn:active {
          transform: scale(0.84) rotate(-1.2deg);
        }

        .mode-expressive .m3-card-enter > * {
          animation: m3ExpressivePop 0.6s cubic-bezier(0.34, 1.65, 0.56, 1) backwards;
        }
        .mode-expressive .m3-card-enter > *:nth-child(1) { animation-delay: 0.02s; }
        .mode-expressive .m3-card-enter > *:nth-child(2) { animation-delay: 0.08s; }
        .mode-expressive .m3-card-enter > *:nth-child(3) { animation-delay: 0.14s; }
        .mode-expressive .m3-card-enter > *:nth-child(4) { animation-delay: 0.20s; }
        .mode-expressive .m3-card-enter > *:nth-child(5) { animation-delay: 0.26s; }

        @keyframes m3ExpressivePop {
          0% { opacity: 0; transform: translateY(32px) scale(0.9); }
          68% { opacity: 1; transform: translateY(-6px) scale(1.02); }
          100% { opacity: 1; transform: none; }
        }

        @keyframes expressivePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .mode-expressive .expressive-badge {
          animation: expressivePulse 3.2s ease-in-out infinite;
        }
      `}</style>

      {/* Vibrant Floating Color Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`orb-float-1 absolute -top-16 -left-16 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 ${
            isGlassy ? 'opacity-80' : 'opacity-15'
          } ${darkMode ? 'bg-violet-600/60' : 'bg-violet-400/75'}`}
        />
        <div
          className={`orb-float-2 absolute top-1/4 -right-16 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 ${
            isGlassy ? 'opacity-75' : 'opacity-10'
          } ${darkMode ? 'bg-cyan-500/50' : 'bg-teal-300/80'}`}
        />
        <div
          className={`orb-float-3 absolute bottom-20 left-8 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700 ${
            isGlassy ? 'opacity-75' : 'opacity-10'
          } ${darkMode ? 'bg-fuchsia-600/50' : 'bg-rose-300/75'}`}
        />
      </div>

      {/* ================= FLOATING ROUNDED TOP APP BAR ================= */}
      <div
        key={`hdr_${uiStyle}_${animTrigger}`}
        className={`sticky top-3 z-30 px-4 pt-3 pb-2 max-w-lg mx-auto ${
          isGlassy ? 'app-launch-glass' : 'app-launch-expressive'
        }`}
      >
        <header className={`rounded-[32px] px-5 py-4 flex items-center justify-between transition-all duration-300 ${theme.glassCard}`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm expressive-badge ${theme.tonalPill}`}>
              <UniversityLogoIcon className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[11px] font-bold tracking-widest uppercase ${theme.subtext}`}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight">Class Track</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className={`p-3.5 rounded-full m3-btn ${theme.surfaceElevated}`}
            aria-label="Open Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 px-4 max-w-lg mx-auto space-y-6 mt-5">
        {/* ================= TODAY TAB ================= */}
        {activeTab === 'today' && (
          <div key={`today_${uiStyle}_${animTrigger}`} className="space-y-6 m3-card-enter">
            {!notifGranted && classNotifConfig.enabled && (
              <div className={`p-5 rounded-[32px] ${theme.glassCard} flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3.5">
                  <div className={`p-3.5 rounded-full ${theme.tonalPill}`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Enable Class Alerts</h3>
                    <p className={`text-xs mt-0.5 ${theme.subtext}`}>
                      Get lock-screen notifications ({(classNotifConfig.leadMinutes || [30]).map((m) => `${m}m`).join(', ')} prior) before classes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={requestNotificationAccess}
                  className={`px-5 py-3 rounded-full text-sm font-bold shrink-0 m3-btn ${theme.primaryPill}`}
                >
                  Allow
                </button>
              </div>
            )}

            <div className={`rounded-[32px] p-5 ${theme.glassCard}`}>
              <button
                onClick={() => setShowAttendanceDrawer(!showAttendanceDrawer)}
                className="w-full flex items-center justify-between m3-btn"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="min-w-[68px] h-14 px-3.5 rounded-2xl flex items-center justify-center font-extrabold text-base tracking-tight shadow-inner shrink-0 expressive-badge"
                    style={{ backgroundColor: darkMode ? '#4F378B' : '#EADDFF', color: darkMode ? '#EADDFF' : '#21005D' }}
                  >
                    {attendanceSummary.rate}%
                  </div>
                  <div className="text-left">
                    <h2 className="font-extrabold text-lg">Semester Attendance</h2>
                    <p className={`text-xs font-medium mt-0.5 ${theme.subtext}`}>
                      {attendanceSummary.present} Present · {attendanceSummary.late} Late · {attendanceSummary.absent} Absent
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-full shrink-0 ${theme.surfaceElevated}`}>
                  {showAttendanceDrawer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {showAttendanceDrawer && (
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 space-y-2.5 m3-card-enter">
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3.5 rounded-3xl flex items-center justify-between px-5 ${theme.surfaceElevated}`}>
                      <span className={`text-xs font-bold ${theme.subtext}`}>Present</span>
                      <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {attendanceSummary.present}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-3xl flex items-center justify-between px-5 ${theme.surfaceElevated}`}>
                      <span className={`text-xs font-bold ${theme.subtext}`}>Late</span>
                      <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                        {attendanceSummary.late}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-3xl flex items-center justify-between px-5 ${theme.surfaceElevated}`}>
                      <span className={`text-xs font-bold ${theme.subtext}`}>Absent</span>
                      <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                        {attendanceSummary.absent}
                      </span>
                    </div>
                    <div className={`p-3.5 rounded-3xl flex items-center justify-between px-5 ${theme.surfaceElevated}`}>
                      <span className={`text-xs font-bold ${theme.subtext}`}>Cancelled</span>
                      <span className="text-xl font-extrabold text-slate-500">
                        {attendanceSummary.cancelled}
                      </span>
                    </div>
                  </div>
                  <p className={`text-[11px] font-semibold text-center pt-1 ${theme.subtext}`}>
                    Late classes count as: {latePolicy === 'present' ? 'Present (100%)' : latePolicy === 'absent' ? 'Absent (0%)' : 'Half Credit (50%)'} (Change in Settings)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
              <h2 className="text-2xl font-extrabold tracking-tight">Today's Schedule</h2>
              <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${theme.glassCard}`}>
                {todaySessions.length} {todaySessions.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <div className={`rounded-[32px] p-10 text-center ${theme.glassCard}`}>
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-extrabold text-lg">No classes scheduled today</p>
                <p className={`text-sm mt-1 ${theme.subtext}`}>Enjoy your free day or add courses in the Classes tab.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {todaySessions.map(({ sessionKey, course, section, slot, status }) => {
                  const cStyle = getColorStyle(course.color);
                  return (
                    <div
                      key={sessionKey}
                      className={`rounded-[32px] p-6 transition-all duration-300 ${theme.glassCard} ${
                        status === 'cancelled' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className="px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide"
                              style={{ backgroundColor: cStyle.bg, color: cStyle.text }}
                            >
                              {course.code}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.surfaceElevated}`}>
                              {section.type} {section.sectionNumber}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-xl mt-3 leading-snug">{course.title}</h3>
                        </div>
                        <div className={`px-3.5 py-2 rounded-2xl text-right shrink-0 ${theme.surfaceElevated}`}>
                          <p className="font-extrabold text-sm">{formatTime12h(slot.startTime)}</p>
                          <p className={`text-xs font-medium ${theme.subtext}`}>{formatTime12h(slot.endTime)}</p>
                        </div>
                      </div>

                      <div className={`flex flex-wrap items-center gap-4 mt-4 text-sm font-medium ${theme.subtext}`}>
                        {slot.room && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" /> {slot.room}
                          </span>
                        )}
                        {section.professor && (
                          <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" /> {section.professor}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2.5 mt-5">
                        {[
                          { id: 'present', label: 'Present', icon: CheckCircle2, activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' },
                          { id: 'late', label: 'Late', icon: Clock, activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/30' },
                          { id: 'absent', label: 'Absent', icon: XCircle, activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-600/30' },
                          { id: 'cancelled', label: 'Cancel', icon: Ban, activeBg: 'bg-slate-600 text-white shadow-md shadow-slate-600/30' }
                        ].map((btn) => {
                          const Icon = btn.icon;
                          const isSelected = status === btn.id;
                          return (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() => markSessionAttendance(sessionKey, btn.id)}
                              className={`w-full py-3 px-1 rounded-full flex flex-col items-center justify-center gap-1 text-xs font-bold text-center m3-btn ${
                                isSelected
                                  ? `${btn.activeBg} scale-[1.06]`
                                  : `${theme.surfaceElevated} ${theme.subtext}`
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{btn.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= CALENDAR TAB ================= */}
        {activeTab === 'calendar' && (
          <div key={`calendar_${uiStyle}_${animTrigger}`} className="space-y-6 m3-card-enter">
            <div className={`rounded-[32px] p-6 ${theme.glassCard}`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-extrabold text-xl">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className={`p-2.5 rounded-full m3-btn ${theme.surfaceElevated}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                      setSelectedDate(toLocalDateString(now));
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold m3-btn ${theme.surfaceElevated}`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className={`p-2.5 rounded-full m3-btn ${theme.surfaceElevated}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-xs font-bold mb-2 opacity-60">
                {DAYS_SHORT.map((d) => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {(() => {
                  const year = calendarMonth.getFullYear();
                  const month = calendarMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const cells = [];

                  for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty_${i}`} className="h-12" />);

                  for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const daySessions = getSessionsForDate(dateStr);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;

                    cells.push(
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`h-12 rounded-full flex flex-col items-center justify-center relative m3-btn ${
                          isSelected ? `${theme.primaryPill} scale-105` : isToday ? `${theme.tonalPill} font-extrabold` : ''
                        }`}
                      >
                        <span className="text-sm font-bold">{d}</span>
                        {daySessions.length > 0 && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {daySessions.slice(0, 4).map((s, idx) => {
                              const dotColor =
                                s.status === 'present' ? 'bg-emerald-500' :
                                s.status === 'late' ? 'bg-amber-500' :
                                s.status === 'absent' ? 'bg-rose-500' :
                                s.status === 'cancelled' ? 'bg-slate-400' :
                                isSelected ? 'bg-current opacity-80' : 'bg-[#6750A4] dark:bg-[#D0BCFF]';
                              return <span key={idx} className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />;
                            })}
                          </div>
                        )}
                      </button>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-xl px-1">
                Schedule for{' '}
                {(() => {
                  const [y, m, d] = selectedDate.split('-').map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                })()}
              </h3>

              {selectedDateSessions.length === 0 ? (
                <div className={`rounded-[32px] p-8 text-center ${theme.glassCard}`}>
                  <p className={`text-sm font-medium ${theme.subtext}`}>No classes scheduled on this date.</p>
                </div>
              ) : (
                selectedDateSessions.map(({ sessionKey, course, section, slot, status }) => {
                  const cStyle = getColorStyle(course.color);
                  return (
                    <div key={sessionKey} className={`rounded-[32px] p-5 ${theme.glassCard}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold" style={{ backgroundColor: cStyle.bg, color: cStyle.text }}>
                            {course.code}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme.surfaceElevated}`}>
                            {section.type} {section.sectionNumber}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-lg mt-2.5">{course.title}</h4>
                        <p className={`text-xs font-medium mt-1 ${theme.subtext}`}>
                          {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                          {slot.room ? ` · ${slot.room}` : ''}
                          {section.professor ? ` · ${section.professor}` : ''}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {[
                          { id: 'present', label: 'Present', activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' },
                          { id: 'late', label: 'Late', activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/30' },
                          { id: 'absent', label: 'Absent', activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-600/30' },
                          { id: 'cancelled', label: 'Cancel', activeBg: 'bg-slate-600 text-white shadow-md shadow-slate-600/30' }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => markSessionAttendance(sessionKey, btn.id)}
                            className={`w-full py-2.5 px-1 rounded-full flex items-center justify-center text-center text-xs font-bold m3-btn ${
                              status === btn.id
                                ? `${btn.activeBg} scale-[1.06]`
                                : `${theme.surfaceElevated} ${theme.subtext}`
                            }`}
                          >
                            <span className="truncate">{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= STUDY TAB ================= */}
        {activeTab === 'study' && (
          <div key={`study_${uiStyle}_${animTrigger}`} className="space-y-6 m3-card-enter">
            {celebrationBanner && (
              <div className="p-4 rounded-[28px] bg-emerald-600 text-white font-extrabold text-sm text-center shadow-lg flex items-center justify-center gap-2 m3-card-enter">
                <Trophy className="w-5 h-5 shrink-0" />
                <span>{celebrationBanner}</span>
              </div>
            )}

            {/* 1. Streak (Glows Red when Active) & Daily Study Goal (Glows Green when Completed) */}
            <div className={`rounded-[32px] p-6 space-y-4 ${theme.glassCard}`}>
              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div
                  className={`p-4 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 ${
                    studyMetrics.isTodayStreakCompleted
                      ? 'streak-glow-red'
                      : theme.surfaceElevated
                  }`}
                >
                  <div
                    className={`flex items-center justify-center gap-1.5 ${
                      studyMetrics.isTodayStreakCompleted
                        ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.85)]'
                        : 'text-amber-500'
                    }`}
                  >
                    <Flame className="w-6 h-6 fill-current expressive-badge" />
                    <span className="text-3xl font-extrabold tracking-tight">{studyMetrics.streak}</span>
                  </div>
                  <span
                    className={`text-xs font-extrabold mt-1 ${
                      studyMetrics.isTodayStreakCompleted
                        ? 'text-red-600 dark:text-red-300'
                        : theme.subtext
                    }`}
                  >
                    Day Streak {studyMetrics.isTodayVacation ? '(Vacation)' : studyMetrics.isTodayStreakCompleted ? '🔥' : ''}
                  </span>
                </div>

                <div
                  className={`p-4 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 ${
                    studyMetrics.isGoalCompleted
                      ? 'goal-glow-green'
                      : theme.surfaceElevated
                  }`}
                >
                  <div
                    className={`flex items-center justify-center gap-1.5 ${
                      studyMetrics.isGoalCompleted
                        ? 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.85)]'
                        : ''
                    }`}
                  >
                    <Trophy className="w-5 h-5 text-emerald-500 shrink-0 expressive-badge" />
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {studyMetrics.todayMins}/{studyMetrics.goalMins}m
                    </span>
                  </div>
                  <span
                    className={`text-xs font-extrabold mt-1 ${
                      studyMetrics.isGoalCompleted
                        ? 'text-emerald-600 dark:text-emerald-300'
                        : theme.subtext
                    }`}
                  >
                    {studyMetrics.isGoalCompleted ? 'Goal Complete! ✓' : "Today's Study Goal"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold px-1">
                  <span>Daily Goal Progress</span>
                  <span>{studyMetrics.goalPct}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      studyMetrics.isGoalCompleted
                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]'
                        : 'bg-[#6347A6] dark:bg-[#D0BCFF]'
                    }`}
                    style={{ width: `${studyMetrics.goalPct}%` }}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-3xl space-y-3 ${theme.surfaceElevated}`}>
                <div className="flex items-center justify-between px-1">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${theme.subtext}`}>
                    Daily Target (Minutes)
                  </span>
                  <span className="text-xs font-extrabold">
                    {studyData.dailyGoalMinutes} mins / day
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setStudyData((prev) => ({
                        ...prev,
                        dailyGoalMinutes: Math.max(1, (Number(prev.dailyGoalMinutes) || 60) - 5)
                      }))
                    }
                    className={`py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center m3-btn ${theme.glassCard}`}
                  >
                    -5m
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStudyData((prev) => ({
                        ...prev,
                        dailyGoalMinutes: Math.max(1, (Number(prev.dailyGoalMinutes) || 60) - 1)
                      }))
                    }
                    className={`py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center m3-btn ${theme.glassCard}`}
                  >
                    -1m
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={studyData.dailyGoalMinutes}
                    onChange={(e) =>
                      setStudyData((prev) => ({
                        ...prev,
                        dailyGoalMinutes: Math.max(1, Number(e.target.value) || 1)
                      }))
                    }
                    className={`w-full py-2.5 rounded-2xl text-center font-extrabold text-sm outline-none ${theme.glassCard}`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setStudyData((prev) => ({
                        ...prev,
                        dailyGoalMinutes: Math.min(720, (Number(prev.dailyGoalMinutes) || 60) + 1)
                      }))
                    }
                    className={`py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center m3-btn ${theme.glassCard}`}
                  >
                    +1m
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStudyData((prev) => ({
                        ...prev,
                        dailyGoalMinutes: Math.min(720, (Number(prev.dailyGoalMinutes) || 60) + 5)
                      }))
                    }
                    className={`py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center m3-btn ${theme.glassCard}`}
                  >
                    +5m
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {GOAL_PRESETS.map((preset) => {
                    const isSelected = Number(studyData.dailyGoalMinutes) === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStudyData((prev) => ({ ...prev, dailyGoalMinutes: preset }))}
                        className={`py-2 rounded-full text-xs font-extrabold text-center m3-btn ${
                          isSelected ? theme.primaryPill : theme.glassCard
                        }`}
                      >
                        {preset}m
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Main Pomodoro & Standard Timer Card */}
            <div className={`rounded-[32px] p-6 space-y-5 flex flex-col items-center text-center ${theme.glassCard}`}>
              <div className={`w-full p-1.5 rounded-full grid grid-cols-2 gap-2 ${theme.surfaceElevated}`}>
                <button
                  type="button"
                  onClick={() => {
                    setTimerMode('pomodoro');
                    setPomoPhase('work');
                    resetStudyTimer('pomodoro', 'work', studyData);
                  }}
                  className={`w-full py-3 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                    timerMode === 'pomodoro' ? theme.primaryPill : theme.subtext
                  }`}
                >
                  <Timer className="w-4 h-4 shrink-0" />
                  <span>Pomodoro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerMode('normal');
                    resetStudyTimer('normal', 'work', studyData);
                  }}
                  className={`w-full py-3 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                    timerMode === 'normal' ? theme.primaryPill : theme.subtext
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Standard Timer</span>
                </button>
              </div>

              {timerMode === 'pomodoro' && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPomoPhase('work');
                      resetStudyTimer('pomodoro', 'work', studyData);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold m3-btn ${
                      pomoPhase === 'work' ? theme.tonalPill : `${theme.surfaceElevated} opacity-70`
                    }`}
                  >
                    Focus ({studyData.pomoWorkMins}m)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPomoPhase('break');
                      resetStudyTimer('pomodoro', 'break', studyData);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 m3-btn ${
                      pomoPhase === 'break' ? theme.tonalPill : `${theme.surfaceElevated} opacity-70`
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" /> Break ({studyData.pomoBreakMins}m)
                  </button>
                </div>
              )}

              <div className={`w-full p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                <input
                  type="text"
                  placeholder="What are you studying? (e.g., PLSC 111 Essay, Econ Ch. 4)"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  className="w-full bg-transparent text-center font-bold text-xs outline-none"
                />
              </div>

              <div className="relative w-64 h-64 flex items-center justify-center my-1">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 250 250">
                  <circle
                    cx="125"
                    cy="125"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="opacity-10"
                  />
                  <circle
                    cx="125"
                    cy="125"
                    r={ringRadius}
                    fill="none"
                    stroke={
                      timerMode === 'pomodoro' && pomoPhase === 'break'
                        ? '#10B981'
                        : darkMode
                        ? '#D0BCFF'
                        : '#6347A6'
                    }
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringStrokeOffset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                  <span className={`text-[11px] font-extrabold uppercase tracking-widest ${theme.subtext}`}>
                    {timerMode === 'pomodoro'
                      ? pomoPhase === 'break'
                        ? 'Break Time'
                        : 'Focus Session'
                      : 'Study Timer'}
                  </span>
                  <span className="text-5xl font-extrabold tracking-tight mt-1">
                    {formatTimerClock(timerSecondsLeft)}
                  </span>
                  {studyTopic.trim() && (
                    <span className={`text-xs font-bold mt-2 truncate max-w-[170px] ${theme.subtext}`}>
                      {studyTopic}
                    </span>
                  )}
                </div>
              </div>

              <div className={`w-full p-4 rounded-3xl flex items-center justify-center gap-2 ${theme.tonalPill}`}>
                <Sparkles className="w-4 h-4 shrink-0" />
                <p className="text-xs font-extrabold leading-snug">{encouragingMessage}</p>
              </div>

              <div className="w-full grid grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={startOrPauseTimer}
                  className={`col-span-2 py-4 px-5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 m3-btn ${
                    timerRunning
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : theme.primaryPill
                  }`}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pause Timer</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Start Session</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => resetStudyTimer(timerMode, pomoPhase, studyData)}
                  className={`col-span-1 py-4 px-4 rounded-full font-extrabold text-xs flex items-center justify-center gap-1.5 m3-btn ${theme.surfaceElevated}`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>

              {!timerRunning && (
                <div className="w-full pt-2 border-t border-black/5 dark:border-white/10">
                  {timerMode === 'pomodoro' ? (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className={`p-3.5 rounded-2xl flex flex-col items-center ${theme.surfaceElevated}`}>
                        <label className={`text-[10px] font-bold uppercase ${theme.subtext}`}>
                          Focus Minutes
                        </label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = Math.max(1, (Number(studyData.pomoWorkMins) || 25) - 1);
                              const updated = { ...studyData, pomoWorkMins: nextVal };
                              setStudyData(updated);
                              if (pomoPhase === 'work') resetStudyTimer('pomodoro', 'work', updated);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.glassCard}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="240"
                            value={studyData.pomoWorkMins}
                            onChange={(e) => {
                              const nextVal = Math.max(1, Number(e.target.value) || 1);
                              const updated = { ...studyData, pomoWorkMins: nextVal };
                              setStudyData(updated);
                              if (pomoPhase === 'work') resetStudyTimer('pomodoro', 'work', updated);
                            }}
                            className={`w-12 py-1 rounded-xl text-center font-extrabold text-xs outline-none ${theme.glassCard}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = Math.min(240, (Number(studyData.pomoWorkMins) || 25) + 1);
                              const updated = { ...studyData, pomoWorkMins: nextVal };
                              setStudyData(updated);
                              if (pomoPhase === 'work') resetStudyTimer('pomodoro', 'work', updated);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.glassCard}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`p-3.5 rounded-2xl flex flex-col items-center ${theme.surfaceElevated}`}>
                        <label className={`text-[10px] font-bold uppercase ${theme.subtext}`}>
                          Break Minutes
                        </label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = Math.max(1, (Number(studyData.pomoBreakMins) || 5) - 1);
                              const updated = { ...studyData, pomoBreakMins: nextVal };
                              setStudyData(updated);
                              if (pomoPhase === 'break') resetStudyTimer('pomodoro', 'break', updated);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.glassCard}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={studyData.pomoBreakMins}
                            onChange={(e) => {
                              const nextVal = Math.max(1, Number(e.target.value) || 1);
                              const updated = { ...studyData, pomoBreakMins: nextVal };
                              setStudyData(updated);
                              if (pomoPhase === 'break') resetStudyTimer('pomodoro', 'break', updated);
                            }}
                            className={`w-12 py-1 rounded-xl text-center font-extrabold text-xs outline-none ${theme.glassCard}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = Math.min(90, (Number(studyData.pomoBreakMins) || 5) + 1);
                              const updated = { ...studyData, pomoBreakMins: nextVal };
                              setStudyData(updated);
                              if (pomoPhase === 'break') resetStudyTimer('pomodoro', 'break', updated);
                            }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.glassCard}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-3xl space-y-2.5 mt-2 ${theme.surfaceElevated}`}>
                      <div className="flex items-center justify-between px-1">
                        <span className={`text-xs font-extrabold uppercase tracking-wider ${theme.subtext}`}>
                          Custom Timer (Minutes)
                        </span>
                        <span className="text-xs font-extrabold">{studyData.normalMins} mins</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = Math.max(1, (Number(studyData.normalMins) || 45) - 5);
                            const updated = { ...studyData, normalMins: nextVal };
                            setStudyData(updated);
                            resetStudyTimer('normal', 'work', updated);
                          }}
                          className={`py-2 rounded-2xl text-xs font-extrabold m3-btn ${theme.glassCard}`}
                        >
                          -5m
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = Math.max(1, (Number(studyData.normalMins) || 45) - 1);
                            const updated = { ...studyData, normalMins: nextVal };
                            setStudyData(updated);
                            resetStudyTimer('normal', 'work', updated);
                          }}
                          className={`py-2 rounded-2xl text-xs font-extrabold m3-btn ${theme.glassCard}`}
                        >
                          -1m
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="360"
                          value={studyData.normalMins}
                          onChange={(e) => {
                            const nextVal = Math.max(1, Number(e.target.value) || 1);
                            const updated = { ...studyData, normalMins: nextVal };
                            setStudyData(updated);
                            resetStudyTimer('normal', 'work', updated);
                          }}
                          className={`w-full py-2 rounded-2xl text-center font-extrabold text-sm outline-none ${theme.glassCard}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = Math.min(360, (Number(studyData.normalMins) || 45) + 1);
                            const updated = { ...studyData, normalMins: nextVal };
                            setStudyData(updated);
                            resetStudyTimer('normal', 'work', updated);
                          }}
                          className={`py-2 rounded-2xl text-xs font-extrabold m3-btn ${theme.glassCard}`}
                        >
                          +1m
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = Math.min(360, (Number(studyData.normalMins) || 45) + 5);
                            const updated = { ...studyData, normalMins: nextVal };
                            setStudyData(updated);
                            resetStudyTimer('normal', 'work', updated);
                          }}
                          className={`py-2 rounded-2xl text-xs font-extrabold m3-btn ${theme.glassCard}`}
                        >
                          +5m
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Vacation / Off-Days Manager */}
            <div className={`rounded-[32px] p-6 space-y-4 ${theme.glassCard}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-2xl ${theme.tonalPill}`}>
                    <Palmtree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Vacation & Off-Days</h3>
                    <p className={`text-xs ${theme.subtext}`}>
                      Scheduled off-days freeze and protect your daily study streak
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const exists = (studyData.vacationDays || []).includes(todayStr);
                  setStudyData((prev) => ({
                    ...prev,
                    vacationDays: exists
                      ? (prev.vacationDays || []).filter((d) => d !== todayStr)
                      : [...(prev.vacationDays || []), todayStr].sort()
                  }));
                }}
                className={`w-full py-3.5 px-4 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                  studyMetrics.isTodayVacation
                    ? 'bg-emerald-600 text-white shadow-md'
                    : theme.surfaceElevated
                }`}
              >
                <Palmtree className="w-4 h-4" />
                <span>
                  {studyMetrics.isTodayVacation
                    ? 'Today is Marked as a Vacation Day (Streak Protected!)'
                    : 'Mark Today as a Vacation / Rest Day'}
                </span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="date"
                  value={newVacationDate}
                  onChange={(e) => setNewVacationDate(e.target.value)}
                  className={`flex-1 px-4 py-3 rounded-full text-xs font-extrabold outline-none ${theme.surfaceElevated}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newVacationDate) return;
                    if (!(studyData.vacationDays || []).includes(newVacationDate)) {
                      setStudyData((prev) => ({
                        ...prev,
                        vacationDays: [...(prev.vacationDays || []), newVacationDate].sort()
                      }));
                    }
                  }}
                  className={`px-5 py-3 rounded-full text-xs font-extrabold shrink-0 m3-btn ${theme.tonalPill}`}
                >
                  + Add Date
                </button>
              </div>

              {(studyData.vacationDays || []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {(studyData.vacationDays || []).map((vDate) => (
                    <span
                      key={vDate}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${theme.surfaceElevated}`}
                    >
                      <span>{vDate}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setStudyData((prev) => ({
                            ...prev,
                            vacationDays: (prev.vacationDays || []).filter((d) => d !== vDate)
                          }))
                        }
                        className="text-rose-500 hover:opacity-80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Custom Study Reminders Card */}
            <div className={`rounded-[32px] p-6 space-y-4 ${theme.glassCard}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${theme.tonalPill}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Study Reminders</h3>
                  <p className={`text-xs ${theme.subtext}`}>
                    Sends an exact hardware alarm notification to your phone even when the app is closed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className={`sm:col-span-2 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                  <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>
                    What to Study
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Review Econ Notes"
                    value={newReminderTopic}
                    onChange={(e) => setNewReminderTopic(e.target.value)}
                    className="w-full bg-transparent font-extrabold text-xs outline-none mt-1"
                  />
                </div>
                <div className={`sm:col-span-1 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                  <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-full bg-transparent font-extrabold text-xs outline-none mt-1"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddStudyReminder}
                className={`w-full py-3.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${theme.primaryPill}`}
              >
                <Plus className="w-4 h-4" /> Add Study Reminder
              </button>

              {reminderSavedToast && (
                <div className={`p-3 rounded-2xl text-xs font-extrabold text-center ${theme.tonalPill}`}>
                  {reminderSavedToast}
                </div>
              )}

              {(studyData.reminders || []).length > 0 && (
                <div className="space-y-2.5 pt-2">
                  {(studyData.reminders || []).map((rem) => (
                    <div
                      key={rem.id}
                      className={`p-4 rounded-3xl flex items-center justify-between gap-3 ${theme.surfaceElevated}`}
                    >
                      <div>
                        <p className="font-extrabold text-sm">{rem.topic}</p>
                        <p className={`text-xs font-bold mt-0.5 ${theme.subtext}`}>
                          Phone Alert Daily at {formatTime12h(rem.time)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setStudyPromptModal({ topic: rem.topic })}
                          className={`px-3.5 py-2 rounded-full text-xs font-extrabold m3-btn ${theme.tonalPill}`}
                        >
                          Start Now
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...studyData,
                              reminders: (studyData.reminders || []).filter((r) => r.id !== rem.id)
                            };
                            setStudyData(updated);
                            syncNotificationsWithOS(courses, attendance, updated, classNotifConfig);
                          }}
                          className="p-2 rounded-full text-rose-500 m3-btn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= CLASSES TAB ================= */}
        {activeTab === 'classes' && (
          <div key={`classes_${uiStyle}_${animTrigger}`} className="space-y-6 m3-card-enter">
            <div className="flex items-center justify-between px-2 pt-1">
              <h2 className="text-2xl font-extrabold tracking-tight">My Courses</h2>
              <button
                type="button"
                onClick={openAddCourseModal}
                className={`px-5 py-3.5 rounded-full text-xs font-extrabold flex items-center gap-2 m3-btn ${theme.primaryPill}`}
              >
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </div>

            <div className="space-y-5">
              {courses.map((course) => {
                const cStyle = getColorStyle(course.color);
                const isFutureCourse = Boolean(course.startDate && course.startDate > todayStr);
                return (
                  <div key={course.id} className={`rounded-[32px] p-6 space-y-4 ${theme.glassCard}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold" style={{ backgroundColor: cStyle.bg, color: cStyle.text }}>
                            {course.code}
                          </span>
                          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${theme.surfaceElevated}`}>
                            {course.credits} Credits
                          </span>
                          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${theme.surfaceElevated}`}>
                            {isFutureCourse && course.grade === 'In Progress' ? 'Upcoming Semester' : `Grade: ${course.grade}`}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-xl leading-snug pt-0.5">{course.title}</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditCourseModal(course)}
                        className={`p-3.5 rounded-full shrink-0 m3-btn ${theme.surfaceElevated}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {course.genEds && course.genEds.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {course.genEds.map((g) => (
                          <span key={g} className={`px-3.5 py-1 rounded-full text-xs font-bold ${theme.tonalPill}`}>
                            Attr: {g}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 pt-1">
                      {(course.sections || []).map((sec) => (
                        <div key={sec.id} className={`p-4 rounded-3xl space-y-2.5 ${theme.surfaceElevated}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs uppercase tracking-wider">
                              {sec.type} {sec.sectionNumber}
                            </span>
                            {sec.professor && (
                              <span className={`text-xs font-semibold flex items-center gap-1.5 ${theme.subtext}`}>
                                <User className="w-3.5 h-3.5" /> {sec.professor}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {(sec.schedule || []).map((slot, i) => (
                              <div key={i} className={`text-xs flex items-center justify-between ${theme.subtext}`}>
                                <span className="font-bold text-current">
                                  {DAYS_SHORT[slot.day]}: {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                                </span>
                                {slot.room && (
                                  <span className="flex items-center gap-1 font-medium">
                                    <MapPin className="w-3.5 h-3.5" /> {slot.room}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className={`text-xs font-medium pt-1 ${theme.subtext}`}>
                      Semester Dates: {course.startDate} to {course.endDate}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= GPA & GEN ED TAB ================= */}
        {activeTab === 'gpa' && (
          <div key={`gpa_${uiStyle}_${animTrigger}`} className="space-y-6 m3-card-enter">
            <div className={`rounded-[32px] p-6 space-y-3.5 ${theme.glassCard}`}>
              <div className={`p-5 rounded-3xl flex flex-col items-center justify-center text-center ${theme.surfaceElevated}`}>
                <span className={`text-xs font-extrabold uppercase tracking-widest ${theme.subtext}`}>
                  Cumulative GPA
                </span>
                <span className="text-4xl font-extrabold tracking-tight mt-1 expressive-badge">
                  {academicStats.cumulativeGpa}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className={`p-4 rounded-3xl flex flex-col items-center justify-center ${theme.surfaceElevated}`}>
                  <span className="text-2xl font-extrabold">{academicStats.totalEarnedCredits}</span>
                  <span className={`text-xs font-bold mt-1 ${theme.subtext}`}>Earned Credits</span>
                </div>
                <div className={`p-4 rounded-3xl flex flex-col items-center justify-center ${theme.surfaceElevated}`}>
                  <span className="text-2xl font-extrabold">{academicStats.courseCreditsInProgress}</span>
                  <span className={`text-xs font-bold mt-1 ${theme.subtext}`}>In Progress</span>
                </div>
              </div>

              {academicStats.upcomingCredits > 0 && (
                <p className={`text-xs font-semibold text-center pt-1 ${theme.subtext}`}>
                  Note: {academicStats.upcomingCredits} credits starting on a future date are excluded from In Progress.
                </p>
              )}
            </div>

            <div className={`rounded-[32px] p-6 ${theme.glassCard}`}>
              <div className="flex items-center justify-between mb-5 gap-2">
                <div>
                  <h3 className="font-extrabold text-lg">Gen Ed Requirements</h3>
                  <p className={`text-xs font-medium ${theme.subtext}`}>
                    Supports multi-course counts, alternate tags (e.g. Y or B), and combined rules
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddGenEdModal}
                  className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shrink-0 m3-btn ${theme.tonalPill}`}
                >
                  <Plus className="w-4 h-4" /> Add GenEd
                </button>
              </div>

              <div className="space-y-3.5">
                {genEds.map((req) => {
                  const status = evaluateGenEdProgress(req, courses, manualOverrides);
                  const pct = status.target > 0 ? Math.min(100, Math.round((status.current / status.target) * 100)) : 100;

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-3xl space-y-3 transition-all ${theme.surfaceElevated}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`min-w-[44px] h-11 px-2.5 rounded-2xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                              status.isFulfilled
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : `${theme.glassCard} ${theme.subtext}`
                            }`}
                          >
                            {req.code}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-extrabold text-sm">{req.name}</p>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  status.isFulfilled
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                    : theme.tonalPill
                                }`}
                              >
                                {status.current} / {status.target}
                              </span>
                            </div>
                            {!status.isComposite && (
                              <p className={`text-[11px] font-medium mt-0.5 ${theme.subtext}`}>
                                Accepted tags: {(req.acceptedTags || [req.code]).join(' or ')}
                                {status.courseCount > 0 ? ` · ${status.courseCount} from courses` : ''}
                                {status.manualAdd > 0 ? ` · ${status.manualAdd} transfer/override` : ''}
                              </p>
                            )}
                            {status.isComposite && (
                              <p className={`text-[11px] font-medium mt-0.5 ${theme.subtext}`}>
                                Combined Requirement ({status.subResults.filter((r) => r.fulfilled).length} of {status.subResults.length} parts complete)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditGenEdModal(req)}
                            className={`p-2 rounded-full m3-btn ${theme.glassCard}`}
                            title="Edit or Delete Gen Ed"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {status.isFulfilled ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-current opacity-30 shrink-0" />
                          )}
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            status.isFulfilled ? 'bg-emerald-500' : 'bg-[#6347A6] dark:bg-[#D0BCFF]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {!status.isComposite && (
                        <div className="flex items-center justify-between pt-1">
                          <span className={`text-[11px] font-bold ${theme.subtext}`}>
                            Manual / Transfer Completions:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => adjustManualGenEdCount(req.id, -1, req.code)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.glassCard}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-extrabold min-w-[20px] text-center">
                              {status.manualAdd}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustManualGenEdCount(req.id, 1, req.code)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.glassCard}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {status.isComposite && (
                        <div className="space-y-2 pt-1">
                          {status.subResults.map((sr) => (
                            <div
                              key={sr.id}
                              className={`p-3 rounded-2xl flex items-center justify-between gap-2 ${theme.glassCard}`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold">{sr.label}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                      sr.fulfilled
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                        : theme.tonalPill
                                    }`}
                                  >
                                    {sr.current} / {sr.target}
                                  </span>
                                </div>
                                <p className={`text-[10px] font-medium mt-0.5 ${theme.subtext}`}>
                                  Tags: {(sr.acceptedTags || []).join(' or ')}
                                  {sr.courseCount > 0 ? ` · ${sr.courseCount} course` : ''}
                                  {sr.manualAdd > 0 ? ` · ${sr.manualAdd} manual` : ''}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => adjustManualGenEdCount(sr.manualKey, -1)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.surfaceElevated}`}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-extrabold min-w-[16px] text-center">
                                  {sr.manualAdd}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => adjustManualGenEdCount(sr.manualKey, 1)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center m3-btn ${theme.surfaceElevated}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-[32px] p-6 ${theme.glassCard} space-y-3`}>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <h3 className="font-extrabold text-lg">Transfer & Prior Credits Override</h3>
              </div>
              <div className={`p-4 rounded-3xl ${theme.surfaceElevated}`}>
                <label className={`block text-xs font-bold mb-1 ${theme.subtext}`}>Extra Transfer / AP Credits (Non-GPA)</label>
                <input
                  type="number"
                  value={manualOverrides.transferCredits}
                  onChange={(e) => setManualOverrides({ ...manualOverrides, transferCredits: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent font-extrabold text-lg outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= STUDY REMINDER PROMPT MODAL ================= */}
      {studyPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-[36px] p-6 space-y-5 text-center shadow-2xl border ${theme.bg} ${theme.border}`}>
            <div className={`w-14 h-14 rounded-3xl mx-auto flex items-center justify-center ${theme.tonalPill}`}>
              <Timer className="w-7 h-7" />
            </div>
            <div>
              <span className={`text-[11px] font-extrabold uppercase tracking-widest ${theme.subtext}`}>
                Study Reminder
              </span>
              <h3 className="text-2xl font-extrabold mt-1">{studyPromptModal.topic}</h3>
              <p className={`text-xs mt-1 ${theme.subtext}`}>
                How would you like to structure this study session?
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={async () => {
                  const topic = studyPromptModal.topic;
                  setStudyPromptModal(null);
                  setActiveTab('study');
                  setStudyTopic(topic);
                  setTimerMode('pomodoro');
                  setPomoPhase('work');
                  const secs = Math.max(1, Number(studyData.pomoWorkMins) || 25) * 60;
                  const targetEndMs = Date.now() + secs * 1000;
                  setTimerTotalSeconds(secs);
                  setTimerSecondsLeft(secs);
                  timerTargetEndMsRef.current = targetEndMs;
                  lastPostedQuarterRef.current = 0;
                  setTimerRunning(true);
                  await startNativeLiveTimerNotification(targetEndMs, false, 'Great start! Clear your mind and settle into your flow.');
                }}
                className={`w-full py-4 px-5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 m3-btn ${theme.primaryPill}`}
              >
                <Timer className="w-4 h-4" />
                <span>Start Pomodoro ({studyData.pomoWorkMins}m Focus)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const topic = studyPromptModal.topic;
                  setStudyPromptModal(null);
                  setActiveTab('study');
                  setStudyTopic(topic);
                  setTimerMode('normal');
                  const secs = Math.max(1, Number(studyData.normalMins) || 45) * 60;
                  const targetEndMs = Date.now() + secs * 1000;
                  setTimerTotalSeconds(secs);
                  setTimerSecondsLeft(secs);
                  timerTargetEndMsRef.current = targetEndMs;
                  lastPostedQuarterRef.current = 0;
                  setTimerRunning(true);
                  await startNativeLiveTimerNotification(targetEndMs, false, 'Great start! Clear your mind and settle into your flow.');
                }}
                className={`w-full py-4 px-5 rounded-full font-extrabold text-sm flex items-center justify-center gap-2 m3-btn ${theme.tonalPill}`}
              >
                <Clock className="w-4 h-4" />
                <span>Start Standard Timer ({studyData.normalMins}m)</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyPromptModal(null)}
                className={`w-full py-3 rounded-full font-bold text-xs m3-btn ${theme.surfaceElevated}`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SETTINGS & CUSTOMIZATION MODAL ================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-lg max-h-[86vh] rounded-[36px] flex flex-col overflow-hidden shadow-2xl ${theme.bg} border ${theme.border}`}>
            <div className={`px-6 pt-5 pb-4 flex items-center justify-between shrink-0 border-b ${theme.border}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-2xl ${theme.tonalPill}`}>
                  <Settings className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-extrabold">Settings</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className={`p-2.5 rounded-full m3-btn ${theme.surfaceElevated}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <GitHubSettingsUpdateCard updater={gitHubUpdater} theme={theme} />

              {/* 1. Google Cloud Sync (Saves ALL Data Including Streaks) */}
              <div className={`p-5 rounded-[28px] space-y-3.5 ${theme.glassCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-80">
                      Google Cloud Sync
                    </h3>
                  </div>
                  {cloudUser && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500">
                      Auto-Sync Active
                    </span>
                  )}
                </div>

                {!cloudUser ? (
                  <>
                    <p className={`text-xs ${theme.subtext}`}>
                      Sign in with your Google account to automatically sync all data—including your daily study streaks, courses, attendance, and Gen Eds—across devices.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className={`w-full py-3.5 px-4 rounded-full text-xs font-extrabold flex items-center justify-center gap-2.5 m3-btn ${theme.primaryPill}`}
                    >
                      <User className="w-4 h-4" />
                      <span>Sign in with Google</span>
                    </button>
                  </>
                ) : (
                  <div className={`p-3.5 rounded-2xl flex items-center justify-between gap-2 ${theme.surfaceElevated}`}>
                    <div className="truncate">
                      <p className="font-extrabold text-xs truncate">{cloudUser.displayName || 'Google Account'}</p>
                      <p className={`text-[11px] truncate ${theme.subtext}`}>{cloudUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleSignOut}
                      className="px-3.5 py-2 rounded-full bg-rose-500/15 text-rose-500 text-xs font-extrabold flex items-center gap-1.5 shrink-0 m3-btn"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}

                {cloudSyncStatus && (
                  <p className={`text-[11px] font-bold text-center pt-1 ${theme.subtext}`}>
                    {cloudSyncStatus}
                  </p>
                )}
              </div>

              {/* 2. Customizable Multi-Alert Class Notifications */}
              <div className={`p-5 rounded-[28px] space-y-4 ${theme.glassCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-80">
                      Class Notifications
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      classNotifConfig.enabled
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {classNotifConfig.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <p className={`text-xs ${theme.subtext}`}>
                  Choose whether to receive push notifications on your phone before classes, and select one or multiple reminder times (default is 30m before).
                </p>

                {/* Enable / Disable Toggle Pills */}
                <div className={`p-1.5 rounded-full grid grid-cols-2 gap-2 ${theme.surfaceElevated}`}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!notifGranted) await requestNotificationAccess();
                      setClassNotifConfig((prev) => ({ ...prev, enabled: true }));
                    }}
                    className={`w-full py-2.5 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 m3-btn ${
                      classNotifConfig.enabled ? theme.primaryPill : theme.subtext
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notifications On</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClassNotifConfig((prev) => ({ ...prev, enabled: false }))}
                    className={`w-full py-2.5 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 m3-btn ${
                      !classNotifConfig.enabled ? theme.primaryPill : theme.subtext
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Notifications Off</span>
                  </button>
                </div>

                {classNotifConfig.enabled && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className={`block text-[11px] font-bold mb-2 ${theme.subtext}`}>
                        Active Alert Times Before Class (Tap to toggle multiple):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CLASS_NOTIF_PRESETS.map((mins) => {
                          const isSelected = (classNotifConfig.leadMinutes || [30]).includes(mins);
                          return (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => toggleClassLeadMinute(mins)}
                              className={`px-3.5 py-2 rounded-full text-xs font-extrabold m3-btn ${
                                isSelected ? theme.primaryPill : theme.surfaceElevated
                              }`}
                            >
                              {mins}m before
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Any Custom Minute Value */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        placeholder="Custom mins before (e.g. 20)..."
                        value={customClassLeadInput}
                        onChange={(e) => setCustomClassLeadInput(e.target.value)}
                        className={`flex-1 px-4 py-2.5 rounded-full text-xs font-extrabold outline-none ${theme.surfaceElevated}`}
                      />
                      <button
                        type="button"
                        onClick={addCustomClassLeadMinute}
                        className={`px-4 py-2.5 rounded-full text-xs font-extrabold shrink-0 m3-btn ${theme.tonalPill}`}
                      >
                        + Add Alert
                      </button>
                    </div>

                    {/* Active Notification Chips */}
                    <div className={`p-3.5 rounded-2xl space-y-2 ${theme.surfaceElevated}`}>
                      <span className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme.subtext}`}>
                        Your Scheduled Alerts Per Class ({(classNotifConfig.leadMinutes || [30]).length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(classNotifConfig.leadMinutes || [30]).map((mins) => (
                          <span
                            key={mins}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${theme.tonalPill}`}
                          >
                            <span>{mins} mins before</span>
                            {(classNotifConfig.leadMinutes || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeClassLeadMinute(mins)}
                                className="text-rose-500 hover:opacity-80"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Theme & UI Design */}
              <div className={`p-5 rounded-[28px] space-y-4 ${theme.glassCard}`}>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-80">
                    Theme & UI Design
                  </h3>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme.subtext}`}>Color Mode</label>
                  <div className={`p-1.5 rounded-full grid grid-cols-2 gap-2 ${theme.surfaceElevated}`}>
                    <button
                      type="button"
                      onClick={() => setDarkMode(false)}
                      className={`w-full py-3 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                        !darkMode ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      <Sun className="w-4 h-4 shrink-0" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDarkMode(true)}
                      className={`w-full py-3 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                        darkMode ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      <Moon className="w-4 h-4 shrink-0" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${theme.subtext}`}>Visual Surface Style</label>
                  <div className={`p-1.5 rounded-full grid grid-cols-2 gap-2 ${theme.surfaceElevated}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setUiStyle('expressive');
                        setAnimTrigger((k) => k + 1);
                      }}
                      className={`w-full py-3 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                        uiStyle === 'expressive' ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>Expressive</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUiStyle('glassy');
                        setAnimTrigger((k) => k + 1);
                      }}
                      className={`w-full py-3 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${
                        uiStyle === 'glassy' ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Frosted</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Late Attendance Calculation */}
              <div className={`p-5 rounded-[28px] space-y-3 ${theme.glassCard}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-80">
                    Late Attendance Calculation
                  </h3>
                </div>
                <p className={`text-xs ${theme.subtext}`}>
                  Choose how marking a class session &quot;Late&quot; counts toward your Semester Attendance percentage:
                </p>

                <div className={`p-1.5 rounded-3xl grid grid-cols-3 gap-1.5 ${theme.surfaceElevated}`}>
                  <button
                    type="button"
                    onClick={() => setLatePolicy('present')}
                    className={`py-2.5 px-2 rounded-full text-xs font-extrabold m3-btn ${
                      latePolicy === 'present' ? theme.primaryPill : theme.subtext
                    }`}
                  >
                    Present (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatePolicy('half')}
                    className={`py-2.5 px-2 rounded-full text-xs font-extrabold m3-btn ${
                      latePolicy === 'half' ? theme.primaryPill : theme.subtext
                    }`}
                  >
                    Half (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatePolicy('absent')}
                    className={`py-2.5 px-2 rounded-full text-xs font-extrabold m3-btn ${
                      latePolicy === 'absent' ? theme.primaryPill : theme.subtext
                    }`}
                  >
                    Absent (0%)
                  </button>
                </div>
              </div>

              {/* 5. PDF Schedule Maker */}
              <div className={`p-5 rounded-[28px] space-y-3 ${theme.glassCard}`}>
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-80">
                    PDF Schedule Maker
                  </h3>
                </div>
                <p className={`text-xs ${theme.subtext}`}>
                  Generate a Weekly Grid or Course List PDF filtered for a specific date or custom semester range.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    setIsPrintModalOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-full text-xs font-extrabold flex items-center justify-center gap-2 m3-btn ${theme.primaryPill}`}
                >
                  <Printer className="w-4 h-4" /> Open PDF Schedule Maker
                </button>
              </div>

              {/* 6. Offline File Backup & Restore (Excludes Streak Data) */}
              <div className={`p-5 rounded-[28px] space-y-3 ${theme.glassCard}`}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-80">
                    Local File Backup & Restore
                  </h3>
                </div>
                <p className={`text-xs ${theme.subtext}`}>
                  Export your courses, attendance, Gen Eds, and settings as a `.classtrack.json` file. Study streak history is only synced via Google Cloud and is excluded from local files.
                </p>

                {backupStatusMsg && (
                  <div className={`p-3 rounded-2xl text-xs font-extrabold text-center ${theme.tonalPill}`}>
                    {backupStatusMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleExportBackupData}
                    className={`py-3.5 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 m3-btn ${theme.tonalPill}`}
                  >
                    <Download className="w-4 h-4" /> Export File
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`py-3.5 px-3 rounded-full text-xs font-extrabold flex items-center justify-center gap-1.5 m3-btn ${theme.surfaceElevated}`}
                  >
                    <Upload className="w-4 h-4" /> Import File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportBackupFile}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= COURSE ADD / EDIT MODAL ================= */}
      {isCourseModalOpen && editingCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-lg max-h-[86vh] rounded-[36px] flex flex-col overflow-hidden shadow-2xl ${theme.bg} border ${theme.border}`}>
            <div className={`px-6 pt-5 pb-4 flex items-center justify-between shrink-0 border-b ${theme.border}`}>
              <h2 className="text-2xl font-extrabold">{courses.some((c) => c.id === editingCourse.id) ? 'Edit Course' : 'New Course'}</h2>
              <button type="button" onClick={() => setIsCourseModalOpen(false)} className={`p-2.5 rounded-full m3-btn ${theme.surfaceElevated}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className={`p-5 rounded-[28px] space-y-3.5 ${theme.glassCard}`}>
                <p className="text-xs font-extrabold uppercase tracking-wider opacity-70">Course Information</p>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className={`col-span-1 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>Code</label>
                    <input
                      type="text"
                      placeholder="PLSC 111"
                      value={editingCourse.code}
                      onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                      className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                    />
                  </div>
                  <div className={`col-span-2 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>Course Title</label>
                    <input
                      type="text"
                      placeholder="Intro to American Politics"
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                      className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>Credits</label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={editingCourse.credits}
                      onChange={(e) => setEditingCourse({ ...editingCourse, credits: Number(e.target.value) })}
                      className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                    />
                  </div>
                  <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>Grade</label>
                    <select
                      value={editingCourse.grade}
                      onChange={(e) => setEditingCourse({ ...editingCourse, grade: e.target.value })}
                      className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                    >
                      {Object.keys(GRADE_POINTS).map((g) => <option key={g} value={g} className="text-black">{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>Start Date</label>
                    <input
                      type="date"
                      value={editingCourse.startDate}
                      onChange={(e) => setEditingCourse({ ...editingCourse, startDate: e.target.value })}
                      className="w-full bg-transparent font-bold text-xs outline-none mt-1"
                    />
                  </div>
                  <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>End Date</label>
                    <input
                      type="date"
                      value={editingCourse.endDate}
                      onChange={(e) => setEditingCourse({ ...editingCourse, endDate: e.target.value })}
                      className="w-full bg-transparent font-bold text-xs outline-none mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-2 ${theme.subtext}`}>Card Color</label>
                  <div className="flex items-center gap-3">
                    {COURSE_COLORS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setEditingCourse({ ...editingCourse, color: col.id })}
                        className={`w-9 h-9 rounded-full flex items-center justify-center m3-btn ${
                          editingCourse.color === col.id ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : ''
                        }`}
                        style={{ backgroundColor: col.lightBg, color: col.lightText }}
                      >
                        {editingCourse.color === col.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-2 ${theme.subtext}`}>
                    Course Attribute / Gen Ed Tags (e.g., A, C, J, W, Y, B)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allAvailableAttributeTags.map((tag) => {
                      const selected = (editingCourse.genEds || []).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const exists = (editingCourse.genEds || []).includes(tag);
                            setEditingCourse({
                              ...editingCourse,
                              genEds: exists ? editingCourse.genEds.filter((c) => c !== tag) : [...(editingCourse.genEds || []), tag]
                            });
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-extrabold m3-btn ${selected ? theme.primaryPill : theme.surfaceElevated}`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 mt-2.5">
                    <input
                      type="text"
                      placeholder="Add custom tag (e.g. B, Y, J)..."
                      value={customCourseTagInput}
                      onChange={(e) => setCustomCourseTagInput(e.target.value.toUpperCase())}
                      className={`flex-1 px-3.5 py-2 rounded-full text-xs font-bold outline-none ${theme.surfaceElevated}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const clean = customCourseTagInput.trim().toUpperCase();
                        if (!clean) return;
                        if (!(editingCourse.genEds || []).includes(clean)) {
                          setEditingCourse({
                            ...editingCourse,
                            genEds: [...(editingCourse.genEds || []), clean]
                          });
                        }
                        setCustomCourseTagInput('');
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold m3-btn ${theme.tonalPill}`}
                    >
                      + Tag
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="font-extrabold text-lg flex items-center gap-1.5">
                      <Layers className="w-5 h-5" /> Course Sections
                    </h3>
                    <p className={`text-xs font-medium ${theme.subtext}`}>
                      Times & locations automatically sync with the 1st selected day
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSectionToEditingCourse}
                    className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 m3-btn ${theme.tonalPill}`}
                  >
                    <Plus className="w-4 h-4" /> Add Section
                  </button>
                </div>

                {editingCourse.sections.map((sec, secIdx) => (
                  <div key={sec.id} className={`p-5 rounded-[28px] space-y-4 ${theme.glassCard}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">Section #{secIdx + 1}</span>
                      {editingCourse.sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSectionFromEditingCourse(secIdx)}
                          className="px-3 py-1 rounded-full bg-rose-500/15 text-xs text-rose-500 font-bold flex items-center gap-1 m3-btn"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div className={`col-span-2 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                        <label className={`block text-[11px] font-bold ${theme.subtext}`}>Section Type</label>
                        <select
                          value={sec.type}
                          onChange={(e) => updateSectionField(secIdx, 'type', e.target.value)}
                          className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                        >
                          <option value="Lecture" className="text-black">Lecture</option>
                          <option value="Discussion" className="text-black">Discussion</option>
                          <option value="Lab" className="text-black">Laboratory</option>
                          <option value="Seminar" className="text-black">Seminar / Recitation</option>
                        </select>
                      </div>
                      <div className={`col-span-1 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                        <label className={`block text-[11px] font-bold ${theme.subtext}`}>Sec #</label>
                        <input
                          type="text"
                          placeholder="01 / A2"
                          value={sec.sectionNumber}
                          onChange={(e) => updateSectionField(secIdx, 'sectionNumber', e.target.value)}
                          className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                        />
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                      <label className={`block text-[11px] font-bold ${theme.subtext}`}>Professor / TA Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Dr. Vance or TA M. Brooks"
                        value={sec.professor}
                        onChange={(e) => updateSectionField(secIdx, 'professor', e.target.value)}
                        className="w-full bg-transparent font-bold text-sm outline-none mt-1"
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-bold mb-2 ${theme.subtext}`}>Meeting Days</label>
                      <div className="grid grid-cols-7 gap-1.5">
                        {DAYS_SHORT.map((dayName, dNum) => {
                          const isSelected = sec.schedule.some((s) => Number(s.day) === dNum);
                          return (
                            <button
                              key={dayName}
                              type="button"
                              onClick={() => toggleDayInSection(secIdx, dNum)}
                              className={`py-2.5 rounded-full text-xs font-extrabold m3-btn ${
                                isSelected ? theme.primaryPill : theme.surfaceElevated
                              }`}
                            >
                              {dayName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {sec.schedule.length > 0 && (
                      <div className="space-y-3 pt-1">
                        {sec.schedule.map((slot, slotIdx) => {
                          const isFirst = slotIdx === 0;
                          return (
                            <div key={slot.day} className={`p-4 rounded-3xl space-y-3 border ${theme.border} ${theme.surfaceElevated}`}>
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs uppercase tracking-wider">
                                  {DAYS_FULL[slot.day]}
                                </span>
                                {isFirst && sec.schedule.length > 1 && (
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${theme.tonalPill}`}>
                                    <Sparkles className="w-3 h-3" /> Primary (Syncs other days)
                                  </span>
                                )}
                                {!isFirst && !slot.isCustom && (
                                  <span className={`text-[11px] font-bold opacity-70 ${theme.subtext}`}>
                                    Synced with {DAYS_SHORT[sec.schedule[0].day]}
                                  </span>
                                )}
                                {!isFirst && slot.isCustom && (
                                  <button
                                    type="button"
                                    onClick={() => resyncSlotToFirstDay(secIdx, slot.day)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 m3-btn ${theme.tonalPill}`}
                                  >
                                    <RefreshCw className="w-3 h-3" /> Sync to {DAYS_SHORT[sec.schedule[0].day]}
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded-2xl ${theme.glassCard}`}>
                                  <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>Start Time</label>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => updateSlotInSection(secIdx, slot.day, 'startTime', e.target.value)}
                                    className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                                  />
                                </div>
                                <div className={`p-3 rounded-2xl ${theme.glassCard}`}>
                                  <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>End Time</label>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => updateSlotInSection(secIdx, slot.day, 'endTime', e.target.value)}
                                    className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                                  />
                                </div>
                              </div>

                              <div className={`p-3 rounded-2xl flex items-center gap-2.5 ${theme.glassCard}`}>
                                <MapPin className={`w-4 h-4 shrink-0 ${theme.subtext}`} />
                                <div className="w-full">
                                  <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>Room / Building Location</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Lecture Hall 1 or Academic A G08"
                                    value={slot.room}
                                    onChange={(e) => updateSlotInSection(secIdx, slot.day, 'room', e.target.value)}
                                    className="w-full bg-transparent font-bold text-sm outline-none mt-0.5"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {courses.some((c) => c.id === editingCourse.id) && (
                  <button
                    type="button"
                    onClick={() => deleteCourse(editingCourse.id)}
                    className="p-4 rounded-full bg-rose-500/15 text-rose-500 font-bold m3-btn"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveCourseModal}
                  className={`flex-1 py-4 rounded-full font-extrabold text-base m3-btn ${theme.primaryPill}`}
                >
                  Save Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT / DELETE GEN ED MODAL ================= */}
      {isGenEdModalOpen && editingGenEd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-lg max-h-[86vh] rounded-[36px] flex flex-col overflow-hidden shadow-2xl ${theme.bg} border ${theme.border}`}>
            <div className={`px-6 pt-5 pb-4 flex items-center justify-between shrink-0 border-b ${theme.border}`}>
              <h3 className="font-extrabold text-xl">
                {genEds.some((g) => g.id === editingGenEd.id) ? 'Edit Gen Ed Requirement' : 'New Gen Ed Requirement'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsGenEdModalOpen(false);
                  setEditingGenEd(null);
                }}
                className={`p-2.5 rounded-full m3-btn ${theme.surfaceElevated}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-2.5">
                <div className={`col-span-1 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                  <label className={`block text-[11px] font-bold ${theme.subtext}`}>Badge Code</label>
                  <input
                    type="text"
                    placeholder="Y/B or C/W"
                    value={editingGenEd.code}
                    onChange={(e) => setEditingGenEd({ ...editingGenEd, code: e.target.value.toUpperCase() })}
                    className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                  />
                </div>
                <div className={`col-span-2 p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                  <label className={`block text-[11px] font-bold ${theme.subtext}`}>Requirement Name</label>
                  <input
                    type="text"
                    placeholder="Physical Activity & Wellness"
                    value={editingGenEd.name}
                    onChange={(e) => setEditingGenEd({ ...editingGenEd, name: e.target.value })}
                    className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                  />
                </div>
              </div>

              <div className={`p-2 rounded-full grid grid-cols-2 gap-1.5 ${theme.surfaceElevated}`}>
                <button
                  type="button"
                  onClick={() => setEditingGenEd({ ...editingGenEd, mode: 'simple' })}
                  className={`py-2.5 rounded-full text-xs font-extrabold m3-btn ${
                    editingGenEd.mode === 'simple' ? theme.primaryPill : theme.subtext
                  }`}
                >
                  Standard / Alternate Tags
                </button>
                <button
                  type="button"
                  onClick={() => setEditingGenEd({ ...editingGenEd, mode: 'composite' })}
                  className={`py-2.5 rounded-full text-xs font-extrabold m3-btn ${
                    editingGenEd.mode === 'composite' ? theme.primaryPill : theme.subtext
                  }`}
                >
                  Combined Sub-Rules
                </button>
              </div>

              {editingGenEd.mode === 'simple' ? (
                <div className={`p-4 rounded-3xl space-y-3.5 ${theme.glassCard}`}>
                  <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>
                      Number of Courses Required (e.g., 1, 2, 3)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={editingGenEd.requiredCount}
                      onChange={(e) =>
                        setEditingGenEd({ ...editingGenEd, requiredCount: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full bg-transparent font-extrabold text-base outline-none mt-1"
                    />
                  </div>

                  <div className={`p-3.5 rounded-2xl ${theme.surfaceElevated}`}>
                    <label className={`block text-[11px] font-bold ${theme.subtext}`}>
                      Accepted Course Attribute Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Y, B, S (any of these fulfills this Gen Ed)"
                      value={editingGenEd.acceptedTagsInput}
                      onChange={(e) =>
                        setEditingGenEd({ ...editingGenEd, acceptedTagsInput: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-transparent font-extrabold text-sm outline-none mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className={`p-4 rounded-3xl space-y-3.5 ${theme.glassCard}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm">Combined Sub-Requirements</h4>
                      <p className={`text-[11px] ${theme.subtext}`}>
                        Example: 2 of one Gen Ed AND 3 of another Gen Ed
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingGenEd({
                          ...editingGenEd,
                          subRules: [
                            ...(editingGenEd.subRules || []),
                            {
                              id: `sr_${Date.now()}_${(editingGenEd.subRules || []).length + 1}`,
                              label: `Part ${(editingGenEd.subRules || []).length + 1}`,
                              requiredCount: 1,
                              acceptedTagsInput: ''
                            }
                          ]
                        })
                      }
                      className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1 m3-btn ${theme.tonalPill}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Part
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(editingGenEd.subRules || []).map((sr, sIdx) => (
                      <div key={sr.id} className={`p-3.5 rounded-2xl space-y-2.5 ${theme.surfaceElevated}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">
                            Sub-Requirement #{sIdx + 1}
                          </span>
                          {(editingGenEd.subRules || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingGenEd({
                                  ...editingGenEd,
                                  subRules: editingGenEd.subRules.filter((_, i) => i !== sIdx)
                                })
                              }
                              className="text-xs text-rose-500 font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className={`col-span-2 p-2.5 rounded-xl ${theme.glassCard}`}>
                            <label className={`block text-[10px] font-bold ${theme.subtext}`}>Label</label>
                            <input
                              type="text"
                              placeholder="e.g., Composition (C)"
                              value={sr.label}
                              onChange={(e) => {
                                const next = [...editingGenEd.subRules];
                                next[sIdx] = { ...next[sIdx], label: e.target.value };
                                setEditingGenEd({ ...editingGenEd, subRules: next });
                              }}
                              className="w-full bg-transparent font-extrabold text-xs outline-none mt-0.5"
                            />
                          </div>
                          <div className={`col-span-1 p-2.5 rounded-xl ${theme.glassCard}`}>
                            <label className={`block text-[10px] font-bold ${theme.subtext}`}>Count Needed</label>
                            <input
                              type="number"
                              min="1"
                              max="15"
                              value={sr.requiredCount}
                              onChange={(e) => {
                                const next = [...editingGenEd.subRules];
                                next[sIdx] = { ...next[sIdx], requiredCount: Math.max(1, Number(e.target.value) || 1) };
                                setEditingGenEd({ ...editingGenEd, subRules: next });
                              }}
                              className="w-full bg-transparent font-extrabold text-xs outline-none mt-0.5"
                            />
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-xl ${theme.glassCard}`}>
                          <label className={`block text-[10px] font-bold ${theme.subtext}`}>
                            Accepted Tags for this Part (comma-separated, e.g., C, J)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., W or C, J"
                            value={sr.acceptedTagsInput}
                            onChange={(e) => {
                              const next = [...editingGenEd.subRules];
                              next[sIdx] = { ...next[sIdx], acceptedTagsInput: e.target.value.toUpperCase() };
                              setEditingGenEd({ ...editingGenEd, subRules: next });
                            }}
                            className="w-full bg-transparent font-extrabold text-xs outline-none mt-0.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                {genEds.some((g) => g.id === editingGenEd.id) && (
                  <button
                    type="button"
                    onClick={() => deleteGenEdRequirement(editingGenEd.id)}
                    className="p-4 rounded-full bg-rose-500/15 text-rose-500 font-bold m3-btn"
                    title="Delete Requirement"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveGenEdModal}
                  className={`flex-1 py-4 rounded-full font-extrabold text-sm m3-btn ${theme.primaryPill}`}
                >
                  Save Requirement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PRINTABLE PDF SCHEDULE MODAL ================= */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className={`w-full max-w-3xl max-h-[86vh] rounded-[36px] flex flex-col overflow-hidden shadow-2xl ${theme.bg} border ${theme.border}`}>
            <div className={`px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b ${theme.border}`}>
              <div>
                <h2 className="text-2xl font-extrabold">PDF Schedule Maker</h2>
                <p className={`text-xs font-medium ${theme.subtext}`}>
                  {pdfStatusMsg || 'Filter by date period so past or upcoming classes are excluded'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintFormat('calendar')}
                  className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 m3-btn ${
                    printFormat === 'calendar' ? theme.primaryPill : theme.surfaceElevated
                  }`}
                >
                  <Grid className="w-4 h-4" /> Weekly Grid
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('list')}
                  className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 m3-btn ${
                    printFormat === 'list' ? theme.primaryPill : theme.surfaceElevated
                  }`}
                >
                  <FileText className="w-4 h-4" /> List View
                </button>
                <button
                  type="button"
                  onClick={handleExportPdfFile}
                  className="px-5 py-2.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white flex items-center gap-1.5 m3-btn shadow-md"
                >
                  <Download className="w-4 h-4" /> Save / Share PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className={`p-2.5 rounded-full m3-btn ${theme.surfaceElevated}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className={`p-4 rounded-3xl space-y-3 ${theme.glassCard}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider opacity-80">
                    Schedule Time Period Filter
                  </span>
                  <div className={`p-1 rounded-full flex items-center gap-1 ${theme.surfaceElevated}`}>
                    <button
                      type="button"
                      onClick={() => setPdfDateFilterMode('date')}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold m3-btn ${
                        pdfDateFilterMode === 'date' ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      Active on Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfDateFilterMode('range')}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold m3-btn ${
                        pdfDateFilterMode === 'range' ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      Date Range
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfDateFilterMode('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold m3-btn ${
                        pdfDateFilterMode === 'all' ? theme.primaryPill : theme.subtext
                      }`}
                    >
                      All Courses
                    </button>
                  </div>
                </div>

                {pdfDateFilterMode === 'date' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className={`text-xs ${theme.subtext}`}>
                      Only includes courses active on this date (hides past & future semesters):
                    </p>
                    <input
                      type="date"
                      value={pdfTargetDate}
                      onChange={(e) => setPdfTargetDate(e.target.value)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold outline-none ${theme.surfaceElevated}`}
                    />
                  </div>
                )}

                {pdfDateFilterMode === 'range' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className={`p-3 rounded-2xl ${theme.surfaceElevated}`}>
                      <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>From Date</label>
                      <input
                        type="date"
                        value={pdfRangeStart}
                        onChange={(e) => setPdfRangeStart(e.target.value)}
                        className="w-full bg-transparent text-xs font-extrabold outline-none mt-1"
                      />
                    </div>
                    <div className={`p-3 rounded-2xl ${theme.surfaceElevated}`}>
                      <label className={`block text-[10px] font-bold uppercase ${theme.subtext}`}>To Date</label>
                      <input
                        type="date"
                        value={pdfRangeEnd}
                        onChange={(e) => setPdfRangeEnd(e.target.value)}
                        className="w-full bg-transparent text-xs font-extrabold outline-none mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-inner border border-slate-200 overflow-x-auto">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                      Class Track Course Schedule
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {pdfPeriodLabel} · Showing {pdfFilteredCourses.length} {pdfFilteredCourses.length === 1 ? 'Course' : 'Courses'} · Cumulative GPA: {academicStats.cumulativeGpa}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Generated {new Date().toLocaleDateString()}
                  </span>
                </div>

                {printFormat === 'calendar' ? (
                  <div className="min-w-[620px]">
                    <div className="grid grid-cols-5 gap-2.5">
                      {[1, 2, 3, 4, 5].map((dayNum) => {
                        const dayItems = [];
                        pdfFilteredCourses.forEach((course) => {
                          (course.sections || []).forEach((sec) => {
                            (sec.schedule || []).forEach((slot) => {
                              if (Number(slot.day) === dayNum) {
                                dayItems.push({ course, sec, slot });
                              }
                            });
                          });
                        });
                        dayItems.sort((a, b) => timeToMinutes(a.slot.startTime) - timeToMinutes(b.slot.startTime));

                        return (
                          <div key={dayNum} className="bg-slate-50 rounded-2xl p-3 border border-slate-200 min-h-[320px]">
                            <div className="text-center font-extrabold text-xs uppercase tracking-wider text-slate-700 pb-2 mb-3 border-b border-slate-200">
                              {DAYS_FULL[dayNum]}
                            </div>
                            <div className="space-y-2.5">
                              {dayItems.length === 0 ? (
                                <p className="text-[11px] text-center text-slate-400 py-8 font-medium">No classes</p>
                              ) : (
                                dayItems.map(({ course, sec, slot }, idx) => {
                                  const col = COURSE_COLORS.find((c) => c.id === course.color) || COURSE_COLORS[0];
                                  return (
                                    <div
                                      key={idx}
                                      className="p-2.5 rounded-xl border text-left"
                                      style={{ backgroundColor: col.lightBg, color: col.lightText, borderColor: col.border }}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-extrabold text-xs">{course.code}</span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60">
                                          {sec.type} {sec.sectionNumber}
                                        </span>
                                      </div>
                                      <p className="font-bold text-xs mt-1 leading-snug">{course.title}</p>
                                      <p className="text-[11px] font-extrabold mt-1.5">
                                        {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                                      </p>
                                      {slot.room && <p className="text-[10px] font-semibold mt-0.5">{slot.room}</p>}
                                      {sec.professor && <p className="text-[10px] opacity-80">{sec.professor}</p>}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pdfFilteredCourses.length === 0 ? (
                      <p className="text-sm text-center text-slate-400 py-8 font-semibold">
                        No courses match the selected time period.
                      </p>
                    ) : (
                      pdfFilteredCourses.map((course) => {
                        const col = COURSE_COLORS.find((c) => c.id === course.color) || COURSE_COLORS[0];
                        return (
                          <div key={course.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-extrabold"
                                  style={{ backgroundColor: col.lightBg, color: col.lightText }}
                                >
                                  {course.code}
                                </span>
                                <h3 className="font-extrabold text-base text-slate-900">{course.title}</h3>
                              </div>
                              <span className="text-xs font-bold text-slate-600">
                                {course.credits} Credits · {course.grade}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(course.sections || []).map((sec) => (
                                <div key={sec.id} className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                                  <div className="flex items-center justify-between font-bold text-slate-800">
                                    <span>{sec.type} {sec.sectionNumber}</span>
                                    {sec.professor && <span className="text-slate-500">{sec.professor}</span>}
                                  </div>
                                  <div className="mt-1.5 space-y-1 text-slate-600">
                                    {(sec.schedule || []).map((slot, i) => (
                                      <div key={i} className="flex justify-between">
                                        <span className="font-semibold">
                                          {DAYS_SHORT[slot.day]}: {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
                                        </span>
                                        <span>{slot.room}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING ROUNDED 5-TAB BOTTOM NAVIGATION DOCK ================= */}
      <div className="fixed bottom-3 inset-x-0 z-40 px-3 max-w-lg mx-auto pointer-events-none">
        <nav className={`rounded-[32px] px-2 py-2.5 pointer-events-auto transition-all duration-300 ${theme.glassCard}`}>
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: 'today', label: 'Today', icon: Clock },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'study', label: 'Study', icon: Timer },
              { id: 'classes', label: 'Classes', icon: BookOpen },
              { id: 'gpa', label: 'GPA', icon: GraduationCap }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center py-1 rounded-full m3-btn"
                >
                  <div
                    className={`px-3.5 py-1.5 rounded-full m3-btn flex items-center justify-center ${
                      isActive ? `${theme.tonalPill} scale-105` : 'text-current opacity-60'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] mt-1 font-extrabold transition-opacity truncate ${isActive ? 'opacity-100' : 'opacity-65'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
