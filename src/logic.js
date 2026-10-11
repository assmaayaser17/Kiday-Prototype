import { CHILDREN, ROOMS, STAFF, childById } from './data.js';

const AR = '٠١٢٣٤٥٦٧٨٩';
export const ar = (n) => String(n).replace(/[0-9]/g, (d) => AR[d]);

// demo clock: minutes since midnight, advances as people log things
export const clockStr = (m) => { const h = Math.floor(m / 60) % 12 || 12; return ar(`${h}:${String(m % 60).padStart(2, '0')}`); };

const FEMALE = new Set(['ليان', 'سارة', 'نورة', 'ريم', 'جود', 'لمى', 'هيا', 'رهف', 'دانة', 'غلا', 'جنى', 'ليلى', 'تالا', 'مها', 'وعد',
  'حور', 'لين', 'شهد', 'ميار', 'رنا', 'أسيل', 'جوري', 'لولوة', 'ديم', 'رزان', 'نجد', 'سدن', 'جيلان', 'لارا']);
export const isF = (c) => FEMALE.has(c.name.split(' ')[0]);

export const presentIn = (data, room) => CHILDREN.filter((c) => c.room === room && data.attendance[c.id]?.status === 'in' && !data.picked[c.id]);
export const inRoom = (room) => CHILDREN.filter((c) => c.room === room);
export const staffIn = (data, room) => STAFF.filter((s) => s.role === 'teacher' && data.assign[s.id] === room);
export const staffOn = (data, room) => staffIn(data, room).filter((s) => s.on || data.clockedIn?.[s.id]);

export function ratio(data, roomId) {
  const room = ROOMS.find((r) => r.id === roomId);
  const kids = presentIn(data, roomId).length;
  const staff = staffOn(data, roomId).length;
  if (!staff) return { label: 'لا طاقم', kind: 'danger', kids, staff };
  const r = Math.ceil(kids / staff);
  const kind = r <= room.ratio ? 'ok' : r <= Math.ceil(room.ratio * 1.15) ? 'warn' : 'danger';
  return { label: `${ar(1)}:${ar(r)}`, kind, kids, staff, word: kind === 'ok' ? 'مناسبة' : kind === 'warn' ? 'ضيّقة' : 'تجاوز' };
}

export const MEAL_OUT = [
  ['all', 'أكل كله', '🍽'], ['most', 'معظمه', '🙂'], ['some', 'بعضه', '😕'], ['none', 'لا شيء', '✋'],
];
export const CHANGE_OUT = [['wet', 'مبلّل', '💧'], ['dirty', 'متّسخ', '💩'], ['both', 'كلاهما', '➕'], ['dry', 'جاف', '✅']];

export function mealSentence(c, meal, out) {
  const f = isF(c);
  const m = { all: f ? 'أنهت طبقها كاملًا.' : 'أنهى طبقه كاملًا.', most: f ? 'أكلت معظم طبقها.' : 'أكل معظم طبقه.',
    some: f ? 'أكلت جزءًا من طبقها.' : 'أكل جزءًا من طبقه.', none: f ? 'لم تأكل هذه الوجبة اليوم.' : 'لم يأكل هذه الوجبة اليوم.' }[out];
  return `${meal} — ${m}`;
}

export function addLogs(d, entries) {
  let clock = d.clock;
  const logs = [...d.logs];
  entries.forEach((e) => { logs.push({ id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`, time: clockStr(clock), ...e }); });
  clock += 2;
  return { ...d, logs, clock };
}

export const childName = (id) => childById(id)?.name || '';
