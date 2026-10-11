import { useState } from 'react';
import { Home, Users, Baby, MessageCircle, Bell, ChevronLeft, UserPlus, ArrowLeftRight, Star, Trash2, AlertTriangle, CheckCircle2, Clock, Sparkles, Send } from 'lucide-react';
import { useStore } from '../../store.jsx';
import { ROOMS, STAFF, PLANS, REVIEWS, CHILDREN, childById, roomById, staffById } from '../../data.js';
import { ar, presentIn, inRoom, ratio, staffIn, staffOn } from '../../logic.js';
import { Av, Sheet, Seg, Chip, Row, Tile } from '../../ui/kit.jsx';
import { Inbox } from '../shared/Messages.jsx';

export const SUP_TABS = (d) => [
  { id: 'S-11', label: 'اليوم', icon: Home },
  { id: 'S-09', label: 'الأطفال', icon: Baby },
  { id: 'S-01', label: 'الفريق', icon: Users },
  { id: 'S-10', label: 'الرسائل', icon: MessageCircle, badge: d.threads.filter((t) => t.staffUnread).length || null },
];

export function SupHeader() {
  const { data } = useStore();
  const kids = ROOMS.reduce((n, r) => n + presentIn(data, r.id).length, 0);
  const staff = STAFF.filter((s) => s.role === 'teacher' && (s.on || data.clockedIn[s.id])).length;
  return (
    <div className="hdr">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span className="hdr-title">الفريق</span>
        <span className="hdr-sub">{ar(kids)} حاضر · {ar(staff)} من الطاقم · حضانة واحة الصغار</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="iconbtn" aria-label="الإشعارات"><Bell size={20} /></button>
        <span className="iconbtn" style={{ background: 'var(--sun-100)', color: 'var(--sun-800)', fontWeight: 800 }}>م</span>
      </div>
    </div>
  );
}

