// All people, places and numbers here are invented for the prototype.
// Nothing is read from or written to the real KIDAY backend.

export const FACILITY = { name: 'حضانة واحة الصغار', city: 'الرياض' };

export const ROOMS = [
  { id: 'sun', name: 'عبّاد الشمس', age: '٣–٤ سنوات', ratio: 10, color: '#FDB924' },
  { id: 'but', name: 'الفراشات', age: '٢–٣ سنوات', ratio: 6, color: '#18B3B2' },
  { id: 'star', name: 'النجوم', age: '٤–٥ سنوات', ratio: 12, color: '#9776DA' },
  { id: 'bud', name: 'البراعم', age: '٦–١٨ شهرًا', ratio: 4, color: '#FC6B63' },
];

export const STAFF = [
  { id: 'noura', name: 'نورة العتيبي', short: 'نورة', role: 'teacher', room: 'sun', shift: '٧:٣٠ – ٣:٣٠', on: true },
  { id: 'huda', name: 'هدى الشهري', short: 'هدى', role: 'teacher', room: 'sun', shift: '٧:٠٠ – ٣:٠٠', on: true },
  { id: 'sara', name: 'سارة القحطاني', short: 'سارة', role: 'teacher', room: 'sun', shift: '٨:٠٠ – ٤:٠٠', on: true },
  { id: 'amal', name: 'أمل الدوسري', short: 'أمل', role: 'teacher', room: 'but', shift: '٧:٠٠ – ٣:٠٠', on: true },
  { id: 'mona', name: 'منى الحربي', short: 'منى', role: 'teacher', room: 'but', shift: '٨:٠٠ – ٤:٠٠', on: true },
  { id: 'dalal', name: 'دلال الزهراني', short: 'دلال', role: 'teacher', room: 'star', shift: '٧:٣٠ – ٣:٣٠', on: true },
  { id: 'abeer', name: 'عبير المطيري', short: 'عبير', role: 'teacher', room: 'bud', shift: '٧:٠٠ – ٣:٠٠', on: true },
  { id: 'lateefa', name: 'لطيفة السبيعي', short: 'لطيفة', role: 'teacher', room: 'bud', shift: '٩:٠٠ – ٥:٠٠', on: false },
  { id: 'jawaher', name: 'جواهر الفارس', short: 'جواهر', role: 'teacher', room: null, shift: '٨:٠٠ – ٤:٠٠', on: true, floater: true },
  { id: 'munira', name: 'منيرة العتيبي', short: 'منيرة', role: 'supervisor', room: null, shift: '٧:٣٠ – ٣:٣٠', on: true },
  { id: 'maryam', name: 'مريم الغامدي', short: 'مريم', role: 'supervisor', room: null, shift: '٧:٠٠ – ٣:٠٠', on: true },
];

const SUN = ['ليان', 'عمر خ.', 'يوسف', 'سارة', 'آدم', 'نورة', 'فهد', 'ريم', 'خالد', 'جود',
  'سلمان', 'لمى', 'تركي', 'هيا', 'عبدالله', 'رهف', 'مالك', 'دانة', 'زياد', 'غلا',
  'ريان', 'جنى', 'سعود', 'ليلى', 'فيصل', 'تالا', 'عمر س.', 'مها', 'ناصر', 'وعد'];
const BUT = ['حور', 'راكان', 'لين', 'بدر', 'شهد', 'نواف', 'ميار', 'حمد', 'رنا', 'سيف'];
const STAR = ['أسيل', 'مشعل', 'جوري', 'عزام', 'لولوة', 'ثامر', 'ديم', 'هتان', 'رزان', 'وليد', 'نجد', 'معاذ'];
const BUD = ['تميم', 'سدن', 'إياد', 'ركاز', 'جيلان', 'أوس', 'لارا', 'زيد'];

const group = (i) => (i < 10 ? 'noura' : i < 20 ? 'huda' : 'sara');
const ALLERGY = { 1: 'مكسرات', 21: 'حليب' };
const VEG = { 11: true };
const NO_PHOTO = { 6: true, 18: true, 25: true };
const DIAPER = { 4: 1, 8: 1, 16: 1, 24: 1, 0: 1, 6: 1, 19: 1 };
const DROPOFF = ['مع الأم', 'السائق', 'مع الأب', 'مع الجدة'];
const USUAL = ['٧:٣٠', '٧:٣٥', '٧:٤٠', '٧:٤٥', '٧:٥٠', '٨:٠٠', '٨:١٠', '٨:٢٠'];
const PICK = ['٢:٣٠', '٢:٤٥', '٣:٠٠', '٣:١٥', '٣:٣٠'];

