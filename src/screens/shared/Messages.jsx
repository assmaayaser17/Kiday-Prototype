import { useEffect, useRef, useState } from 'react';
import { Send, Megaphone, ChevronLeft, Calendar } from 'lucide-react';
import { useStore } from '../../store.jsx';
import { childById, roomById, PARENT, STAFF } from '../../data.js';
import { ar, clockStr } from '../../logic.js';
import { Av, Chip } from '../../ui/kit.jsx';

export function Inbox({ side }) {
  const { data, push, openSheet } = useStore();
  const [f, setF] = useState(side === 'staff' ? 'unread' : 'all');
  const threads = data.threads.filter((t) => (side === 'parent' ? PARENT.kids.includes(t.child) : childById(t.child).room === 'sun' || t.child.startsWith('s')));
  const unread = (t) => (side === 'parent' ? t.unread : t.staffUnread);
  const shown = threads.filter((t) => f !== 'unread' || unread(t));
  return (
    <div className="pad">
      {side === 'parent' ? (<>
        <button className="row" style={{ borderInlineStart: '4px solid var(--sun-500)' }} onClick={() => openSheet('announce')}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sun-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Megaphone size={20} color="var(--sun-800)" /></span>
          <span className="grow"><span className="s" style={{ fontWeight: 800 }}>إعلان</span><span className="t">رحلة الحديقة يوم الأربعاء — قبعة شمس وزجاجة ماء</span></span>
          <ChevronLeft size={18} />
        </button>
        <div className="sec"><span>المحادثات</span></div>
      </>) : (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'center' }}>
          <Chip on={f === 'unread'} onClick={() => setF('unread')}>غير مقروءة {ar(threads.filter(unread).length)}</Chip>
          <Chip on={f === 'in'} onClick={() => setF('in')}>حاضرون اليوم</Chip>
          <Chip on={f === 'room'} onClick={() => setF('room')}>غرفتي</Chip>
          <Chip on={f === 'all'} onClick={() => setF('all')}>الكل</Chip>
          <button className="iconbtn" aria-label="رسالة إلى الغرفة" style={{ marginInlineStart: 'auto' }}><Megaphone size={18} /></button>
        </div>
      )}
      <div className="list">
        {shown.length === 0 && <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}><b>لا جديد</b><span className="small muted">رسائل العائلات الجديدة تظهر هنا.</span></div>}
        {shown.map((t) => {
          const c = childById(t.child);
          const last = t.items[t.items.length - 1];
          const mine = (side === 'parent' && last.from === 'parent') || (side === 'staff' && last.from === 'staff');
          return (
            <button key={t.id} className="row" onClick={() => push(side === 'parent' ? 'P-05' : 'T-11', { id: t.id })}>
              <Av name={c.name} pal={c.pal} size={50} />
              <span className="grow">
                <span className="t">{side === 'parent' ? roomById(c.room).name : `${c.name} · ${c.id === 's0' || c.id === 'u0' ? 'أسماء (الأم)' : 'ولي الأمر'}`}{side === 'parent' && <span className="pill mute" style={{ marginInlineStart: 6 }}>{c.name}</span>}</span>
                <span className="s" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mine ? 'أنت: ' : `${last.who}: `}{last.text}</span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span className="small muted">{last.time}</span>
                {unread(t) ? <span className="pill" style={{ background: 'var(--brand)', color: '#FFF' }}>{ar(unread(t))}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      {side === 'parent' && (<>
        <div className="sec"><span>إجراءات سريعة</span></div>
        <button className="row" onClick={() => openSheet('absence')}><Calendar size={20} /><span className="grow"><span className="t">الإبلاغ عن غياب</span></span><ChevronLeft size={18} /></button>
      </>)}
    </div>
  );
}

export function Conversation({ id, side }) {
  const { data, update } = useStore();
  const t = data.threads.find((x) => x.id === id);
  const [text, setText] = useState('');
  const end = useRef();
  useEffect(() => {
    // opening a thread marks it read for this side
    if (!t) return;
    const key = side === 'parent' ? 'unread' : 'staffUnread';
    if (t[key]) update((d) => ({ ...d, threads: d.threads.map((x) => (x.id === id ? { ...x, [key]: 0 } : x)) }));
  }, [id, side]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [t?.items.length]);
  if (!t) return null;
  const c = childById(t.child);
  const send = () => {
    if (!text.trim()) return;
    const item = { from: side, who: side === 'parent' ? PARENT.name : 'نورة', time: clockStr(data.clock), text: text.trim() };
    update((d) => ({ ...d, threads: d.threads.map((x) => (x.id === id ? { ...x, items: [...x.items, item], [side === 'parent' ? 'staffUnread' : 'unread']: (x[side === 'parent' ? 'staffUnread' : 'unread'] || 0) + 1 } : x)) }));
    setText('');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="pad" style={{ flex: 1, gap: 10 }}>
        <span className="small muted" style={{ textAlign: 'center' }}>{side === 'parent' ? `فريق ${roomById(c.room).name}: نورة، هدى، سارة` : `محادثة ${c.name} — يراها طاقم الفصل`}</span>
        {t.items.map((m, i) => {
          const mine = m.from === side;
          return (
            <div key={i} style={{ alignSelf: mine ? 'flex-start' : 'flex-end', maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {!mine && <span className="small muted" style={{ fontWeight: 700 }}>{m.who}</span>}
              <span style={{ background: mine ? 'var(--brand)' : 'var(--surface-2)', color: mine ? '#FFF' : 'var(--ink)', borderRadius: 18, padding: '9px 13px', fontSize: 15, lineHeight: 1.6 }}>{m.text}</span>
              <span className="small muted">{m.time}</span>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <div style={{ padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--canvas)' }}>
        {side === 'parent' && <span className="small muted" style={{ textAlign: 'center' }}>يرد الفريق خلال ساعات العمل.</span>}
        {side === 'staff' && (
          <div className="card tight" style={{ background: 'var(--violet-50)' }}>
            <span className="small" style={{ fontWeight: 800, color: 'var(--violet-700)' }}>من سجل اليوم</span>
            <div className="chips">{(data.logs.filter((l) => l.child === t.child).slice(-2).map((l) => l.text)).concat(['تمام، شكرًا على التنبيه.']).map((x) => <button key={x} className="chip" style={{ fontSize: 12.5, whiteSpace: 'normal', textAlign: 'start' }} onClick={() => setText(x)}>{x}</button>)}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder={side === 'parent' ? 'اكتب رسالة للغرفة…' : 'رد…'}
            style={{ flex: 1, border: '1.5px solid var(--line-2)', borderRadius: 22, padding: '0 16px', height: 46, fontFamily: 'inherit', fontSize: 15, background: '#FFF' }} />
          <button onClick={send} aria-label="إرسال" style={{ width: 46, height: 46, borderRadius: 23, border: 0, background: 'var(--brand)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={20} style={{ transform: 'scaleX(-1)' }} /></button>
        </div>
      </div>
    </div>
  );
}