const SEGS = [['S-01', 'التغطية'], ['S-05', 'المتابعة'], ['S-06', 'الخطة'], ['S-07', 'المراجعة']];
function TeamSeg({ cur }) {
  const { tab, data } = useStore();
  const kids = ROOMS.reduce((n, r) => n + presentIn(data, r.id).length, 0);
  const staff = STAFF.filter((s) => s.role === 'teacher' && (s.on || data.clockedIn[s.id])).length;
  return (<>
    <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 30, fontWeight: 800 }}>الفريق</span><span className="small muted">{ar(kids)} حاضر · {ar(staff)} من الطاقم</span></div>
    <Seg items={SEGS} value={cur} onChange={(v) => tab(v)} />
  </>);
}
const dot = (s, on) => (
  <span key={s.id} title={s.name} style={{ width: 30, height: 30, borderRadius: 15, background: on ? 'var(--violet-100)' : 'var(--surface-2)', color: on ? 'var(--violet-700)' : 'var(--ink-3)', border: '2px solid #FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, marginInlineStart: -6 }}>{s.short[0]}</span>
);

// ---------------------------------------------------------------- S-01 Coverage
export function Coverage() {
  const { data, openSheet, update, toast } = useStore();
  const late = STAFF.filter((s) => s.role === 'teacher' && !s.on && !data.clockedIn[s.id] && data.assign[s.id]);
  const bud = ratio(data, 'bud');
  const floaterFree = !data.assign.jawaher;
  return (
    <div className="pad">
      <TeamSeg cur="S-01" />
      {ROOMS.map((r) => {
        const q = ratio(data, r.id);
        const st = staffIn(data, r.id);
        const exp = inRoom(r.id).filter((c) => data.attendance[c.id]?.status === 'expected').length;
        return (
          <button key={r.id} className="card" style={{ border: 0, textAlign: 'start', cursor: 'pointer' }} onClick={() => openSheet('room', { id: r.id })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ width: 12, height: 12, borderRadius: 6, background: r.color }} /><b style={{ fontSize: 17 }}>{r.name}</b><span className="small muted">{r.age}</span></span>
              <span className={`pill ${q.kind}`}>{q.label}</span>
            </div>
            <span className="small muted">{ar(q.kids)} حاضر{exp ? ` · ${ar(exp)} متوقّع` : ''} · {ar(q.staff)} من الطاقم · المطلوب ١:{ar(r.ratio)}</span>
            <div style={{ display: 'flex', alignItems: 'center', paddingInlineStart: 6 }}>
              {st.map((s) => dot(s, s.on || data.clockedIn[s.id]))}
              {st.some((s) => !s.on && !data.clockedIn[s.id]) && <span className="small" style={{ marginInlineStart: 8, color: 'var(--warn)', fontWeight: 700 }}>{ar(st.filter((s) => !s.on && !data.clockedIn[s.id]).length)} غير حاضرين</span>}
            </div>
          </button>
        );
      })}
      {late.length > 0 && (<>
        <div className="sec"><span>لم يصلوا بعد · {ar(late.length)}</span></div>
        {late.map((s) => (
          <div key={s.id} className="row" style={{ cursor: 'default' }}>
            {dot(s, false)}
            <span className="grow"><span className="t">{s.name}</span><span className="s">الوردية {s.shift.split(' – ')[0]} · {roomById(data.assign[s.id])?.name}</span></span>
            <button className="pill brand" style={{ border: 0, cursor: 'pointer', padding: '6px 10px' }} onClick={() => { update((d) => ({ ...d, clockedIn: { ...d.clockedIn, [s.id]: true } })); toast(`تم تسجيل حضور ${s.short}`); }}>تسجيل الحضور</button>
          </div>
        ))}
      </>)}
    </div>
  );
}

// ---------------------------------------------------------------- S-02 Room detail (sheet)
function RoomSheet({ params }) {
  const { data, openSheet, update, toast, push, closeSheet } = useStore();
  const r = roomById(params.id);
  const q = ratio(data, r.id);
  const st = staffIn(data, r.id);
  const lead = data.lead[r.id];
  return (
    <Sheet title={r.name} sub={`${ar(q.kids)} حاضر · ${ar(q.staff)} من الطاقم · ${q.label}`}>
      {st.length === 0 && null}
      <div className="sec"><span>طاقم {r.name}</span></div>
      {st.length === 0 && <span className="small muted">لا أحد معيّن هنا بعد.</span>}
      {st.map((s) => {
        const on = s.on || data.clockedIn[s.id];
        return (
          <div key={s.id} className="row" style={{ cursor: 'default', flexWrap: 'wrap' }}>
            {dot(s, on)}
            <span className="grow">
              <span className="t">{s.name}</span>
              {!on && <span className="s" style={{ color: 'var(--warn)' }}>⏱ لم يسجل الحضور</span>}
            </span>
            {!on && <button className="pill brand" style={{ border: 0, padding: '6px 10px', cursor: 'pointer' }} onClick={() => { update((d) => ({ ...d, clockedIn: { ...d.clockedIn, [s.id]: true } })); toast(`تم تسجيل حضور ${s.short}`); }}>تسجيل الحضور</button>}
            <button className="pill mute" style={{ border: 0, padding: '6px 10px', cursor: 'pointer' }} onClick={() => openSheet('move', { staff: s.id, from: r.id })}>نقل</button>
          </div>
        );
      })}
    </Sheet>
  );
}

// ---------------------------------------------------------------- S-03 Add teacher (sheet)
function AddSheet({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const r = roomById(params.room);
  const cands = STAFF.filter((s) => s.role === 'teacher' && data.assign[s.id] !== r.id);
  const [pick, setPick] = useState(cands.find((s) => !data.assign[s.id])?.id || cands[0]?.id);
  const [role, setRole] = useState('helper');
  const [scope, setScope] = useState('today');
  const s = staffById(pick);
  const go = () => {
    update((d) => ({ ...d, assign: { ...d.assign, [pick]: r.id }, assignScope: { ...(d.assignScope || {}), [pick]: scope }, lead: role === 'lead' ? { ...d.lead, [r.id]: pick } : d.lead }));
    closeSheet(); toast(`أُضيفت ${s.short} إلى ${r.name}${scope === 'today' ? ' — اليوم فقط' : ''}`);
  };
  return (
    <Sheet title={`إضافة معلمة إلى ${r.name}`} sub="اختاري المعلمة ودورها ومدة التعيين">
      <div className="list">
        {cands.map((c) => (
          <button key={c.id} className="row" style={{ border: pick === c.id ? '2px solid var(--brand)' : '2px solid transparent', background: pick === c.id ? 'var(--violet-50)' : '#FFF' }} onClick={() => setPick(c.id)}>
            {dot(c, c.on || data.clockedIn[c.id])}
            <span className="grow"><span className="t">{c.name}</span><span className="s">{data.assign[c.id] ? `حاليًا في ${roomById(data.assign[c.id]).name}` : 'احتياط — بلا فصل'} · {c.on || data.clockedIn[c.id] ? 'في الوردية' : 'لم تسجّل الحضور'}</span></span>
            {pick === c.id && <CheckCircle2 size={20} color="var(--brand)" />}
          </button>
        ))}
      </div>
      <span style={{ fontWeight: 800 }}>الدور</span>
      <Seg items={[['helper', 'مساعدة'], ['lead', 'رئيسية']]} value={role} onChange={setRole} />
      <span style={{ fontWeight: 800 }}>المدة</span>
      <Seg items={[['today', 'اليوم فقط'], ['perm', 'دائم']]} value={scope} onChange={setScope} />
      {s && data.assign[s.id] && <div className="banner warn">ستنتقل {s.short} من {roomById(data.assign[s.id]).name}{scope === 'today' ? ' وتعود غدًا تلقائيًا' : ''}.</div>}
      <button className="btn primary" disabled={!pick} onClick={go}>إضافة {s?.short} إلى {r.name}</button>
    </Sheet>
  );
}

function MoveSheet({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const s = staffById(params.staff);
  const [to, setTo] = useState(null);
  return (
    <Sheet title={`نقل ${s.name}`} sub={`اختر الغرفة التي سيتم نقل ${s.name} إليها. المهام المخططة في الغرفة الحالية تُعاد.`}>
      {params.from === 'sun' && <div className="banner warn">سيتم إلغاء ٢ مهمة مخططة هنا</div>}
      {ROOMS.filter((r) => r.id !== params.from).map((r) => {
        const q = ratio(data, r.id);
        return (
          <button key={r.id} className="row" style={{ border: to === r.id ? '2px solid var(--brand)' : '2px solid transparent', background: to === r.id ? 'var(--violet-50)' : '#FFF' }} onClick={() => setTo(r.id)}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: r.color }} />
            <span className="grow"><span className="t">{r.name}</span><span className="s">{ar(q.kids)} حاضر · {ar(q.staff)} من الطاقم</span></span>
            <span className={`pill ${q.kind}`}>{q.label}</span>
          </button>
        );
      })}
      <button className="btn primary" disabled={!to} onClick={() => { update((d) => ({ ...d, assign: { ...d.assign, [s.id]: to } })); closeSheet(); toast(`تم نقل ${s.short} إلى ${roomById(to).name}`); }}>نقل</button>
    </Sheet>
  );
}

// ---------------------------------------------------------------- S-04 Staff-centric assignment
export function Assign() {
  const { data, openSheet } = useStore();
  const teachers = STAFF.filter((s) => s.role === 'teacher');
  return (
    <div className="pad">
      <TeamSeg cur="S-04" />
      <div className="banner brand">جدول الطاقم: كل معلمة وفصلها اليوم. اضغطي المعلمة لنقلها أو تغيير دورها.</div>
      {ROOMS.concat([{ id: null, name: 'احتياط — بلا فصل', color: 'var(--n-300)' }]).map((r) => {
        const st = teachers.filter((s) => (data.assign[s.id] || null) === r.id);
        if (!st.length && r.id) return null;
        return (
          <div key={r.id || 'none'} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="sec"><span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 5, background: r.color }} />{r.name}</span>{r.id && <span className={`pill ${ratio(data, r.id).kind}`}>{ratio(data, r.id).label}</span>}</div>
            {st.length === 0 && <span className="small muted">لا أحد.</span>}
            {st.map((s) => (
              <button key={s.id} className="row" onClick={() => openSheet('move', { staff: s.id, from: r.id })}>
                {dot(s, s.on || data.clockedIn[s.id])}
                <span className="grow"><span className="t">{s.name} {data.lead[r.id] === s.id && <span className="pill brand">رئيسية</span>} {data.assignScope?.[s.id] === 'today' && <span className="pill warn">اليوم فقط</span>}</span><span className="s">{s.shift} · {s.on || data.clockedIn[s.id] ? 'في الوردية' : 'لم تسجّل الحضور'}</span></span>
                <ArrowLeftRight size={18} color="var(--ink-3)" />
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- S-05 Monitor
export function Monitor() {
  const { data, push } = useStore();
  const waiting = data.threads.filter((t) => t.staffUnread);
  return (
    <div className="pad">
      <TeamSeg cur="S-05" />
      <div className="sec"><span>هل يُسجَّل اليوم؟</span></div>
      {ROOMS.map((r) => {
        const kids = presentIn(data, r.id);
        const lunch = kids.filter((c) => data.logs.some((l) => l.child === c.id && l.meal === 'الغداء')).length;
        const photos = data.logs.filter((l) => l.photo && childById(l.child)?.room === r.id).length;
        const ok = r.id !== 'sun' || lunch === kids.length;
        return (
          <div key={r.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{r.name}</b><span className={`pill ${ok ? 'ok' : 'warn'}`}>{ok ? 'على المسار' : 'الغداء غير مسجل'}</span></div>
            <span className="small muted">الوجبات {ar(r.id === 'sun' ? lunch : kids.length)}/{ar(kids.length)} · {ar(photos + 2)} صور · آخر تسجيل {r.id === 'star' ? 'منذ ساعة' : 'قبل دقائق'}</span>
          </div>
        );
      })}
      <div className="sec"><span>عائلات تنتظر الرد · {ar(waiting.length)}</span></div>
      {waiting.length === 0 && <span className="small muted">تم الرد على كل العائلات.</span>}
      {waiting.map((t) => { const c = childById(t.child); const m = t.items[t.items.length - 1]; return (
        <Row key={t.id} child={c} title={`${c.name} · ${m.who}`} sub={`سألت ${m.time} · «${m.text.slice(0, 32)}…»`} end={<span className="pill brand">رد</span>} onClick={() => push('T-11', { id: t.id })} />
      ); })}
    </div>
  );
}

// ---------------------------------------------------------------- S-06 Plan
export function Plan() {
  const { data, update, toast } = useStore();
  const [room, setRoom] = useState('sun');
  const [day, setDay] = useState(1);
  const plans = PLANS.filter((p) => p.room === room);
  const pub = data.published?.[room];
  return (
    <div className="pad">
      <TeamSeg cur="S-06" />
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>{['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس'].map((d, i) => <Chip key={d} on={day === i} onClick={() => setDay(i)}>{i === 1 ? 'غدًا · ' : ''}{d}</Chip>)}</div>
      <div className="chips">{ROOMS.map((r) => <Chip key={r.id} on={room === r.id} onClick={() => setRoom(r.id)}>{r.name} {data.published?.[r.id] ? '✓' : ''}</Chip>)}</div>
      {plans.length === 0 ? (
        <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}><b>لا خطة لهذه الغرفة</b><span className="small muted">تحصل على اقتراحات الساعة — الغداء ١٢، القيلولة ١. لا شيء يتعطل.</span><button className="btn ghost small" onClick={() => toast('أُنشئت مسودة من الأسبوع الماضي')}>مسودة من الأسبوع الماضي</button></div>
      ) : (<>
        <span className={`pill ${pub ? 'ok' : 'mute'}`} style={{ alignSelf: 'flex-start' }}>{pub ? 'منشورة' : 'مسودة'}</span>
        <div className="list">
          {plans.map((p) => (
            <div key={p.id} className="row" style={{ cursor: 'default' }}>
              <b style={{ width: 52, color: 'var(--violet-600)' }}>{p.time}</b>
              <span className="grow"><span className="t">{p.title}</span><span className="s">{p.type} · {p.dur}{p.staff ? ` · ${staffById(p.staff).short}` : ''}</span></span>
            </div>
          ))}
        </div>
        <button className="btn primary" disabled={pub} onClick={() => { update((d) => ({ ...d, published: { ...(d.published || {}), [room]: true } })); toast('نُشرت — بطاقات الغد جاهزة'); }}>{pub ? 'منشورة ✓' : 'نشر للغرفة'}</button>
      </>)}
    </div>
  );
}

// ---------------------------------------------------------------- S-07 Review
export function Review() {
  const { data, update, toast, openSheet } = useStore();
  const left = REVIEWS.filter((r) => !data.reviewDone[r.id]);
  return (
    <div className="pad">
      <TeamSeg cur="S-07" />
      <div className="sec"><span>{left.length ? `${ar(left.length)} للتوقيع` : 'لا شيء للتوقيع'}</span></div>
      {left.map((r) => { const c = childById(r.child); return (
        <div key={r.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="small" style={{ fontWeight: 800 }}>{r.kind} · {c.name} · {roomById(r.room).name}</span><span className={`pill ${r.kind === 'حادث' ? 'warn' : 'mute'}`}>{r.kind === 'حادث' ? 'طفيف' : 'مراجعة'}</span></div>
          <span style={{ fontSize: 14.5, lineHeight: 1.7 }}>{r.text}</span>
          <span className="small muted">بواسطة {r.by} · {r.time}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary small" onClick={() => { update((d) => ({ ...d, reviewDone: { ...d.reviewDone, [r.id]: true } })); toast('تم التوقيع'); }}>توقيع</button>
            <button className="btn ghost small" onClick={() => openSheet('review', { id: r.id })}>فتح</button>
          </div>
        </div>
      ); })}
      <div className="sec"><span>هذا الأسبوع · هادئ</span></div>
      <Row title="المهام المخططة اليوم" sub="١٤ منجزة · ٢ متخطاة · ٥ معلقة" />
      <Row title="الرسائل" sub={`${ar(data.threads.filter((t) => t.staffUnread).length)} غير مقروءة في الحضانة`} />
    </div>
  );
}
function ReviewSheet({ params }) {
  const { update, closeSheet, toast } = useStore();
  const r = REVIEWS.find((x) => x.id === params.id);
  const [ask, setAsk] = useState('');
  return (
    <Sheet title={`${r.kind} · ${childById(r.child).name}`} sub={`${roomById(r.room).name} · ${r.time}`}>
      <b>ماذا حدث</b><span style={{ lineHeight: 1.8 }}>{r.text}</span>
      <span className="small muted">أبلغت عنه {r.by}</span>
      <textarea value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="ما الذي تحتاجين معرفته؟ (اختياري)" style={{ border: '1.5px solid var(--line-2)', borderRadius: 12, padding: 12, fontFamily: 'inherit', fontSize: 15, minHeight: 80 }} />
      <button className="btn primary" onClick={() => { update((d) => ({ ...d, reviewDone: { ...d.reviewDone, [r.id]: true } })); closeSheet(); toast('تم التوقيع'); }}>توقيع</button>
      <button className="btn ghost" disabled={!ask.trim()} onClick={() => { closeSheet(); toast(`طُلب المزيد من ${r.by}`); }}>طلب المزيد</button>
    </Sheet>
  );
}

// ---------------------------------------------------------------- S-08 Child groups (new)
export function Groups() {
  const { data, update, toast } = useStore();
  const st = staffIn(data, 'sun');
  const kids = inRoom('sun');
  const ids = st.map((s) => s.id);
  const cycle = (c) => {
    const cur = ids.indexOf(data.groups[c.id]);
    const nx = ids[(cur + 1) % ids.length];
    update((d) => ({ ...d, groups: { ...d.groups, [c.id]: nx } }));
  };
  const auto = () => {
    update((d) => { const g = { ...d.groups }; kids.forEach((c, i) => { g[c.id] = ids[Math.floor(i / Math.ceil(kids.length / ids.length))]; }); return { ...d, groups: g }; });
    toast('وُزّع الأطفال بالتساوي');
  };
  return (
    <div className="pad">
      <div className="banner brand">كل معلمة ترى مجموعتها أولًا في «اليوم». اضغطي الطفل لنقله إلى المعلمة التالية.</div>
      {st.map((s) => {
        const mine = kids.filter((c) => data.groups[c.id] === s.id);
        return (
          <div key={s.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>مجموعة {s.short}</b><span className="pill brand">{ar(mine.length)} أطفال</span></div>
            <div className="grid6">{mine.map((c) => <Tile key={c.id} child={c} size={40} state="plain" onClick={() => cycle(c)} />)}</div>
          </div>
        );
      })}
      <button className="btn ghost" onClick={auto}><Sparkles size={18} /> توزيع تلقائي بالتساوي</button>
    </div>
  );
}

// ---------------------------------------------------------------- S-09 Children (all rooms)
export function SupChildren() {
  const { data, openSheet } = useStore();
  return (
    <div className="pad">
      {ROOMS.map((r) => {
        const kids = inRoom(r.id);
        return (
          <div key={r.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{r.name}</b><span className="small muted">{ar(presentIn(data, r.id).length)} من {ar(kids.length)} حاضرون</span></div>
            <div className="grid6">{kids.slice(0, 12).map((c) => <Tile key={c.id} child={c} size={38} state={data.attendance[c.id]?.status === 'in' ? 'in' : data.attendance[c.id]?.status === 'expected' ? 'exp' : 'abs'} />)}</div>
            {kids.length > 12 && <button className="sec" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }} onClick={() => openSheet('room', { id: r.id })}><span>+ {ar(kids.length - 12)} آخرون</span></button>}
          </div>
        );
      })}
    </div>
  );
}

export function SupMessages() { return <Inbox side="staff" />; }
export const SUP_SHEETS = { room: RoomSheet, move: MoveSheet, review: ReviewSheet };
export { Clock, Send, ChevronLeft };