export const CHILDREN = [
  ...SUN.map((n, i) => ({
    id: `s${i}`, name: n, room: 'sun', group: group(i), allergy: ALLERGY[i] || null, veg: !!VEG[i],
    noPhoto: !!NO_PHOTO[i], diaper: !!DIAPER[i], dropoff: DROPOFF[i % 4], usual: USUAL[i % 8], pick: PICK[i % 5],
    collector: ['الأم', 'الأب', 'السائق'][i % 3], pal: i % 6,
  })),
  ...BUT.map((n, i) => ({ id: `b${i}`, name: n, room: 'but', group: i < 5 ? 'amal' : 'mona', pal: (i + 2) % 6, dropoff: DROPOFF[i % 4], usual: USUAL[i % 8], pick: PICK[i % 5], collector: 'الأم', diaper: i % 2 === 0 })),
  ...STAR.map((n, i) => ({ id: `t${i}`, name: n, room: 'star', group: 'dalal', pal: (i + 4) % 6, dropoff: DROPOFF[i % 4], usual: USUAL[i % 8], pick: PICK[i % 5], collector: 'الأب' })),
  ...BUD.map((n, i) => ({ id: `u${i}`, name: n, room: 'bud', group: i < 4 ? 'abeer' : 'lateefa', pal: (i + 1) % 6, dropoff: DROPOFF[i % 4], usual: USUAL[i % 8], pick: PICK[i % 5], collector: 'الأم', diaper: true })),
];

export const childById = (id) => CHILDREN.find((c) => c.id === id);
export const staffById = (id) => STAFF.find((s) => s.id === id);
export const roomById = (id) => ROOMS.find((r) => r.id === id);

// Parent account: mother of Layan (Sunflowers) and Tamim (Buds)
export const PARENT = { name: 'أسماء', kids: ['s0', 'u0'], relation: 'الأم' };

// ---------- initial live state (attendance + logs) ----------
const t = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

export function initialState() {
  const attendance = {};
  CHILDREN.forEach((c, i) => {
    if (c.room === 'sun') {
      const idx = Number(c.id.slice(1));
      if (idx === 9 || idx === 29) attendance[c.id] = { status: 'absent', reason: 'مرض' };
      else if (idx === 5 || idx === 27) attendance[c.id] = { status: 'expected' };
      else attendance[c.id] = { status: 'in', at: USUAL[idx % 8], by: c.dropoff };
    } else attendance[c.id] = i % 7 === 3 ? { status: 'expected' } : { status: 'in', at: USUAL[i % 8], by: c.dropoff };
  });

  const logs = [
    { id: 'l1', child: 's0', kind: 'arrival', time: '٧:٣٠', by: 'هدى', text: 'وصلت ليان مع الأم وهي مبتسمة.' },
    { id: 'l2', child: 's0', kind: 'meal', time: '٨:٣٠', by: 'نورة', text: 'الإفطار — أنهت طبقها كاملًا.', meta: 'أكلت كله' },
    { id: 'l3', child: 's0', kind: 'activity', time: '٩:٣٠', by: 'نورة', text: 'نشاط الرسم بالألوان المائية في الساحة.', photo: 1 },
    { id: 'l4', child: 's0', kind: 'change', time: '١٠:٢٠', by: 'هدى', text: 'ذهبت إلى دورة المياه بمفردها.', meta: 'جاف' },
    { id: 'l5', child: 's0', kind: 'photo', time: '١١:٠٥', by: 'نورة', text: 'لعب الرمل مع أصدقائها.', photo: 2 },
    { id: 'l6', child: 'u0', kind: 'arrival', time: '٧:٤٥', by: 'عبير', text: 'وصل تميم مع السائق.' },
    { id: 'l7', child: 'u0', kind: 'nap', time: '٩:١٠', by: 'عبير', text: 'نام ٤٥ دقيقة بهدوء.', meta: '٤٥ د' },
    { id: 'l8', child: 'u0', kind: 'meal', time: '١٠:٠٠', by: 'عبير', text: 'وجبة الصباح — أكل معظمها.', meta: 'معظمه' },
    // Huda covered lunch for part of the room, including Khalid from Noura's group
    { id: 'l9', child: 's8', kind: 'meal', meal: 'الغداء', title: 'الغداء', time: '١٢:٠٠', by: 'هدى', for: 'نورة', text: 'الغداء — أنهى طبقه كاملًا.' },
    { id: 'l10', child: 's12', kind: 'meal', meal: 'الغداء', title: 'الغداء', time: '١٢:٠٠', by: 'هدى', text: 'الغداء — أكل معظم طبقه.' },
    { id: 'l11', child: 's13', kind: 'meal', meal: 'الغداء', title: 'الغداء', time: '١٢:٠٠', by: 'هدى', text: 'الغداء — أنهت طبقها كاملًا.' },
  ];

  const threads = [
    { id: 'th3', child: 's7', unread: 0, staffUnread: 1, items: [
      { from: 'parent', who: 'أم ريم', time: '١١:٤٠', text: 'ريم ما فطرت زين اليوم، طمنوني على الغداء 🙏' },
    ] },
    { id: 'th4', child: 's14', unread: 0, staffUnread: 1, items: [
      { from: 'parent', who: 'أبو عبدالله', time: '١١:١٥', text: 'بنتأخر اليوم، نوصل حوالي ٣:٣٠ — عادي؟' },
    ] },
    { id: 'th1', child: 's0', unread: 1, staffUnread: 0, items: [
      { from: 'staff', who: 'نورة', time: '٩:٤٠', text: 'صباح الخير أم ليان، ليان رسمت اليوم لوحة جميلة للعائلة 🌼' },
    ] },
    { id: 'th2', child: 'u0', unread: 0, items: [
      { from: 'parent', who: 'أسماء', time: 'أمس', text: 'تميم عنده تطعيم بكرة، ممكن يتأخر ساعة.' },
      { from: 'staff', who: 'عبير', time: 'أمس', text: 'تمام، شكرًا على التنبيه.' },
    ] },
  ];

  return {
    attendance, logs, threads,
    clock: 12 * 60 + 5,  // the demo day is frozen around lunchtime
    shiftStarted: false,
    clockedIn: {},
    likes: {},
    tempPickup: null,   // parent's "today only" collector
    groups: Object.fromEntries(CHILDREN.map((c) => [c.id, c.group])),
    handedOver: false,
    lunchSkip: false,
    // supervisor: who is assigned where (editable — the gap the client named)
    assign: Object.fromEntries(STAFF.filter((s) => s.role === 'teacher').map((s) => [s.id, s.room])),
    lead: { sun: 'noura', but: 'amal', star: 'dalal', bud: 'abeer' },
    nap: {},            // childId -> {start, end}
    diaperLast: { s4: '٨:٥٥', s8: '٨:٤٥', s16: '٩:٠٠', s24: '٨:٣٠', s0: '١٠:٢٠', s6: '١٠:٤٥', s19: '١٠:٣٥' },
    dayClosed: false,
    picked: {},         // childId -> {by, at}
    reviewDone: {},
    parentAbsence: null,
    notifsSeen: false,  // staff bell: logs colleagues made for my group
  };
}

