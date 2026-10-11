import * as T from './screens/staff/Staff.jsx';
import * as P from './screens/parent/Parent.jsx';
import * as S from './screens/supervisor/Supervisor.jsx';
import * as O from './screens/orig/OrigStaff.jsx';

// header: which top bar the screen uses. tab: which tab is highlighted.
// Teacher (T-) screens carry the agreed improvements. Parent (P-) and supervisor (S-) follow today's code.
export const SCREENS = {
  // teacher — improved
  'T-01': { title: 'اليوم', C: T.Today, header: 'staff', tab: 'T-01' },
  'T-13': { title: 'الأطفال', C: T.Children, header: 'staff', tab: 'T-13' },
  'T-10': { title: 'الرسائل', C: T.StaffMessages, header: 'staff', tab: 'T-10' },
  'T-08': { title: 'الاستلام', C: T.Pickup, header: 'back', tab: 'T-01' },
  // shared by teacher and supervisor (as in code)
  'T-09': { title: 'الطفل', C: T.ChildPage, header: 'back' },
  'T-11': { title: 'محادثة', C: T.StaffConversation, header: 'back' },

  // parent — as in code (care experience)
  'P-01': { title: 'اليوم', C: P.ParentToday, header: 'parent', tab: 'P-01' },
  'P-03': { title: 'لحظات', C: P.Moments, header: 'parent', tab: 'P-03' },
  'P-04': { title: 'الرسائل', C: P.ParentMessages, header: 'parent', tab: 'P-04' },
  'P-05': { title: 'المحادثة', C: P.ParentConversation, header: 'back', tab: 'P-04' },
  'P-06': { title: 'طفلي', C: P.ChildTab, header: 'parent', tab: 'P-06' },
  'P-08': { title: 'المصرح لهم بالاستلام', C: P.ParentPickup, header: 'back', tab: 'P-06' },
  'P-09': { title: 'ملخص اليوم', C: P.DaySummary, header: 'back', tab: 'P-01' },
  'P-10': { title: 'يحتاجك', C: P.NeedsYou, header: 'back', tab: 'P-01' },
  'P-11': { title: 'الحساب', C: P.Account, header: 'back', tab: 'P-01' },

  // supervisor — as in code
  'S-11': { title: 'اليوم', C: O.OrigToday, header: 'orig', tab: 'S-11' },
  'S-09': { title: 'الأطفال', C: O.OrigChildren, header: 'orig', tab: 'S-09' },
  'S-01': { title: 'الفريق', C: S.Coverage, header: 'orig', tab: 'S-01' },
  'S-05': { title: 'الفريق', C: S.Monitor, header: 'orig', tab: 'S-01' },
  'S-06': { title: 'الفريق', C: S.Plan, header: 'orig', tab: 'S-01' },
  'S-07': { title: 'الفريق', C: S.Review, header: 'orig', tab: 'S-01' },
  'S-10': { title: 'الرسائل', C: S.SupMessages, header: 'orig', tab: 'S-10' },
};

export const SHEETS = { ...T.STAFF_SHEETS, ...P.PARENT_SHEETS, ...S.SUP_SHEETS, ...O.ORIG_SHEETS };
export const HOME = { staff: 'T-01', parent: 'P-01', supervisor: 'S-11' };