export const PLANS = [
  { id: 'p1', room: 'sun', time: '٩:٣٠', title: 'نزهة في الحديقة', type: 'خارجي · طبيعة', staff: 'noura', dur: '٣٠ د' },
  { id: 'p2', room: 'sun', time: '١٠:٣٠', title: 'قصة: البذرة الصغيرة', type: 'قراءة', staff: 'huda', dur: '٢٠ د' },
  { id: 'p3', room: 'sun', time: '١٢:٠٠', title: 'الغداء', type: 'وجبة', staff: null, dur: '٤٥ د' },
  { id: 'p4', room: 'sun', time: '١:٠٠', title: 'القيلولة', type: 'راحة', staff: null, dur: '٩٠ د' },
  { id: 'p5', room: 'sun', time: '٢:٣٠', title: 'زراعة البذور', type: 'علوم', staff: 'sara', dur: '٣٠ د' },
  { id: 'p6', room: 'star', time: '٩:٠٠', title: 'حروف وأصوات', type: 'لغة', staff: 'dalal', dur: '٣٠ د' },
  { id: 'p7', room: 'but', time: '١٠:٠٠', title: 'لعب بالماء', type: 'حسّي', staff: 'amal', dur: '٢٠ د' },
];

export const REVIEWS = [
  { id: 'r1', kind: 'حادث', child: 's7', room: 'sun', by: 'هدى', time: '١٠:٤٠', text: 'سقطت ريم في الساحة وخدشت ركبتها. نُظّف الجرح ووضعت لاصقة، وأُبلغت الأم.' },
  { id: 'r2', kind: 'ملخص يوم', child: 's3', room: 'sun', by: 'نورة', time: '٢:١٠', text: 'ذُكر اسم طفل آخر في ملاحظة سارة — يحتاج قراءة قبل الإرسال.' },
  { id: 'r3', kind: 'دواء', child: 'u2', room: 'bud', by: 'عبير', time: '١١:٠٠', text: 'جرعة خافض حرارة حسب إذن الأسرة — ٥ مل.' },
];
