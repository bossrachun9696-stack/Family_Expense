const DEMO = !CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY;

const CATEGORIES = {
  expense: [["อาหาร","🍜"],["ของใช้ในบ้าน","🧺"],["ค่าน้ำค่าไฟ","💡"],["ค่าเช่า/ผ่อนบ้าน","🏠"],["เดินทาง","🚗"],
            ["การศึกษา","📚"],["สุขภาพ","💊"],["ช้อปปิ้ง","🛍️"],["บันเทิง","🎬"],["อื่น ๆ","📦"]],
  income:  [["เงินเดือน","💼"],["OT","⏱️"],["ค่ากะ","🌙"],["เงินฝากจากเงินเหลือ","🏦"],["โบนัส","🎁"],["รายได้เสริม","💰"],["ขายของ","🏷️"],["เงินให้/ของขวัญ","🧧"],["อื่น ๆ","✨"]]
};
const LEGACY_ICONS = { "เงินเดือน": "💼", "OT": "⏱️" };
const CAT_COLORS = ["#16805F","#C23A4A","#D08A1E","#2F7FC1","#8456C4","#5E8C3A","#C2612D","#1F9A8E","#9C6B4E","#7B8794"];
const AV_COLORS = ["#16805F","#2F7FC1","#C2612D","#8456C4","#C23A4A","#1F9A8E","#D08A1E"];
const STATUSES = [
  ["work","มาทำงาน","--st-work"],["off","วันหยุด","--st-off"],["sick","ลาป่วย","--st-sick"],
  ["personal","ลากิจ","--st-personal"],["vacation","พักร้อน","--st-vacation"],["unpaid","ขาด/ไม่รับเงิน","--st-unpaid"]
];
const WD = ["อา","จ","อ","พ","พฤ","ศ","ส"];
const PERMS = [
  ["salary_all", "แก้เงินเดือน ปฏิทินงาน และยอดจริงของทุกคน", false],
  ["tx_all", "แก้/ลบรายการของคนอื่น (รับ–จ่าย กู้ยืม ออกให้ก่อน)", false],
  ["bills", "แก้รายจ่ายหลักของบ้าน", true],
  ["loans", "บันทึกกู้ยืมและออกให้ก่อน", true],
  ["family", "แก้ชื่อ/รูปบ้าน และเปิด–ปิดฟังก์ชัน", false]
];
const FEATURES = [
  ["io", "แท็บรับ–จ่าย", "กราฟและรายการรายรับรายจ่าย", true],
  ["salary", "เงินเดือน OT และปฏิทินงาน", "คำนวณค่าจ้างของแต่ละคน", true],
  ["shift", "ค่ากะ", "สวิตช์ค่ากะในปฏิทิน", true],
  ["slips", "ยอดจริงและรูปสลิป", "เทียบยอดจริงกับยอดคำนวณ", true],
  ["bills", "รายจ่ายหลัก", "จ่ายตามลำดับความสำคัญในหน้าเงินเดือน", true],
  ["salary_overview", "นับเงินเดือนที่คำนวณในหน้าภาพรวม", "ถ้าปิด ให้บันทึกเงินเดือนเป็นรายรับเองด้วยปุ่ม +", false],
  ["deposit", "ปุ่มฝากเงินคงเหลือ", "บันทึกเงินเหลือเป็นเงินฝาก", true],
  ["savings", "เงินเก็บและเป้าหมายออม", "ดูเงินเก็บคงเหลือ ตั้งเป้าหมาย", true],
  ["recurring", "รายการประจำอัตโนมัติ", "บันทึกรายการซ้ำทุกเดือนให้เอง", true],
  ["cat_budgets", "งบรายหมวด", "ตั้งงบแต่ละหมวด เตือนเมื่อใกล้เกิน", true],
  ["heatmap", "ปฏิทินสีการใช้จ่าย", "ดูว่าวันไหนใช้เงินเยอะ", true],
  ["loans", "กู้ยืม / คืนเงินกู้", "ยืมเงินเก็บหรือคนอื่น แล้วทยอยคืน", false],
  ["advances", "ออกให้ก่อน", "คิดกันเองว่าใครออกเงินให้ใคร", false],
  ["personal", "งบส่วนตัว", "เงินใช้ส่วนตัวของแต่ละคน แบ่งเป็นรายวัน", false]
];
const SAVINGS_LENDER = "เงินเก็บ";
const SALARY_CATS = new Set(["เงินเดือน", "OT", "ค่ากะ"]);
const SAVE_CAT = "เงินฝากจากเงินเหลือ"; // ย้ายเงินเหลือไปเก็บ ไม่นับเป็นรายได้ซ้ำในภาพรวม
const LEGACY_SLIP = "สลิปเงินเดือน รอบ"; // รายรับที่ปุ่มเก่าบันทึกไว้ ไม่นำมานับซ้ำ

/* ---------- helpers ---------- */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const round2 = (n) => Math.round((+n || 0) * 100) / 100;
const baht = (n) => { const v = Number(n || 0); const f = Math.abs(v % 1) > 0.004 ? 2 : 0; return "฿" + v.toLocaleString("th-TH", { minimumFractionDigits: f, maximumFractionDigits: 2 }); };
const bahtR = (n) => "฿" + Math.round(+n || 0).toLocaleString("th-TH");
const signed = (n) => (n < 0 ? "−" : "") + baht(Math.abs(n));
const shortNum = (n) => { const a = Math.abs(n); if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M"; if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "k"; return String(Math.round(n * 10) / 10); };
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const daysBetween = (a, b) => Math.round((b - a) / 864e5) + 1;
const lastDayOf = (y, m0) => new Date(y, m0 + 1, 0).getDate();
const monthLabel = (d) => d.toLocaleDateString("th-TH", { month: "short", year: "numeric" });
const monthShort = (d) => d.toLocaleDateString("th-TH", { month: "short" });
const dayLabel = (s) => parseYmd(s).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });
const shortDate = (d) => d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
const initial = (name) => { const c = [...String(name || "").trim()].find(ch => !"เแโใไ".includes(ch)); return c || "?"; };
const catIcon = (type, name) => (CATEGORIES[type] || []).find(c => c[0] === name)?.[1] || LEGACY_ICONS[name] || (type === "income" ? "✨" : "📦");
const avColor = (i) => AV_COLORS[i % AV_COLORS.length];
const statusOf = (k) => STATUSES.find(s => s[0] === k) || STATUSES[0];
// เรียงล่าสุดก่อน: วันที่ใหม่สุดขึ้นบน ถ้าวันเดียวกัน อันที่บันทึกทีหลังขึ้นก่อน
const newest = (field) => (a, b) => String(b[field] || "").slice(0, 10).localeCompare(String(a[field] || "").slice(0, 10)) || String(b.created_at || "").localeCompare(String(a.created_at || ""));
const sumItems = (arr) => (arr || []).reduce((a, x) => a + (+x.amount || 0), 0);
function eachDay(start, end, fn) { for (let d = new Date(start); d <= end; d = addDays(d, 1)) fn(d); }
function eachMonth(start, end, fn) { for (let m = monthStart(start); m <= end; m = addMonths(m, 1)) fn(m); }

function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add("hidden"), 2400);
}
function friendlyError(e) {
  const m = (e && (e.message || e.error_description || e)) + "";
  if (m.includes("Invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("already registered") || m.includes("already been registered")) return "อีเมลนี้มีบัญชีแล้ว ลองเข้าสู่ระบบแทน";
  if (m.includes("invalid_code")) return "ไม่พบรหัสเชิญนี้ ตรวจสอบตัวอักษรอีกครั้ง";
  if (m.includes("already_in_family")) return "บัญชีนี้อยู่ในบ้านอื่นแล้ว";
  if (m.includes("Password should be")) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  if (m.includes("Failed to fetch")) return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ต";
  if (m.includes("schema cache") || m.includes("does not exist")) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase3.sql ใน Supabase";
  if (/personal_accounts|personal_moves/.test(m)) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase10.sql ใน Supabase";
  if (/savings_accounts|account_moves|account_id|'kind'/.test(m)) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase9.sql ใน Supabase";
  if (/personal_spends|recurring|savings_goals|goal_contribs|category_budgets/.test(m)) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase8.sql ใน Supabase";
  if (/debts|personal_budgets|set_member_permissions|has_perm|'features'|'permissions'/.test(m)) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase7.sql ใน Supabase";
  if (m.includes("daily_incomes") || m.includes("remove_member")) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase6.sql ใน Supabase";
  if (m.includes("cannot_remove_owner")) return "ลบเจ้าของบ้านไม่ได้";
  if (m.includes("not_found")) return "ไม่พบสมาชิกคนนี้";
  if (m.includes("not_owner")) return "เฉพาะเจ้าของบ้านที่ทำรายการนี้ได้";
  if (m.includes("confirm_mismatch")) return "ชื่อบ้านที่พิมพ์ไม่ตรง";
  if (m.includes("reset_family_data")) return "ฐานข้อมูลยังไม่อัปเดต ให้รัน schema_phase4.sql ใน Supabase";
  if (m.includes("row-level security")) return "คุณไม่มีสิทธิ์แก้ไขข้อมูลส่วนนี้";
  return m;
}

/* =========================================================
   PAY MATH
   ========================================================= */
const DEFAULT_PAY = { pay_type: "monthly", base_salary: 0, shift_rate: 0, start_day: 1, end_day: 31, ot15_rate: null, ot20_rate: null, ot30_rate: null, incomes: [], daily_incomes: [], deductions: [] };
// รอบของเดือน M: เริ่ม <= สิ้นสุด → ภายในเดือน M; เริ่ม > สิ้นสุด (เช่น 21–20) → เริ่มเดือนก่อน จบเดือน M
function cycleRange(month, startDay, endDay) {
  const y = month.getFullYear(), m = month.getMonth();
  if (startDay <= endDay) return { start: new Date(y, m, Math.min(startDay, lastDayOf(y, m))), end: new Date(y, m, Math.min(endDay, lastDayOf(y, m))) };
  const p = addMonths(month, -1);
  return { start: new Date(p.getFullYear(), p.getMonth(), Math.min(startDay, lastDayOf(p.getFullYear(), p.getMonth()))), end: new Date(y, m, Math.min(endDay, lastDayOf(y, m))) };
}
const isDaily = (s) => s.pay_type === "daily";
function otRates(s) {
  // ค่าจ้างต่อชั่วโมง: รายเดือน = เงินเดือน ÷ 30 ÷ 8 · รายวัน = ค่าแรงต่อวัน ÷ 8
  const hourly = (+s.base_salary || 0) / (isDaily(s) ? 8 : 240);
  const pick = (v, mult) => (v !== null && v !== "" && v !== undefined && +v > 0) ? +v : round2(hourly * mult);
  return { r15: pick(s.ot15_rate, 1.5), r20: pick(s.ot20_rate, 2), r30: pick(s.ot30_rate, 3) };
}
const dayOtPay = (d, r) => (+d.ot15_hours || 0) * r.r15 + (+d.ot20_hours || 0) * r.r20 + (+d.ot30_hours || 0) * r.r30;
const dayOtHours = (d) => (+d.ot15_hours || 0) + (+d.ot20_hours || 0) + (+d.ot30_hours || 0);
function calcPay(s, days) {
  const rate = +s.base_salary || 0, daily = isDaily(s), rates = otRates(s), shiftRate = +s.shift_rate || 0;
  let h15 = 0, h20 = 0, h30 = 0, work = 0, leave = 0, unpaid = 0, shifts = 0;
  const counts = { work: 0, off: 0, sick: 0, personal: 0, vacation: 0, unpaid: 0 };
  days.forEach(d => {
    if (counts[d.status] !== undefined) counts[d.status]++;
    h15 += +d.ot15_hours || 0; h20 += +d.ot20_hours || 0; h30 += +d.ot30_hours || 0;
    if (d.status === "work") work++;
    if (["sick", "personal", "vacation", "unpaid"].includes(d.status)) leave++;
    if (d.status === "unpaid") unpaid++;
    if (d.has_shift) shifts++;
  });
  const ot15 = round2(h15 * rates.r15), ot20 = round2(h20 * rates.r20), ot30 = round2(h30 * rates.r30);
  const otTotal = round2(ot15 + ot20 + ot30), shiftPay = round2(shifts * shiftRate);
  // รายวัน: จ่ายเฉพาะวันที่ "มาทำงาน" · รายเดือน: เงินเดือนเต็ม หักวันขาด/ไม่รับเงิน วันละ เงินเดือน ÷ 30
  const base = daily ? round2(work * rate) : rate;
  const unpaidDeduct = daily ? 0 : round2(unpaid * rate / 30);
  const incomes = (s.incomes || []).filter(x => +x.amount > 0), deductions = (s.deductions || []).filter(x => +x.amount > 0);
  const incSum = sumItems(incomes), dedSum = sumItems(deductions);
  const dailyIncomes = (s.daily_incomes || []).filter(x => +x.amount > 0).map(x => ({ name: x.name, rate: +x.amount, days: work, total: round2(+x.amount * work) }));
  const dailyIncSum = round2(dailyIncomes.reduce((a, x) => a + x.total, 0));
  const net = round2(base - unpaidDeduct + otTotal + shiftPay + incSum + dailyIncSum - dedSum);
  return { daily, rate, counts, base, ...rates, shiftRate, h15, h20, h30, ot15, ot20, ot30, otTotal, shifts, shiftPay, unpaid, unpaidDeduct, incomes, deductions, incSum, dailyIncomes, dailyIncSum, dedSum, net, work, leave, hours: h15 + h20 + h30 };
}

/* =========================================================
   DATA LAYER
   ========================================================= */
function makeSupabaseApi() {
  const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  const must = ({ data, error }) => { if (error) throw error; return data; };
  async function fetchAll(table, familyId, order) {
    let out = [], from = 0;
    for (;;) {
      const { data, error } = await sb.from(table).select("*").eq("family_id", familyId).order(order).range(from, from + 999);
      if (error) throw error;
      out = out.concat(data);
      if (data.length < 1000) return out;
      from += 1000;
    }
  }
  return {
    async getUser() { const { data } = await sb.auth.getSession(); return data.session?.user || null; },
    async signUp(email, password) {
      const data = must(await sb.auth.signUp({ email, password }));
      if (!data.session) throw new Error("ระบบยังเปิดการยืนยันอีเมลอยู่ ให้ปิด Confirm email ใน Supabase");
      return data.user;
    },
    async signIn(email, password) { return must(await sb.auth.signInWithPassword({ email, password })).user; },
    async signOut() { await sb.auth.signOut(); },
    async getMyFamily(userId) {
      // ลองดึงคอลัมน์ใหม่ก่อน ถ้าฐานข้อมูลยังไม่อัปเดต ค่อยถอยไปใช้ชุดที่เล็กลง
      const levels = [[", avatar_url, permissions, member_kind", ", avatar_url, features"], [", avatar_url, permissions", ", avatar_url, features"], [", avatar_url", ", avatar_url"], ["", ""]];
      let lastErr;
      for (const [M, F] of levels) {
        try {
          const mine = must(await sb.from("family_members").select(`id, family_id, display_name, role${M}, families(id, name, invite_code, plan${F})`).eq("user_id", userId).maybeSingle());
          if (!mine) return null;
          const members = must(await sb.from("family_members").select(`id, display_name, role, user_id${M}`).eq("family_id", mine.family_id).order("created_at"));
          return { family: mine.families, me: { id: mine.id, display_name: mine.display_name, role: mine.role }, members };
        } catch (e) { lastErr = e; if (!/avatar_url|permissions|features|member_kind/.test(String(e.message || e))) throw e; }
      }
      throw lastErr;
    },
    async updateFamily(fid, patch) { must(await sb.from("families").update(patch).eq("id", fid)); },
    async removeMember(fid, mid) {
      try { const { data } = await sb.storage.from("payslips").list(`${fid}/${mid}`, { limit: 1000 });
        if (data?.length) await sb.storage.from("payslips").remove(data.map(f => `${fid}/${mid}/${f.name}`)); } catch (e) { console.warn(e); }
      must(await sb.rpc("remove_member", { p_member: mid }));
    },
    async updateMe(mid, patch) { must(await sb.from("family_members").update(patch).eq("id", mid)); },
    async uploadSlip(path, blob) { must(await sb.storage.from("payslips").upload(path, blob, { contentType: "image/jpeg", upsert: true })); return path; },
    async slipUrl(path) { return must(await sb.storage.from("payslips").createSignedUrl(path, 3600)).signedUrl; },
    async deleteSlip(path) { await sb.storage.from("payslips").remove([path]); },
    async createFamily(name, displayName) { must(await sb.rpc("create_family", { p_name: name, p_display_name: displayName })); },
    async joinFamily(code, displayName) { must(await sb.rpc("join_family", { p_code: code, p_display_name: displayName })); },
    async loadAll(fid) {
      const missing = [];
      const opt = (p, name) => p.catch(e => { missing.push(name); console.warn(e); return []; });
      const [txs, days, settings, bills, actual, debts, budgets, pspends, recurring, goals, contribs, catbud, accounts, moves, paccts, pmoves, bpays, cdays, cspends] = await Promise.all([
        fetchAll("transactions", fid, "tx_date"),
        opt(fetchAll("work_days", fid, "work_date"), "work_days"),
        opt(fetchAll("member_pay_settings", fid, "effective_month"), "member_pay_settings"),
        opt(fetchAll("family_bills", fid, "effective_month"), "family_bills"),
        opt(fetchAll("actual_pay", fid, "cycle_month"), "actual_pay"),
        opt(fetchAll("debts", fid, "tx_date"), "debts"),
        opt(fetchAll("personal_budgets", fid, "cycle_month"), "personal_budgets"),
        opt(fetchAll("personal_spends", fid, "spend_date"), "personal_spends"),
        opt(fetchAll("recurring_items", fid, "created_at"), "recurring_items"),
        opt(fetchAll("savings_goals", fid, "created_at"), "savings_goals"),
        opt(fetchAll("goal_contribs", fid, "contrib_date"), "goal_contribs"),
        opt(fetchAll("category_budgets", fid, "effective_month"), "category_budgets"),
        opt(fetchAll("savings_accounts", fid, "created_at"), "savings_accounts"),
        opt(fetchAll("account_moves", fid, "move_date"), "account_moves"),
        opt(fetchAll("personal_accounts", fid, "created_at"), "personal_accounts"),
        opt(fetchAll("personal_moves", fid, "move_date"), "personal_moves"),
        opt(fetchAll("bill_payments", fid, "cycle_month"), "bill_payments"),
        opt(fetchAll("child_days", fid, "day_date"), "child_days"),
        opt(fetchAll("child_spends", fid, "spend_date"), "child_spends")
      ]);
      return { txs, days, settings, bills, actual, debts, budgets, pspends, recurring, goals, contribs, catbud, accounts, moves, paccts, pmoves, bpays, cdays, cspends, missing };
    },
    async addTx(tx) { return must(await sb.from("transactions").insert(tx).select().single()); },
    async addDebt(row) { return must(await sb.from("debts").insert(row).select().single()); },
    async deleteDebt(id) { must(await sb.from("debts").delete().eq("id", id)); },
    async saveBudget(row) { return must(await sb.from("personal_budgets").upsert(row, { onConflict: "member_id,cycle_month" }).select().single()); },
    async setPermissions(mid, perms) { must(await sb.rpc("set_member_permissions", { p_member: mid, p_perms: perms })); },
    async updateTx(id, patch) { must(await sb.from("transactions").update(patch).eq("id", id)); },
    async updateDebt(id, patch) { must(await sb.from("debts").update(patch).eq("id", id)); },
    async addPSpend(row) { return must(await sb.from("personal_spends").insert(row).select().single()); },
    async updatePSpend(id, patch) { must(await sb.from("personal_spends").update(patch).eq("id", id)); },
    async deletePSpend(id) { must(await sb.from("personal_spends").delete().eq("id", id)); },
    async addRecurring(row) { return must(await sb.from("recurring_items").insert(row).select().single()); },
    async updateRecurring(id, patch) { must(await sb.from("recurring_items").update(patch).eq("id", id)); },
    async deleteRecurring(id) { must(await sb.from("recurring_items").delete().eq("id", id)); },
    async insertRecurringTx(rows) { must(await sb.from("transactions").upsert(rows, { onConflict: "recurring_id,recurring_month", ignoreDuplicates: true })); },
    async saveGoal(row) { return row.id ? must(await sb.from("savings_goals").update(row).eq("id", row.id).select().single()) : must(await sb.from("savings_goals").insert(row).select().single()); },
    async deleteGoal(id) { must(await sb.from("savings_goals").delete().eq("id", id)); },
    async addContrib(row) { return must(await sb.from("goal_contribs").insert(row).select().single()); },
    async saveCatBudget(row) { return must(await sb.from("category_budgets").upsert(row, { onConflict: "family_id,effective_month" }).select().single()); },
    async saveAcct(row) { return row.id ? must(await sb.from("savings_accounts").update(row).eq("id", row.id).select().single()) : must(await sb.from("savings_accounts").insert(row).select().single()); },
    async deleteAcct(id) { must(await sb.from("savings_accounts").delete().eq("id", id)); },
    async addMoves(rows) { return must(await sb.from("account_moves").insert(rows).select()); },
    async deleteMove(id) { must(await sb.from("account_moves").delete().eq("id", id)); },
    async deleteMovesByDebt(debtId) { must(await sb.from("account_moves").delete().eq("debt_id", debtId)); },
    async savePAcct(row) { return row.id ? must(await sb.from("personal_accounts").update(row).eq("id", row.id).select().single()) : must(await sb.from("personal_accounts").insert(row).select().single()); },
    async deletePAcct(id) { must(await sb.from("personal_accounts").delete().eq("id", id)); },
    async addPMove(row) { return must(await sb.from("personal_moves").insert(row).select().single()); },
    async deletePMove(id) { must(await sb.from("personal_moves").delete().eq("id", id)); },
    async clearPSpends(mid, s0, e0) { must(await sb.from("personal_spends").delete().eq("member_id", mid).gte("spend_date", s0).lte("spend_date", e0)); },
    async deleteTx(id) { must(await sb.from("transactions").delete().eq("id", id)); },
    async setBillPays(fid, month, rows) { must(await sb.from("bill_payments").delete().eq("family_id", fid).eq("cycle_month", month)); if (rows.length) must(await sb.from("bill_payments").insert(rows)); },
    async saveChildDay(row) { return must(await sb.from("child_days").upsert(row, { onConflict: "member_id,day_date" }).select().single()); },
    async deleteChildDay(mid, date) { must(await sb.from("child_days").delete().eq("member_id", mid).eq("day_date", date)); },
    async addChildSpend(row) { return must(await sb.from("child_spends").insert(row).select().single()); },
    async deleteChildSpend(id) { must(await sb.from("child_spends").delete().eq("id", id)); },
    async setMemberKind(mid, kind) { must(await sb.rpc("set_member_kind", { p_member: mid, p_kind: kind })); },
    async addChild(fid, name) { must(await sb.rpc("add_child_member", { p_family: fid, p_name: name })); },
    async updateChild(mid, name, avatar) { must(await sb.rpc("update_child_member", { p_member: mid, p_name: name, p_avatar: avatar })); },
    async savePaySettings(row) { return must(await sb.from("member_pay_settings").upsert(row, { onConflict: "member_id,effective_month" }).select().single()); },
    async saveWorkDay(row) { return must(await sb.from("work_days").upsert(row, { onConflict: "member_id,work_date" }).select().single()); },
    async deleteWorkDay(memberId, date) { must(await sb.from("work_days").delete().eq("member_id", memberId).eq("work_date", date)); },
    async saveBills(row) { return must(await sb.from("family_bills").upsert(row, { onConflict: "family_id,effective_month" }).select().single()); },
    async saveActual(row) { return must(await sb.from("actual_pay").upsert(row, { onConflict: "member_id,cycle_month" }).select().single()); },
    async deleteActual(memberId, month) { must(await sb.from("actual_pay").delete().eq("member_id", memberId).eq("cycle_month", month)); },
    async resetFamily(fid, confirmText, memberIds = []) {
      must(await sb.rpc("reset_family_data", { p_family: fid, p_confirm: confirmText }));
      for (const mid of memberIds) { // ลบรูปสลิปที่เก็บไว้ด้วย (ทำต่อแม้บางไฟล์ลบไม่ได้)
        try { const { data } = await sb.storage.from("payslips").list(`${fid}/${mid}`, { limit: 1000 });
          if (data?.length) await sb.storage.from("payslips").remove(data.map(f => `${fid}/${mid}/${f.name}`)); } catch (e) { console.warn(e); }
      }
    },
    subscribe(fid, onChange, onStatus) {
      const ch = sb.channel("family-" + fid);
      ["transactions", "work_days", "member_pay_settings", "family_bills", "actual_pay", "debts", "personal_budgets", "personal_spends", "recurring_items", "savings_goals", "goal_contribs", "category_budgets", "savings_accounts", "account_moves", "personal_accounts", "personal_moves", "bill_payments", "child_days", "child_spends"].forEach(t => {
        ch.on("postgres_changes", { event: "*", schema: "public", table: t, filter: `family_id=eq.${fid}` }, onChange);
        ch.on("postgres_changes", { event: "DELETE", schema: "public", table: t }, onChange); // การลบกรองตาม family ไม่ได้
      });
      ch.subscribe((status) => onStatus(status === "SUBSCRIBED"));
      return () => sb.removeChannel(ch);
    }
  };
}

function makeDemoApi() {
  const db = { users: [], families: [], members: [], txs: [], days: [], settings: [], bills: [], actual: [], debts: [], budgets: [], pspends: [], recurring: [], goals: [], contribs: [], catbud: [], accounts: [], moves: [], paccts: [], pmoves: [], bpays: [], cdays: [], cspends: [], files: {} };
  let session = null;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const wait = () => new Promise(r => setTimeout(r, 100));
  const upsert = (arr, row, keys) => { const i = arr.findIndex(r => keys.every(k => r[k] === row[k])); const r = { ...row, id: i >= 0 ? arr[i].id : uid() }; if (i >= 0) arr[i] = r; else arr.push(r); return r; };
  function seed(fid, meId) {
    const mom = { id: uid(), family_id: fid, user_id: "demo-mom", display_name: "แม่", role: "member" };
    db.members.push(mom);
    const t = new Date(), m0 = monthStart(t);
    const eff = ymd(addMonths(m0, -3));
    db.settings.push({ id: uid(), family_id: fid, member_id: meId, effective_month: eff, base_salary: 18000, shift_rate: 60, start_day: 21, end_day: 20, ot15_rate: null, ot20_rate: null, ot30_rate: null, incomes: [{ name: "ค่าอาหาร", amount: 1000 }], deductions: [{ name: "ประกันสังคม", amount: 750 }] });
    db.settings.push({ id: uid(), family_id: fid, member_id: mom.id, effective_month: eff, pay_type: "daily", base_salary: 450, shift_rate: 0, daily_incomes: [{ name: "ค่าอาหาร", amount: 40 }], start_day: 1, end_day: 31, ot15_rate: null, ot20_rate: null, ot30_rate: null, incomes: [], deductions: [{ name: "ประกันสังคม", amount: 750 }] });
    db.bills.push({ id: uid(), family_id: fid, effective_month: eff, items: [{ name: "ค่าเช่าบ้าน", amount: 6500 }, { name: "ผ่อนรถ", amount: 8200 }, { name: "ค่าน้ำค่าไฟ", amount: 1800 }, { name: "อินเทอร์เน็ต + มือถือ", amount: 900 }] });
    for (let d = addDays(t, -100); d <= t; d = addDays(d, 1)) {
      const wd = d.getDay();
      [[meId, 1], [mom.id, 2]].forEach(([mid, k]) => {
        const row = { id: uid(), family_id: fid, member_id: mid, work_date: ymd(d), status: wd === 0 ? "off" : "work", ot15_hours: 0, ot20_hours: 0, ot30_hours: 0, has_shift: false, note: "" };
        if (mid === meId) { if (wd === 2 || wd === 4) row.ot15_hours = 2; if (wd === 6) row.ot15_hours = 3; if (wd === 1 || wd === 3) row.has_shift = true; if (d.getDate() === 28) row.status = "sick"; }
        else { if (wd === 6) row.status = "off"; if (wd === 5 && d.getDate() % 2) row.ot15_hours = 2.5; if (d.getDate() === 15) row.ot20_hours = 4; }
        db.days.push(row);
      });
    }
    const spend = [["อาหาร", "shared", 380], ["อาหาร", "personal", 120], ["เดินทาง", "personal", 450], ["ของใช้ในบ้าน", "shared", 560], ["ช้อปปิ้ง", "personal", 890], ["สุขภาพ", "personal", 300], ["บันเทิง", "shared", 650]];
    let i = 0;
    for (let d = addDays(t, -95); d <= t; d = addDays(d, 2)) {
      const [cat, scope, amt] = spend[i % spend.length]; i++;
      db.txs.push({ id: uid(), family_id: fid, member_id: i % 2 ? meId : mom.id, created_by: session.id, type: "expense", scope, amount: amt + (i * 37) % 200, category: cat, note: "", tx_date: ymd(d), created_at: new Date().toISOString() });
    }
    db.txs.push({ id: uid(), family_id: fid, member_id: mom.id, created_by: session.id, type: "income", scope: "personal", amount: 2500, category: "ขายของ", note: "ขายขนมออนไลน์", tx_date: ymd(addDays(t, -3)), created_at: new Date().toISOString() });
    db.actual.push({ id: uid(), family_id: fid, member_id: meId, cycle_month: ymd(addMonths(m0, -1)), actual_net: 20150, note: "" });
    const dd = (n) => ymd(addDays(t, -n));
    [["advance", "pay", meId, "พ่อ", mom.id, "แม่", 1200, "ค่าโทรศัพท์แม่", 20], ["advance", "pay", mom.id, "แม่", meId, "พ่อ", 350, "ค่าข้าวพ่อ", 12],
     ["advance", "settle", mom.id, "แม่", meId, "พ่อ", 500, "", 6]].forEach(([kind, action, member_id, member_name, other_id, other_name, amount, note, n]) =>
      db.debts.push({ id: uid(), family_id: fid, kind, action, member_id, member_name, other_id, other_name, amount, note, tx_date: dd(n), created_by: session.id, created_at: new Date().toISOString() }));
    const myCycle = cycleRange(m0, 21, 20);
    db.budgets.push({ id: uid(), family_id: fid, member_id: meId, cycle_month: ymd(m0), amount: 6000, start_date: ymd(myCycle.start), end_date: ymd(myCycle.end) });
    [[3, 8000], [2, 6500], [1, 7200]].forEach(([k, amt]) => db.txs.push({ id: uid(), family_id: fid, member_id: meId, created_by: session.id, type: "income", scope: "shared", amount: amt, category: SAVE_CAT, note: `เงินเหลือรอบ ${monthLabel(addMonths(m0, -k))}`, tx_date: ymd(new Date(m0.getFullYear(), m0.getMonth() - k, 25)), created_at: new Date().toISOString() }));
    const g1 = { id: uid(), family_id: fid, name: "เที่ยวญี่ปุ่น", emoji: "✈️", target: 50000, deadline: ymd(addMonths(m0, 8)), created_by: session.id };
    const g2 = { id: uid(), family_id: fid, name: "เงินสำรองฉุกเฉิน", emoji: "🛟", target: 30000, deadline: null, created_by: session.id };
    db.goals.push(g1, g2);
    db.contribs.push({ id: uid(), family_id: fid, goal_id: g1.id, amount: 9000, note: "", contrib_date: dd(40), created_by: session.id }, { id: uid(), family_id: fid, goal_id: g2.id, amount: 6000, note: "", contrib_date: dd(20), created_by: session.id });
    db.catbud.push({ id: uid(), family_id: fid, effective_month: eff, items: [{ category: "อาหาร", amount: 2500 }, { category: "ช้อปปิ้ง", amount: 1200 }, { category: "ของใช้ในบ้าน", amount: 1500 }, { category: "เดินทาง", amount: 1500 }] });
    [["อาหาร", "ข้าวกลางวัน", 60, 0], ["อาหาร", "กาแฟ", 45, 0], ["อาหาร", "ข้าวกลางวัน", 60, 1], ["เดินทาง", "วินมอไซค์", 40, 1], ["อาหาร", "ข้าวเย็น", 120, 2], ["ช้อปปิ้ง", "เสื้อ", 390, 4], ["อาหาร", "ข้าวกลางวัน", 60, 5]].forEach(([category, note, amount, n]) =>
      db.pspends.push({ id: uid(), family_id: fid, member_id: meId, amount, category, note, spend_date: dd(n), created_at: new Date().toISOString() }));
    const ac1 = { id: uid(), family_id: fid, name: "ออมทรัพย์ กสิกร", emoji: "🏦", archived: false, created_by: session.id, created_at: new Date().toISOString() };
    const ac2 = { id: uid(), family_id: fid, name: "กระปุกฉุกเฉิน", emoji: "🐷", archived: false, created_by: session.id, created_at: new Date().toISOString() };
    db.accounts.push(ac1, ac2); g1.account_id = ac1.id;
    const pa1 = { id: uid(), family_id: fid, member_id: meId, name: "กระปุกส่วนตัว", emoji: "🔒", shared: false, created_at: new Date().toISOString() };
    const pa2 = { id: uid(), family_id: fid, member_id: mom.id, name: "เงินเก็บแม่", emoji: "👛", shared: true, created_at: new Date().toISOString() };
    db.paccts.push(pa1, pa2);
    db.pmoves.push({ id: uid(), family_id: fid, account_id: pa1.id, kind: "deposit", amount: 3500, note: "ยอดเริ่มต้น", move_date: dd(30), slip_path: null, created_at: new Date().toISOString() },
      { id: uid(), family_id: fid, account_id: pa2.id, kind: "deposit", amount: 12000, note: "ยอดเริ่มต้น", move_date: dd(30), slip_path: null, created_at: new Date().toISOString() });
    const lend = { id: uid(), family_id: fid, kind: "loan", action: "borrow", member_id: null, member_name: "ลุงชัย", other_id: null, other_name: "ออมทรัพย์ กสิกร, กระปุกฉุกเฉิน", amount: 7000, note: "ค่าซ่อมบ้าน", tx_date: dd(15), created_by: session.id, created_at: new Date().toISOString() };
    db.debts.push(lend);
    [[ac1.id, "deposit", 25000, "ยอดเริ่มต้น", 60, null], [ac2.id, "deposit", 8000, "ยอดเริ่มต้น", 60, null], [ac1.id, "deposit", 3000, "", 10, null],
     [ac1.id, "loan_out", 5000, "", 15, lend.id], [ac2.id, "loan_out", 2000, "", 15, lend.id]].forEach(([account_id, kind, amount, note, n, debt_id]) =>
      db.moves.push({ id: uid(), family_id: fid, account_id, kind, amount, note, move_date: dd(n), slip_path: null, debt_id, created_by: session.id, created_at: new Date().toISOString() }));
    db.recurring.push({ id: uid(), family_id: fid, member_id: meId, type: "expense", scope: "shared", amount: 419, category: "บันเทิง", note: "Netflix", day_of_month: 5, start_month: ymd(addMonths(m0, -2)), active: true, created_by: session.id });
    db.actual.push({ id: uid(), family_id: fid, member_id: meId, cycle_month: ymd(addMonths(m0, -2)), actual_net: 19820, note: "" });
    // ลูก (ไม่มีบัญชี) + เงินไปโรงเรียน
    const kid = { id: uid(), family_id: fid, user_id: null, display_name: "น้องมะลิ", role: "member", member_kind: "child" };
    db.members.push(kid);
    for (let d = addDays(t, -40); d <= t; d = addDays(d, 1)) { const wd = d.getDay(); if (wd === 0 || wd === 6) continue;
      db.cdays.push({ id: uid(), family_id: fid, member_id: kid.id, day_date: ymd(d), given: 50, spent: 25 + (d.getDate() * 7) % 26, note: "", created_at: new Date().toISOString() }); }
    db.cspends.push({ id: uid(), family_id: fid, member_id: kid.id, amount: 120, note: "ซื้อของเล่น", spend_date: dd(9), created_at: new Date().toISOString() });
    // รายจ่ายหลักที่จ่ายไปของรอบก่อน ๆ
    [1, 2, 3].forEach(k => { const M = ymd(addMonths(m0, -k));
      [["ค่าเช่าบ้าน", 6500], ["ผ่อนรถ", 8200], ["ค่าน้ำค่าไฟ", 1700 + k * 60], ["อินเทอร์เน็ต + มือถือ", 900]].forEach(([name, amount]) => db.bpays.push({ id: uid(), family_id: fid, cycle_month: M, source: "bill", member_id: null, name, amount, pay_date: M, created_at: new Date().toISOString() }));
      db.bpays.push({ id: uid(), family_id: fid, cycle_month: M, source: "deduct", member_id: meId, name: "ประกันสังคม", amount: 750, pay_date: M, created_at: new Date().toISOString() });
      db.bpays.push({ id: uid(), family_id: fid, cycle_month: M, source: "deduct", member_id: mom.id, name: "ประกันสังคม", amount: 750, pay_date: M, created_at: new Date().toISOString() }); });
  }
  const famRows = (arr, fid) => arr.filter(r => r.family_id === fid).map(r => ({ ...r }));
  return {
    async getUser() { return session; },
    async signUp(email, password) {
      await wait();
      if (password.length < 6) throw new Error("Password should be at least 6 characters");
      if (db.users.find(u => u.email === email)) throw new Error("User already registered");
      session = { id: uid(), email, password }; db.users.push(session); return session;
    },
    async signIn(email, password) {
      await wait();
      const u = db.users.find(u => u.email === email && u.password === password);
      if (!u) throw new Error("Invalid login credentials");
      session = u; return u;
    },
    async signOut() { session = null; },
    async getMyFamily(userId) {
      const me = db.members.find(m => m.user_id === userId); if (!me) return null;
      return { family: { ...db.families.find(f => f.id === me.family_id) }, me: { ...me }, members: db.members.filter(m => m.family_id === me.family_id).map(m => ({ ...m })) };
    },
    async createFamily(name, displayName) {
      await wait();
      const f = { id: uid(), name, invite_code: (uid() + uid()).toUpperCase().slice(0, 8), plan: "free" };
      db.families.push(f);
      const me = { id: uid(), family_id: f.id, user_id: session.id, display_name: displayName, role: "owner" };
      db.members.push(me); seed(f.id, me.id);
    },
    async joinFamily(code, displayName) {
      const f = db.families.find(f => f.invite_code === code.trim().toUpperCase());
      if (!f) throw new Error("invalid_code");
      db.members.push({ id: uid(), family_id: f.id, user_id: session.id, display_name: displayName, role: "member" });
    },
    async loadAll(fid) { await wait(); const me = db.members.find(m => m.user_id === session.id);
      return { txs: famRows(db.txs, fid), days: famRows(db.days, fid), settings: famRows(db.settings, fid), bills: famRows(db.bills, fid), actual: famRows(db.actual, fid),
        debts: famRows(db.debts, fid), budgets: famRows(db.budgets, fid).filter(b => b.member_id === me?.id),
        pspends: famRows(db.pspends, fid).filter(b => b.member_id === me?.id), recurring: famRows(db.recurring, fid), goals: famRows(db.goals, fid),
        contribs: famRows(db.contribs, fid), catbud: famRows(db.catbud, fid), accounts: famRows(db.accounts, fid), moves: famRows(db.moves, fid),
        paccts: famRows(db.paccts, fid).filter(a => a.member_id === me?.id || a.shared), pmoves: famRows(db.pmoves, fid).filter(m => { const a = db.paccts.find(x => x.id === m.account_id); return a && (a.member_id === me?.id || a.shared); }),
        bpays: famRows(db.bpays, fid), cdays: famRows(db.cdays, fid), cspends: famRows(db.cspends, fid), missing: [] }; },
    async setBillPays(fid, month, rows) { db.bpays = db.bpays.filter(r => !(r.family_id === fid && r.cycle_month === month)); rows.forEach(r => db.bpays.push({ ...r, id: uid(), created_at: new Date().toISOString() })); },
    async saveChildDay(row) { return upsert(db.cdays, { ...row, created_at: new Date().toISOString() }, ["member_id", "day_date"]); },
    async deleteChildDay(mid, date) { db.cdays = db.cdays.filter(r => !(r.member_id === mid && r.day_date === date)); },
    async addChildSpend(row) { const r = { ...row, id: uid(), created_at: new Date().toISOString() }; db.cspends.push(r); return r; },
    async deleteChildSpend(id) { db.cspends = db.cspends.filter(r => r.id !== id); },
    async setMemberKind(mid, kind) { const me = db.members.find(m => m.user_id === session.id), t = db.members.find(m => m.id === mid); if (me?.role !== "owner") throw new Error("not_owner"); if (t.role === "owner" && kind === "child") throw new Error("owner_cannot_be_child"); t.member_kind = kind; },
    async addChild(fid, name) { const me = db.members.find(m => m.user_id === session.id); if (me?.role !== "owner") throw new Error("not_owner"); db.members.push({ id: uid(), family_id: fid, user_id: null, display_name: name, role: "member", member_kind: "child" }); },
    async updateChild(mid, name, avatar) { Object.assign(db.members.find(m => m.id === mid), { display_name: name, avatar_url: avatar }); },
    async savePAcct(row) { if (row.id) { Object.assign(db.paccts.find(a => a.id === row.id), row); return row; } const r = { ...row, id: uid(), created_at: new Date().toISOString() }; db.paccts.push(r); return r; },
    async deletePAcct(id) { db.paccts = db.paccts.filter(a => a.id !== id); db.pmoves = db.pmoves.filter(m => m.account_id !== id); },
    async addPMove(row) { const r = { ...row, id: uid(), created_at: new Date().toISOString() }; db.pmoves.push(r); return r; },
    async deletePMove(id) { db.pmoves = db.pmoves.filter(m => m.id !== id); },
    async clearPSpends(mid, s0, e0) { db.pspends = db.pspends.filter(t => !(t.member_id === mid && t.spend_date >= s0 && t.spend_date <= e0)); },
    async saveAcct(row) { if (row.id) { Object.assign(db.accounts.find(a => a.id === row.id), row); return row; } const r = { ...row, id: uid(), archived: false, created_by: session.id, created_at: new Date().toISOString() }; db.accounts.push(r); return r; },
    async deleteAcct(id) { db.accounts = db.accounts.filter(a => a.id !== id); db.moves = db.moves.filter(m => m.account_id !== id); },
    async addMoves(rows) { const out = rows.map(r => ({ ...r, id: uid(), created_by: session.id, created_at: new Date().toISOString() })); db.moves.push(...out); return out; },
    async deleteMove(id) { db.moves = db.moves.filter(m => m.id !== id); },
    async deleteMovesByDebt(debtId) { db.moves = db.moves.filter(m => m.debt_id !== debtId); },
    async updateTx(id, patch) { Object.assign(db.txs.find(t => t.id === id), patch); },
    async updateDebt(id, patch) { Object.assign(db.debts.find(t => t.id === id), patch); },
    async addPSpend(row) { const r = { ...row, id: uid(), created_at: new Date().toISOString() }; db.pspends.push(r); return r; },
    async updatePSpend(id, patch) { Object.assign(db.pspends.find(t => t.id === id), patch); },
    async deletePSpend(id) { db.pspends = db.pspends.filter(t => t.id !== id); },
    async addRecurring(row) { const r = { ...row, id: uid(), active: true, created_by: session.id, created_at: new Date().toISOString() }; db.recurring.push(r); return r; },
    async updateRecurring(id, patch) { Object.assign(db.recurring.find(t => t.id === id), patch); },
    async deleteRecurring(id) { db.recurring = db.recurring.filter(t => t.id !== id); db.txs.forEach(t => { if (t.recurring_id === id) t.recurring_id = null; }); },
    async insertRecurringTx(rows) { rows.forEach(r => { if (!db.txs.some(t => t.recurring_id === r.recurring_id && t.recurring_month === r.recurring_month)) db.txs.push({ ...r, id: uid(), created_by: session.id, created_at: new Date().toISOString() }); }); },
    async saveGoal(row) { if (row.id) { Object.assign(db.goals.find(g => g.id === row.id), row); return row; } const r = { ...row, id: uid(), created_by: session.id, created_at: new Date().toISOString() }; db.goals.push(r); return r; },
    async deleteGoal(id) { db.goals = db.goals.filter(g => g.id !== id); db.contribs = db.contribs.filter(c => c.goal_id !== id); },
    async addContrib(row) { const r = { ...row, id: uid(), created_by: session.id, created_at: new Date().toISOString() }; db.contribs.push(r); return r; },
    async saveCatBudget(row) { return upsert(db.catbud, row, ["family_id", "effective_month"]); },
    async addDebt(row) { const r = { ...row, id: uid(), created_by: session.id, created_at: new Date().toISOString() }; db.debts.push(r); return r; },
    async deleteDebt(id) { db.debts = db.debts.filter(d => d.id !== id); },
    async saveBudget(row) { return upsert(db.budgets, row, ["member_id", "cycle_month"]); },
    async setPermissions(mid, perms) { const me = db.members.find(m => m.user_id === session.id); if (me?.role !== "owner") throw new Error("not_owner"); db.members.find(m => m.id === mid).permissions = perms; },
    async addTx(tx) { const r = { ...tx, id: uid(), created_by: session.id, created_at: new Date().toISOString() }; db.txs.push(r); return r; },
    async deleteTx(id) { db.txs = db.txs.filter(t => t.id !== id); },
    async savePaySettings(row) { return upsert(db.settings, row, ["member_id", "effective_month"]); },
    async saveWorkDay(row) { return upsert(db.days, row, ["member_id", "work_date"]); },
    async deleteWorkDay(mid, date) { db.days = db.days.filter(d => !(d.member_id === mid && d.work_date === date)); },
    async saveBills(row) { return upsert(db.bills, row, ["family_id", "effective_month"]); },
    async saveActual(row) { return upsert(db.actual, row, ["member_id", "cycle_month"]); },
    async updateFamily(fid, patch) { Object.assign(db.families.find(f => f.id === fid), patch); },
    async removeMember(fid, mid) {
      const me = db.members.find(m => m.user_id === session.id && m.family_id === fid), t = db.members.find(m => m.id === mid);
      if (!me || me.role !== "owner") throw new Error("not_owner"); if (!t) throw new Error("not_found"); if (t.role === "owner") throw new Error("cannot_remove_owner");
      db.txs.forEach(x => { if (x.member_id === mid && x.scope === "shared") x.member_id = me.id; });
      db.txs = db.txs.filter(x => x.member_id !== mid); ["days", "settings", "actual"].forEach(k => db[k] = db[k].filter(r => r.member_id !== mid));
      db.members = db.members.filter(m => m.id !== mid);
    },
    async updateMe(mid, patch) { Object.assign(db.members.find(m => m.id === mid), patch); },
    async uploadSlip(path, blob) { db.files[path] = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }); return path; },
    async slipUrl(path) { if (!db.files[path]) throw new Error("ไม่พบไฟล์"); return db.files[path]; },
    async deleteSlip(path) { delete db.files[path]; },
    async deleteActual(mid, month) { db.actual = db.actual.filter(a => !(a.member_id === mid && a.cycle_month === month)); },
    async resetFamily(fid, confirmText) {
      const f = db.families.find(x => x.id === fid), me = db.members.find(m => m.user_id === session.id && m.family_id === fid);
      if (!me || me.role !== "owner") throw new Error("not_owner");
      if (f.name !== confirmText.trim()) throw new Error("confirm_mismatch");
      ["txs", "days", "settings", "bills", "actual", "debts", "budgets", "pspends", "recurring", "goals", "contribs", "catbud", "accounts", "moves", "paccts", "pmoves", "bpays", "cdays", "cspends"].forEach(k => db[k] = db[k].filter(r => r.family_id !== fid));
    },
    subscribe(fid, onChange, onStatus) { onStatus(true); return () => {}; }
  };
}

function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}

/* =========================================================
   STATE + INDEX
   ========================================================= */
let api, unsubscribe = null;
const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const state = {
  user: null, family: null, me: null, members: [],
  data: { txs: [], days: [], settings: [], bills: [], actual: [], missing: [] },
  anchor: today0(), period: "month", ioPeriod: "month", ioView: "flow", pView: "daily", tab: "overview", filter: "all", authMode: "login",
  tx: { type: "expense", category: null, who: "shared", loanAction: "borrow", loanWho: "home", advAction: "pay", advFrom: null, advTo: null },
  salMember: null, day: { date: null, status: "work", shift: false },
  draft: { incomes: [], dailyIncomes: [], deductions: [], bills: [] }, act: { mid: null, M: null }
};
const IDX = { days: new Map(), settings: {}, bills: [], actual: new Map(), catbud: [], recur: new Set() };
const MEMO = new Map(); // เก็บผลคำนวณซ้ำ ล้างทุกครั้งที่ข้อมูลเปลี่ยน
const memo = (key, fn) => { if (MEMO.has(key)) return MEMO.get(key); const v = fn(); MEMO.set(key, v); return v; };
function buildIndex() {
  const D = state.data;
  MEMO.clear();
  ["pspends", "recurring", "goals", "contribs", "catbud", "debts", "budgets", "accounts", "moves", "paccts", "pmoves", "bpays", "cdays", "cspends"].forEach(k => D[k] ||= []);
  IDX.catbud = [...D.catbud].sort((x, y) => String(y.effective_month).localeCompare(String(x.effective_month)));
  IDX.recur = new Set(D.txs.filter(t => t.recurring_id).map(t => t.recurring_id + "|" + String(t.recurring_month).slice(0, 10)));
  IDX.days = new Map(D.days.map(d => [d.member_id + "|" + String(d.work_date).slice(0, 10), d]));
  IDX.settings = {};
  D.settings.forEach(s => (IDX.settings[s.member_id] ||= []).push(s));
  Object.values(IDX.settings).forEach(a => a.sort((x, y) => String(y.effective_month).localeCompare(String(x.effective_month))));
  IDX.bills = [...D.bills].sort((x, y) => String(y.effective_month).localeCompare(String(x.effective_month)));
  IDX.actual = new Map(D.actual.map(a => [a.member_id + "|" + String(a.cycle_month).slice(0, 10), a]));
}
const settingsFor = (mid, mStr) => (IDX.settings[mid] || []).find(s => String(s.effective_month).slice(0, 10) <= mStr) || null;
const billsFor = (mStr) => IDX.bills.find(b => String(b.effective_month).slice(0, 10) <= mStr) || null;
const dayRec = (mid, d) => IDX.days.get(mid + "|" + (typeof d === "string" ? d : ymd(d)));
const memberIdx = (id) => Math.max(0, state.members.findIndex(m => m.id === id));
const memberName = (id) => state.members.find(m => m.id === id)?.display_name || "—";
const meMember = () => state.members.find(m => m.id === state.me.id) || state.me;
const isChild = (m) => (typeof m === "string" ? state.members.find(x => x.id === m) : m)?.member_kind === "child";
const adults = () => state.members.filter(m => !isChild(m));
const kids = () => state.members.filter(m => isChild(m));
const canKid = () => !isChild(meMember()); // ผู้ใหญ่ทุกคนในบ้านบันทึกเงินไปโรงเรียนของเด็กได้
const isOwner = () => state.me?.role === "owner";
const can = (k) => { if (isOwner()) return true; const v = (meMember().permissions || {})[k]; return v === undefined ? !!PERMS.find(x => x[0] === k)?.[2] : !!v; };
const feat = (k) => { const v = (state.family?.features || {})[k]; return v === undefined ? !!FEATURES.find(x => x[0] === k)?.[3] : !!v; };
const canEditMember = (id) => id === state.me.id || can("salary_all");
const avatarHTML = (m, cls = "mini-av") => m.avatar_url
  ? `<img class="${cls} av-img" src="${esc(m.avatar_url)}" alt="">`
  : `<span class="${cls}" style="background:${avColor(memberIdx(m.id))}">${esc(initial(m.display_name))}</span>`;
function paintAvatar(el, url, letter, bg) {
  el.innerHTML = url ? `<img src="${esc(url)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : esc(letter);
  el.style.background = url ? "var(--surface-2)" : bg;
}
/* ---------- images ---------- */
function loadImage(file) {
  return new Promise((res, rej) => { const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); }; img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("อ่านไฟล์รูปไม่ได้ ลองใช้ไฟล์ JPG หรือ PNG")); }; img.src = url; });
}
async function avatarDataUrl(file) { // ครอปสี่เหลี่ยมจัตุรัส 256px
  const img = await loadImage(file), side = Math.min(img.width, img.height), c = document.createElement("canvas");
  c.width = c.height = 256;
  c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
  return c.toDataURL("image/jpeg", 0.82);
}
async function slipBlob(file) { // ย่อด้านยาวไม่เกิน 1800px ให้ตัวหนังสือบนสลิปยังอ่านออก
  const img = await loadImage(file), k = Math.min(1, 1800 / Math.max(img.width, img.height)), c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, "image/jpeg", 0.82));
}
const countable = (t) => !(t.type === "income" && String(t.note || "").startsWith(LEGACY_SLIP));

function payFor(mid, M) { return memo("pay|" + mid + "|" + ymd(M), () => payForRaw(mid, M)); }
function payForRaw(mid, M) {
  const mStr = ymd(M), s = settingsFor(mid, mStr);
  if (!s) return null;
  const S = { ...DEFAULT_PAY, ...s };
  const range = cycleRange(M, +S.start_day, +S.end_day);
  const days = []; eachDay(range.start, range.end, d => { const r = dayRec(mid, d); if (r) days.push(r); });
  const p = calcPay(S, days);
  const a = IDX.actual.get(mid + "|" + mStr);
  return Object.assign(p, { range, settings: S, days, inheritedFrom: String(s.effective_month).slice(0, 10) !== mStr ? parseYmd(s.effective_month) : null,
    actual: a && a.actual_net !== null && a.actual_net !== undefined ? +a.actual_net : null,
    used: a && a.actual_net !== null && a.actual_net !== undefined ? +a.actual_net : p.net, slipPath: a?.slip_path || null, actualRow: a || null });
}
// รายได้ของ 1 วัน (ใช้กับมุมมองวัน/สัปดาห์): ส่วนคงที่ของรอบเฉลี่ยรายวัน + OT + ค่ากะของวันนั้น
function dailyEarn(mid, d) {
  for (const off of [0, 1]) {
    const M = addMonths(monthStart(d), off), s = settingsFor(mid, ymd(M));
    if (!s) continue;
    const S = { ...DEFAULT_PAY, ...s }, r = cycleRange(M, +S.start_day, +S.end_day);
    if (d < r.start || d > r.end) continue;
    const len = daysBetween(r.start, r.end);
    const daily = isDaily(S);
    let fixed = ((daily ? 0 : +S.base_salary) + sumItems(S.incomes) - sumItems(S.deductions)) / len;
    const rec = dayRec(mid, d);
    let ot = 0, shift = 0, otH = 0;
    if (rec) {
      if (!daily && rec.status === "unpaid") fixed -= +S.base_salary / 30;
      if (daily && rec.status === "work") fixed += +S.base_salary;
      if (rec.status === "work") fixed += sumItems(S.daily_incomes);
      ot = dayOtPay(rec, otRates(S)); otH = dayOtHours(rec);
      if (rec.has_shift) shift = +S.shift_rate || 0;
    }
    return { fixed, ot, shift, otH };
  }
  return { fixed: 0, ot: 0, shift: 0, otH: 0 };
}

/* ---------- periods ---------- */
function dataBounds() {
  const D = state.data; let min = null, max = null;
  const see = (s) => { if (!s) return; s = String(s).slice(0, 10); if (!min || s < min) min = s; if (!max || s > max) max = s; };
  D.txs.forEach(t => see(t.tx_date)); D.days.forEach(d => see(d.work_date)); D.settings.forEach(s => see(s.effective_month)); D.bills.forEach(b => see(b.effective_month));
  const t = today0();
  return { start: min ? monthStart(parseYmd(min)) : monthStart(t), end: max && parseYmd(max) > t ? parseYmd(max) : t };
}
const effPeriod = () => state.tab === "list" ? state.ioPeriod : state.tab === "overview" ? state.period : "month";
function periodRange(period = state.period) {
  const a = state.anchor;
  switch (period) {
    case "day": return { start: a, end: a };
    case "week": { const s = addDays(a, -((a.getDay() + 6) % 7)); return { start: s, end: addDays(s, 6) }; }
    case "month": return { start: monthStart(a), end: new Date(a.getFullYear(), a.getMonth() + 1, 0) };
    case "year": return { start: new Date(a.getFullYear(), 0, 1), end: new Date(a.getFullYear(), 11, 31) };
    default: { const b = dataBounds(); return { start: b.start, end: new Date(b.end.getFullYear(), b.end.getMonth() + 1, 0) }; }
  }
}
function periodLabel() {
  const a = state.anchor, P = effPeriod(), r = periodRange(P);
  if (state.tab === "salary" || state.tab === "personal") return "รอบ " + monthLabel(a);
  switch (P) {
    case "day": return a.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });
    case "week": return `${r.start.getDate()}${r.start.getMonth() !== r.end.getMonth() ? " " + monthShort(r.start) : ""}–${r.end.getDate()} ${monthShort(r.end)}`;
    case "month": return monthLabel(a);
    case "year": return "ปี " + a.toLocaleDateString("th-TH", { year: "numeric" }).replace(/\D*/, "");
    default: return "ทั้งหมด";
  }
}
function shiftAnchor(dir) {
  const a = state.anchor, p = effPeriod();
  if (p === "all") return;
  state.anchor = p === "day" ? addDays(a, dir) : p === "week" ? addDays(a, 7 * dir)
    : p === "month" ? new Date(a.getFullYear(), a.getMonth() + dir, 1) : new Date(a.getFullYear() + dir, 0, 1);
  renderAll();
}

/* ---------- household summary for the chosen period ---------- */
// สรุปรายเดือน (เงินเดือนคิดตามรอบของแต่ละคน + รายการจากปุ่ม +) ในช่วง start..end
function summarize(start, end, capToNow = true) {
  return memo(`sum|${ymd(start)}|${ymd(end)}|${capToNow}|${feat("salary")}${feat("salary_overview")}`, () => summarizeRaw(start, end, capToNow));
}
function summarizeRaw(start, end, capToNow = true) {
  const t0 = today0(), monthEndNow = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
  const calcEnd = capToNow ? new Date(Math.min(+end, +monthEndNow)) : end;
  const per = {}; state.members.forEach(m => per[m.id] = { base: 0, ot: 0, shift: 0, other: 0, otH: 0, est: 0, actual: 0, hasActual: false });
  let bills = 0, billMonths = 0;
  eachMonth(start, calcEnd, M => {
    if (feat("salary") && feat("salary_overview")) state.members.forEach(m => {
      const p = payFor(m.id, M); if (!p) return;
      const x = per[m.id];
      x.ot += p.otTotal; x.shift += p.shiftPay; x.otH += p.hours; x.base += p.used - p.otTotal - p.shiftPay; x.est += p.net;
      if (p.actual !== null) { x.hasActual = true; x.actual += p.actual; }
    });
    billMonths++;
  });
  // รายการที่บันทึกไว้ล่วงหน้า (เช่น ฝากเงินเหลือลงวันที่ 1 ของเดือนหน้า) นับตามช่วงที่เลือกเสมอ
  const s0 = ymd(start), e0 = ymd(end);
  // ถ้าไม่นับเงินเดือนอัตโนมัติ: ภาพรวมคิดจากรายการรับ–จ่ายทั้งหมด (รวมเงินฝากจากเงินเหลือ) ให้ตรงกับหน้ารับ–จ่าย
  const txs = state.data.txs.filter(t => countable(t) && (t.category !== SAVE_CAT || !feat("salary_overview")) && t.tx_date >= s0 && t.tx_date <= e0);
  let shared = 0, personal = 0, sharedIncome = 0; const cats = {};
  txs.forEach(t => {
    const a = +t.amount;
    if (t.type === "income") {
      if (t.scope === "shared" || !per[t.member_id]) sharedIncome += a;
      else if (!feat("salary_overview") && SALARY_CATS.has(t.category)) per[t.member_id].base += a; // เงินเดือนที่บันทึกเอง
      else per[t.member_id].other += a;
    }
    else { if (t.scope === "shared") shared += a; else personal += a; cats[t.category] = (cats[t.category] || 0) + a; }
  });
  let payroll = 0, other = sharedIncome;
  Object.values(per).forEach(x => { payroll += x.base + x.ot + x.shift; other += x.other; });
  const income = payroll + other, expense = bills + shared + personal;
  return { start, end, calcEnd, monthly: true, per, bills, billMonths, shared, personal, cats, txs, payroll, other, sharedIncome, income, expense, balance: income - expense };
}
function computeSummary() { const r = periodRange(state.period); return summarize(r.start, r.end, state.period !== "month"); }
const monthFlow = (M) => summarize(M, new Date(M.getFullYear(), M.getMonth() + 1, 0), false);
const yearFlow = (y) => summarize(new Date(y, 0, 1), new Date(y, 11, 31), true);

/* =========================================================
   CHARTS (SVG, no library)
   ========================================================= */
function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
function gridSVG(W, H, padL, padT, padB, max, fmt) {
  let g = "";
  [0, .5, 1].forEach(f => {
    const y = padT + (H - padT - padB) * (1 - f);
    g += `<line x1="${padL}" x2="${W}" y1="${y}" y2="${y}" stroke="var(--grid)" stroke-width="1"/>`;
    g += `<text x="${padL - 6}" y="${y + 3.5}" font-size="10" text-anchor="end">${fmt(max * f)}</text>`;
  });
  return g;
}
function xLabels(labels, x0, band, H, padB) {
  const step = Math.ceil(labels.length / 8);
  const n = labels.length;
  return labels.map((l, i) => (i % step === 0 || (i === n - 1 && (n - 1) % step >= step / 2))
    ? `<text x="${x0 + band * i + band / 2}" y="${H - padB + 15}" font-size="10" text-anchor="middle">${esc(l)}</text>` : "").join("");
}
function barChart(el, tipEl, { labels, series, stacked = true, fmt = shortNum, tip, H = 180, emptyText = "ยังไม่มีข้อมูล", refLine = null, initialTip = null, hi = null, totalLabels = false }) {
  const n = labels.length;
  const totals = labels.map((_, i) => stacked ? series.reduce((a, s) => a + Math.max(0, s.values[i] || 0), 0) : Math.max(0, ...series.map(s => s.values[i] || 0)));
  if (!n || totals.every(v => !v)) { el.innerHTML = `<div class="empty">${emptyText}</div>`; tipEl.innerHTML = ""; return; }
  const padL = 34, padT = totalLabels || series.some(s => s.label) ? 20 : 8, padB = 22, W = Math.max(340, n * (stacked ? 14 : n > 12 ? 14 : 30) + padL);
  const max = niceMax(Math.max(...totals, refLine || 0)), band = (W - padL) / n, plotH = H - padT - padB;
  let bars = "", hits = "";
  labels.forEach((l, i) => {
    const x = padL + band * i;
    if (stacked) {
      const bw = Math.max(3, Math.min(22, band * .62)); let y = H - padB;
      series.forEach(s => { const v = Math.max(0, s.values[i] || 0); if (!v) return; const h = v / max * plotH; y -= h;
        bars += `<rect x="${x + (band - bw) / 2}" y="${y}" width="${bw}" height="${h}" rx="${Math.min(4, bw / 2)}" fill="${s.color}"/>`; });
      if (totalLabels && totals[i]) bars += `<text x="${x + band / 2}" y="${Math.max(padT + 10, y - 5)}" text-anchor="middle" font-size="12" font-weight="800" style="fill:var(--ink)">${shortNum(totals[i])}</text>`;
    } else {
      const gw = Math.min(40, band * .74), bw = gw / series.length;
      series.forEach((s, j) => { const v = Math.max(0, s.values[i] || 0); if (!v) return; const h = v / max * plotH;
        bars += `<rect x="${x + (band - gw) / 2 + j * bw + 1}" y="${H - padB - h}" width="${bw - 2}" height="${h}" rx="4" fill="${s.color}"/>`;
        if (s.label) bars += `<text x="${x + (band - gw) / 2 + j * bw + bw / 2}" y="${Math.max(padT + 10, H - padB - h - 5)}" text-anchor="middle" font-size="${s.labelSize || 11}" font-weight="800" style="fill:${s.labelColor || "var(--ink)"}">${shortNum(v)}</text>`; });
    }
    hits += `<rect class="hit" data-i="${i}" x="${x}" y="${padT}" width="${band}" height="${plotH}"/>`;
  });
  const ref = refLine ? `<line x1="${padL}" x2="${W}" y1="${H - padB - refLine / max * plotH}" y2="${H - padB - refLine / max * plotH}" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="5 4"/>` : "";
  const hil = hi !== null ? `<rect x="${padL + band * hi}" y="${padT}" width="${band}" height="${plotH}" fill="color-mix(in srgb,var(--brand) 9%,transparent)" rx="6"/>` : "";
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="min-width:${W > 520 ? W + "px" : "0"}">${gridSVG(W, H, padL, padT, padB, max, fmt)}${hil}${bars}${ref}${xLabels(labels, padL, band, H, padB)}${hits}</svg>`;
  bindTips(el, tipEl, tip, initialTip);
}
// กราฟแท่งบวก/ลบจากเส้นศูนย์ (เงินเหลือโตขึ้น/ลดลง)
function divChart(el, tipEl, { labels, values, tip, H = 190, hi = null, emptyText = "ยังไม่มีข้อมูล" }) {
  const n = labels.length;
  if (!n || values.every(v => !v)) { el.innerHTML = `<div class="empty">${emptyText}</div>`; tipEl.innerHTML = ""; return; }
  const padL = 38, padT = 10, padB = 22, W = Math.max(340, n * 22 + padL), plotH = H - padT - padB;
  const mx = niceMax(Math.max(1, ...values.map(v => Math.max(0, v)))), mn = niceMax(Math.max(0, ...values.map(v => Math.max(0, -v))));
  const span = mx + (mn || 0) || 1, zeroY = padT + plotH * (mx / span), band = (W - padL) / n, bw = Math.max(4, Math.min(26, band * .62));
  let g = `<line x1="${padL}" x2="${W}" y1="${zeroY}" y2="${zeroY}" stroke="var(--line)" stroke-width="1.5"/>
    <text x="${padL - 6}" y="${padT + 4}" font-size="10" text-anchor="end">${shortNum(mx)}</text><text x="${padL - 6}" y="${zeroY + 3.5}" font-size="10" text-anchor="end">0</text>`;
  if (mn) g += `<text x="${padL - 6}" y="${H - padB}" font-size="10" text-anchor="end">−${shortNum(mn)}</text>`;
  let bars = "", hits = "";
  values.forEach((v, i) => {
    const x = padL + band * i + (band - bw) / 2, h = Math.abs(v) / span * plotH, y = v >= 0 ? zeroY - h : zeroY;
    if (v) bars += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(1, h)}" rx="4" fill="${v >= 0 ? "var(--income)" : "var(--expense)"}" ${hi !== null && i !== hi ? 'opacity=".55"' : ""}/>`;
    hits += `<rect class="hit" data-i="${i}" x="${padL + band * i}" y="${padT}" width="${band}" height="${plotH}"/>`;
  });
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="min-width:${W > 520 ? W + "px" : "0"}">${g}${bars}${xLabels(labels, padL, band, H, padB)}${hits}</svg>`;
  bindTips(el, tipEl, tip, hi !== null ? hi : n - 1);
}
function lineChart(el, tipEl, { labels, series, fmt = shortNum, tip, H = 190, initialTip = null }) {
  const n = labels.length;
  if (n < 2) { el.innerHTML = `<div class="empty">เลือกมุมมองสัปดาห์ขึ้นไปเพื่อดูกราฟสะสม</div>`; tipEl.innerHTML = ""; return; }
  const padL = 34, padT = 10, padB = 22, W = Math.max(340, n * 10 + padL);
  const max = niceMax(Math.max(1, ...series.flatMap(s => s.values.filter(v => v !== null)))), band = (W - padL) / n, plotH = H - padT - padB;
  const X = i => padL + band * i + band / 2, Y = v => padT + plotH * (1 - Math.max(0, v) / max);
  let paths = "";
  series.forEach((s, k) => {
    const idx = s.values.map((v, i) => v === null ? -1 : i).filter(i => i >= 0); if (!idx.length) return;
    const pts = idx.map(i => `${X(i).toFixed(1)},${Y(s.values[i]).toFixed(1)}`), last = idx[idx.length - 1];
    if (!s.noArea) {
      paths += `<defs><linearGradient id="lg${k}${el.id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".22"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs>`;
      paths += `<path d="M${X(idx[0])},${H - padB} L${pts.join(" L")} L${X(last)},${H - padB} Z" fill="url(#lg${k}${el.id})"/>`;
    }
    paths += `<path d="M${pts.join(" L")}" fill="none" stroke="${s.color}" stroke-width="${s.dash ? 1.8 : 2.4}" ${s.dash ? 'stroke-dasharray="5 4"' : ""} stroke-linejoin="round" stroke-linecap="round"/>`;
    if (!s.dash) paths += `<circle cx="${X(last)}" cy="${Y(s.values[last])}" r="4" fill="${s.color}"/>`;
  });
  let hits = ""; labels.forEach((_, i) => hits += `<rect class="hit" data-i="${i}" x="${padL + band * i}" y="${padT}" width="${band}" height="${plotH}"/>`);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="min-width:${W > 520 ? W + "px" : "0"}">${gridSVG(W, H, padL, padT, padB, max, fmt)}${paths}${xLabels(labels, padL, band, H, padB)}${hits}</svg>`;
  bindTips(el, tipEl, tip, initialTip ?? n - 1);
}
function bindTips(el, tipEl, tip, initialIdx = null) {
  const show = (i, rect) => { el.querySelectorAll(".hit.sel").forEach(r => r.classList.remove("sel")); if (rect) rect.classList.add("sel"); tipEl.innerHTML = tip(i); };
  el.querySelectorAll(".hit").forEach(r => { r.addEventListener("mouseenter", () => show(+r.dataset.i, r)); r.addEventListener("click", () => show(+r.dataset.i, r)); });
  tipEl.innerHTML = initialIdx !== null ? tip(initialIdx) : `<span>แตะที่กราฟเพื่อดูรายละเอียด</span>`;
}
// โดนัทรายรับ–รายจ่าย ตัวเลขคงเหลืออยู่กลางวง
function donutSVG(inc, out, { size = 168, label = "คงเหลือ", onHero = false } = {}) {
  const r = size / 2 - 14, c = 2 * Math.PI * r, tot = inc + out, bal = inc - out;
  const fi = tot ? inc / tot : 0, ink = onHero ? "var(--hero-ink)" : "var(--ink)", mut = onHero ? "rgba(255,255,255,.75)" : "var(--muted)";
  const cin = onHero ? "#7CE0B5" : "var(--income)", cout = onHero ? "#FF9AA5" : "var(--expense)";
  const big = Math.abs(bal) >= 1e6 ? shortNum(bal) : Math.round(Math.abs(bal)).toLocaleString("th-TH");
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="รายรับ ${bahtR(inc)} รายจ่าย ${bahtR(out)} คงเหลือ ${signed(Math.round(bal))}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${onHero ? "rgba(255,255,255,.14)" : "var(--surface-2)"}" stroke-width="18"/>
    ${tot ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${cin}" stroke-width="18" stroke-dasharray="${c * fi} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${cout}" stroke-width="18" stroke-dasharray="${c * (1 - fi)} ${c}" stroke-dashoffset="${-c * fi}" transform="rotate(-90 ${size / 2} ${size / 2})"/>` : ""}
    <text x="50%" y="${size / 2 - 14}" text-anchor="middle" font-size="12.5" fill="${mut}">${label}</text>
    <text x="50%" y="${size / 2 + 13}" text-anchor="middle" font-size="${big.length > 7 ? 21 : 26}" font-weight="800" fill="${bal < 0 ? cout : ink}">${bal < 0 ? "−" : ""}฿${big}</text>
    <text x="50%" y="${size / 2 + 33}" text-anchor="middle" font-size="11.5" fill="${mut}">${tot ? `ใช้ไป ${Math.round(out / Math.max(inc, 1) * 100)}% ของรายรับ` : "ยังไม่มีรายการ"}</text></svg>`;
}
function ringSVG(pct) {
  const r = 38, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct));
  const col = pct >= 1 ? "#7CE0B5" : pct >= .8 ? "#F6C766" : "#FF9AA5";
  return `<circle cx="48" cy="48" r="${r}" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="9"/>
    <circle cx="48" cy="48" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c * p} ${c}" transform="rotate(-90 48 48)"/>
    <text x="48" y="47" text-anchor="middle" font-size="18" font-weight="700">${isFinite(pct) ? Math.round(pct * 100) + "%" : "—"}</text>
    <text x="48" y="63" text-anchor="middle" font-size="10" opacity=".8">พอจ่าย</text>`;
}

/* =========================================================
   BOOT / ROUTE / LOAD
   ========================================================= */
function show(view) { ["viewAuth", "viewOnboard", "viewApp"].forEach(v => $(v).classList.toggle("hidden", v !== view)); }
async function boot() {
  if (DEMO) { api = makeDemoApi(); $("demoNoteAuth").classList.remove("hidden"); $("demoNoteApp").classList.remove("hidden"); }
  else { await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"); api = makeSupabaseApi(); }
  state.user = await api.getUser();
  await route();
}
async function route() {
  if (!state.user) return show("viewAuth");
  const fam = await api.getMyFamily(state.user.id);
  if (!fam) { show("viewOnboard"); $("obName").focus(); return; }
  Object.assign(state, { family: fam.family, me: fam.me, members: fam.members });
  if (state.salMember !== "all" && !state.members.some(m => m.id === state.salMember)) state.salMember = "all";
  show("viewApp");
  await reload();
  if (unsubscribe) unsubscribe();
  let t = null;
  unsubscribe = api.subscribe(state.family.id, () => { clearTimeout(t); t = setTimeout(reload, 500); }, (ok) => $("liveDot").classList.toggle("on", ok));
}
async function reload() {
  try { state.data = await api.loadAll(state.family.id); }
  catch (err) { toast(friendlyError(err)); }
  const miss = state.data.missing || [];
  $("schemaNote").classList.toggle("hidden", !miss.length);
  $("schemaNote").textContent = miss.length ? `ฐานข้อมูลยังไม่อัปเดต (${miss.join(", ")}) ให้รันไฟล์ schema ที่ยังไม่ได้รันใน Supabase (ล่าสุดคือ schema_phase11.sql)` : "";
  buildIndex();
  if (await runRecurring()) return reload();
  renderAll();
  maybeWizard();
}
let recurBusy = false;
async function runRecurring() { // สร้างรายการประจำของเดือนที่ถึงกำหนดแล้วแต่ยังไม่มี
  if (recurBusy || !feat("recurring") || !(state.data.recurring || []).length) return false;
  const t0 = today0(), rows = [];
  state.data.recurring.filter(r => r.active).forEach(r => {
    for (let M = parseYmd(r.start_month); M <= monthStart(t0); M = addMonths(M, 1)) {
      const mStr = ymd(M), day = Math.min(+r.day_of_month, lastDayOf(M.getFullYear(), M.getMonth())), d = new Date(M.getFullYear(), M.getMonth(), day);
      if (d > t0 || IDX.recur.has(r.id + "|" + mStr)) continue;
      rows.push({ family_id: r.family_id, member_id: r.member_id, type: r.type, scope: r.scope, amount: r.amount, category: r.category, note: r.note, tx_date: ymd(d), recurring_id: r.id, recurring_month: mStr });
    }
  });
  if (!rows.length) return false;
  recurBusy = true;
  try { await api.insertRecurringTx(rows); toast(`บันทึกรายการประจำให้อัตโนมัติ ${rows.length} รายการ`); return true; }
  catch (e) { console.warn(e); return false; }
  finally { recurBusy = false; }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && state.family) reload(); });

/* ---------- auth ---------- */
function setAuthMode(mode) {
  state.authMode = mode; const reg = mode === "register";
  $("btnAuth").textContent = reg ? "สมัครใช้งาน" : "เข้าสู่ระบบ";
  $("btnAuthToggle").textContent = reg ? "มีบัญชีแล้ว? เข้าสู่ระบบ" : "ยังไม่มีบัญชี? สมัครใช้งาน";
  $("authPass").autocomplete = reg ? "new-password" : "current-password"; $("authErr").textContent = "";
}
$("btnAuthToggle").onclick = () => setAuthMode(state.authMode === "login" ? "register" : "login");
$("formAuth").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("authEmail").value.trim(), pass = $("authPass").value;
  if (!/^\S+@\S+\.\S+$/.test(email)) return ($("authErr").textContent = "กรอกอีเมลให้ถูกรูปแบบ");
  if (pass.length < 6) return ($("authErr").textContent = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
  const btn = $("btnAuth"); btn.disabled = true; $("authErr").textContent = "";
  try { state.user = state.authMode === "register" ? await api.signUp(email, pass) : await api.signIn(email, pass); await route(); }
  catch (err) { $("authErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};
async function logout() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  await api.signOut();
  Object.assign(state, { user: null, family: null, me: null, members: [], salMember: null });
  $("authPass").value = ""; setAuthMode("login"); setTab("overview"); show("viewAuth");
}
document.addEventListener("click", (e) => { if (e.target.closest("[data-action='logout']")) logout(); });

async function onboard(kind) {
  const name = $("obName").value.trim(); $("obErr").textContent = "";
  if (!name) { $("obErr").textContent = "ใส่ชื่อที่ให้คนในบ้านเห็นก่อน"; $("obName").focus(); return; }
  const btn = kind === "create" ? $("btnCreateFamily") : $("btnJoinFamily");
  try {
    btn.disabled = true;
    if (kind === "create") { const fam = $("obFamily").value.trim(); if (!fam) { $("obErr").textContent = "ตั้งชื่อบ้านก่อน"; return; } await api.createFamily(fam, name); }
    else { const code = $("obCode").value.trim(); if (code.length < 6) { $("obErr").textContent = "ใส่รหัสเชิญให้ครบ"; return; } await api.joinFamily(code, name); }
    await route();
  } catch (err) { $("obErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
}
$("btnCreateFamily").onclick = () => onboard("create");
$("btnJoinFamily").onclick = () => onboard("join");

/* =========================================================
   RENDER
   ========================================================= */
function applyFeatures() {
  const navOk = { list: feat("io"), salary: feat("salary"), personal: feat("personal") };
  document.querySelectorAll(".nav [data-tab]").forEach(b => b.classList.toggle("hidden", navOk[b.dataset.tab] === false));
  if (navOk[state.tab] === false) state.tab = "overview";
  $("secOt").classList.toggle("hidden", !feat("salary"));
  $("secMemberIncome").classList.toggle("hidden", !feat("salary"));
  $("secDebts").classList.toggle("hidden", !feat("loans") && !feat("advances") && !feat("savings"));
  document.querySelector('[data-io-view="save"]').classList.toggle("hidden", !feat("savings"));
  if (state.ioView === "save" && !feat("savings")) state.ioView = "flow";
  $("ioViews").classList.toggle("hidden", !feat("loans") && !feat("advances") && !feat("savings"));
  $("secHeat").classList.toggle("hidden", !feat("heatmap"));
  $("secCatBud").classList.toggle("hidden", !feat("cat_budgets"));
  $("setRecurring").classList.toggle("hidden", !feat("recurring"));
  document.querySelector('[data-io-view="loan"]').classList.toggle("hidden", !feat("loans"));
  document.querySelector('[data-io-view="adv"]').classList.toggle("hidden", !feat("advances"));
  if ((state.ioView === "loan" && !feat("loans")) || (state.ioView === "adv" && !feat("advances"))) state.ioView = "flow";
  document.querySelector('#formTx [data-type="loan"]').classList.toggle("hidden", !feat("loans") || !can("loans"));
  document.querySelector('#formTx [data-type="advance"]').classList.toggle("hidden", !feat("advances") || !can("loans"));
  $("shiftRow").classList.toggle("hidden", !feat("shift"));
  $("psShift").closest(".field").classList.toggle("hidden", !feat("shift"));
}
function renderAll() {
  if (!state.family) return;
  applyFeatures();
  [["overview", "tabOverview"], ["list", "tabList"], ["salary", "tabSalary"], ["personal", "tabPersonal"], ["settings", "tabSettings"]].forEach(([k, id]) => $(id).classList.toggle("hidden", k !== state.tab));
  document.querySelectorAll(".nav [data-tab]").forEach(b => b.dataset.tab === state.tab ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  $("txtFamily").textContent = state.family.name;
  $("txtMe").textContent = `${state.me.display_name}${isOwner() ? " · เจ้าของบ้าน" : ""}`;
  paintAvatar($("famAvatar"), state.family.avatar_url, initial(state.family.name.replace(/^บ้าน\s*/, "") || "บ้าน"), "linear-gradient(150deg,var(--hero-1),var(--hero-2))");
  $("txtPeriod").textContent = periodLabel();
  const noNav = effPeriod() === "all";
  $("btnPrev").disabled = noNav; $("btnNext").disabled = noNav; $("inJump").disabled = noNav;
  $("inJump").value = ymd(state.anchor);
  document.querySelector(".month").classList.toggle("hidden", state.tab === "settings");
  $("periodBar").classList.toggle("hidden", state.tab !== "overview");
  document.querySelectorAll("[data-io-period]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ioPeriod === state.ioPeriod));
  document.querySelectorAll("[data-period]").forEach(b => b.setAttribute("aria-pressed", b.dataset.period === state.period));
  document.querySelectorAll("[data-io-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ioView === state.ioView));
  // วาดเฉพาะแท็บที่เปิดอยู่ ให้แอปเร็วขึ้น
  if (state.tab === "overview") renderDashboard(computeSummary());
  else if (state.tab === "list") renderIO();
  else if (state.tab === "salary") renderSalary();
  else if (state.tab === "personal") renderPersonal();
  else if (state.tab === "settings") { renderHome(); renderRecurringList(); renderInstall(); openSettings(true); }
}

function renderDashboard(S) {
  const P = state.period, a = state.anchor;
  $("dashLabel").textContent = P === "month" ? `คงเหลือ ${monthLabel(a)}` : P === "year" ? `คงเหลือทั้งปี ${a.getFullYear() + 543}` : "คงเหลือทั้งหมด";
  $("dashBalance").textContent = signed(Math.round(S.balance));
  $("dashDonut").innerHTML = donutSVG(S.income, S.expense, { onHero: true, label: P === "month" ? "คงเหลือเดือนนี้" : P === "year" ? "คงเหลือทั้งปี" : "คงเหลือทั้งหมด" });
  $("dashIncome").textContent = bahtR(S.income);
  $("dashExpense").textContent = bahtR(S.expense);
  // เทียบกับช่วงก่อนหน้า
  let prev = null, prevName = "";
  if (P === "month") { prev = monthFlow(addMonths(monthStart(a), -1)); prevName = "เดือนก่อน"; }
  else if (P === "year") { prev = yearFlow(a.getFullYear() - 1); prevName = "ปีที่แล้ว"; }
  if (prev && (prev.income || prev.expense)) {
    const d = S.balance - prev.balance, pct = prev.balance ? Math.round(d / Math.abs(prev.balance) * 100) : null;
    $("dashGrowth").innerHTML = `<span class="${d >= 0 ? "up" : "down"}">${d >= 0 ? "▲" : "▼"} ${bahtR(Math.abs(d))}${pct !== null ? ` (${d >= 0 ? "+" : "−"}${Math.abs(pct)}%)` : ""}</span><span style="opacity:.8;font-weight:500">เทียบ${prevName} (${signed(Math.round(prev.balance))})</span>`;
  } else $("dashGrowth").innerHTML = `<span style="opacity:.8;font-weight:500">${P === "all" ? `ตั้งแต่ ${monthLabel(S.start)}` : `ยังไม่มีข้อมูล${prevName}ให้เทียบ`}</span>`;

  $("kOther").textContent = bahtR(S.income);
  $("kShared").textContent = bahtR(S.shared);
  $("kSharedSub").textContent = "จากปุ่ม +";
  $("kPersonal").textContent = bahtR(S.personal);

  renderCompare();
  renderCarry();
  renderBillPays();
  renderKidsOverview();
  renderOt(S);
  renderMemberIncome(S);
  renderCategories(S);
  renderDebtSummary();
  renderPersonalByMember(S);
  renderBudgetAlerts();
  const recent = [...S.txs].sort(newest("tx_date")).slice(0, 5);
  $("recentList").innerHTML = ledgerHTML(recent, false) || `<div class="empty">ยังไม่มีรายการในช่วงนี้<br>กดปุ่ม + เพื่อบันทึก</div>`;
}
// กราฟเทียบรายรับ–รายจ่าย และเงินเหลือที่โตขึ้น/ลดลง
function compareBuckets() {
  const P = state.period, a = state.anchor, t0 = today0(), out = [], de = dataBounds().end, lastM = monthStart(de > t0 ? de : t0);
  if (P === "month") { for (let i = 11; i >= 0; i--) { const M = addMonths(monthStart(a), -i); out.push({ label: monthShort(M), name: monthLabel(M), f: monthFlow(M), cur: i === 0 }); } }
  else if (P === "year") { for (let m = 0; m < 12; m++) { const M = new Date(a.getFullYear(), m, 1); if (M > lastM && a.getFullYear() >= t0.getFullYear()) break; out.push({ label: monthShort(M), name: monthLabel(M), f: monthFlow(M), cur: false }); } }
  else { const b = dataBounds(); for (let y = b.start.getFullYear(); y <= t0.getFullYear(); y++) out.push({ label: String(y + 543), name: `ปี ${y + 543}`, f: yearFlow(y), cur: y === t0.getFullYear() }); }
  return out;
}
function renderCompare() {
  const P = state.period, B = compareBuckets(), hi = B.findIndex(b => b.cur);
  $("cmpTitle").textContent = P === "all" ? "รายรับ–รายจ่าย แต่ละปี" : "รายรับ–รายจ่าย แต่ละเดือน";
  $("cmpSub").textContent = P === "month" ? "12 เดือนล่าสุด" : P === "year" ? `ปี ${state.anchor.getFullYear() + 543}` : "ทุกปี";
  barChart($("chartCmp"), $("tipCmp"), {
    labels: B.map(b => b.label), stacked: false, hi: hi >= 0 ? hi : null, initialTip: B.length - 1 - (P === "month" ? 0 : 0),
    series: [{ color: "var(--income)", values: B.map(b => b.f.income) }, { color: "var(--expense)", values: B.map(b => b.f.expense) }],
    tip: (i) => { const b = B[i]; return `<b>${esc(b.name)}</b><span>รับ <b class="num">${bahtR(b.f.income)}</b></span><span>จ่าย <b class="num">${bahtR(b.f.expense)}</b></span><span style="color:${b.f.balance >= 0 ? "var(--income)" : "var(--expense)"}">${b.f.balance >= 0 ? "เหลือ" : "ติดลบ"} ${bahtR(Math.abs(b.f.balance))}</span>`; }
  });
  // เงินเหลือแต่ละช่วง + เทียบช่วงก่อน
  $("growTitle").textContent = P === "all" ? "เงินเหลือแต่ละปี โตขึ้นหรือลดลง" : "เงินเหลือแต่ละเดือน โตขึ้นหรือลดลง";
  const last = B[B.length - 1], before = B[B.length - 2];
  let curB = last, prevB = before, curName = "", prevName = "";
  if (P === "month") { curB = B[B.length - 1]; prevB = B[B.length - 2]; curName = monthLabel(state.anchor); prevName = "เดือนก่อน"; }
  else if (P === "year") { const y = state.anchor.getFullYear(); curB = { f: yearFlow(y) }; prevB = { f: yearFlow(y - 1) }; curName = `ปี ${y + 543}`; prevName = `ปี ${y + 542}`; }
  else { curName = last?.name || ""; prevName = before?.name || "ปีก่อน"; }
  if (curB && prevB) {
    const d = curB.f.balance - prevB.f.balance;
    $("growCmp").innerHTML = `<div><span>${esc(curName)}</span><b class="num">${signed(Math.round(curB.f.balance))}</b></div><div><span>${esc(prevName)}</span><b class="num">${signed(Math.round(prevB.f.balance))}</b></div>
      <div><span>${d >= 0 ? "โตขึ้น" : "ลดลง"}</span><b class="num" style="color:${d >= 0 ? "var(--income)" : "var(--expense)"}">${d >= 0 ? "▲" : "▼"} ${bahtR(Math.abs(d))}</b></div>`;
  } else $("growCmp").innerHTML = "";
  $("growSub").textContent = "แท่งเขียว = เหลือ · แดง = ติดลบ";
  divChart($("chartGrow"), $("tipGrow"), {
    labels: B.map(b => b.label), values: B.map(b => Math.round(b.f.balance)), hi: hi >= 0 ? hi : null,
    tip: (i) => { const b = B[i], p = B[i - 1]; const d = p ? b.f.balance - p.f.balance : null;
      return `<b>${esc(b.name)}</b><span>${b.f.balance >= 0 ? "เหลือ" : "ติดลบ"} <b class="num">${bahtR(Math.abs(b.f.balance))}</b></span>${d !== null ? `<span style="color:${d >= 0 ? "var(--income)" : "var(--expense)"}">${d >= 0 ? "▲ โตขึ้น" : "▼ ลดลง"} ${bahtR(Math.abs(d))} จากช่วงก่อน</span>` : ""}`; }
  });
}
const catBudFor = (mStr) => IDX.catbud.find(b => String(b.effective_month).slice(0, 10) <= mStr) || null;
function catBudStatus(M) {
  const b = catBudFor(ymd(M)); if (!b) return { b: null, rows: [] };
  const s0 = ymd(M), e0 = ymd(new Date(M.getFullYear(), M.getMonth() + 1, 0)), spent = {};
  state.data.txs.filter(t => t.type === "expense" && countable(t) && t.tx_date >= s0 && t.tx_date <= e0).forEach(t => spent[t.category] = (spent[t.category] || 0) + +t.amount);
  const rows = (b.items || []).filter(x => +x.amount > 0).map(x => ({ cat: x.category, budget: +x.amount, spent: spent[x.category] || 0 })).map(r => ({ ...r, pct: r.spent / r.budget }));
  return { b, rows: rows.sort((x, y) => y.pct - x.pct) };
}
function renderBudgetAlerts() {
  const box = $("budAlerts");
  if (!feat("cat_budgets") || state.period !== "month") { box.innerHTML = ""; return; }
  const { rows } = catBudStatus(monthStart(state.anchor));
  box.innerHTML = rows.filter(r => r.pct >= 0.8).slice(0, 3).map(r => `<div class="alert ${r.pct >= 1 ? "over" : "warn"}" role="button" tabindex="0" data-goto="list">
    <span>${catIcon("expense", r.cat)} <b>${esc(r.cat)}</b> ${r.pct >= 1 ? "ใช้เกินงบแล้ว" : "ใกล้ครบงบ"}</span><b class="num">${Math.round(r.pct * 100)}% · ${bahtR(r.spent)}/${bahtR(r.budget)}</b></div>`).join("");
}
function renderCatBudgets() {
  const M = monthStart(state.anchor), { b, rows } = catBudStatus(M);
  const from = b && String(b.effective_month).slice(0, 10) !== ymd(M) ? parseYmd(b.effective_month) : null;
  $("btnCatBud").classList.toggle("hidden", !can("bills"));
  $("catBudInfo").textContent = `${monthLabel(M)}${from ? ` · ใช้งบจาก ${monthLabel(from)}` : b ? " · ตั้งงบเดือนนี้" : ""}`;
  $("catBudList").innerHTML = rows.length ? rows.map(r => { const c = r.pct >= 1 ? "var(--expense)" : r.pct >= .8 ? "var(--shift)" : "var(--income)";
    return `<div class="budrow"><div class="wf-top"><b>${catIcon("expense", r.cat)} ${esc(r.cat)}</b><span class="num"><b style="color:${c}">${bahtR(r.spent)}</b> / ${bahtR(r.budget)}</span></div>
      <div class="track"><i style="width:${Math.min(100, r.pct * 100).toFixed(1)}%;background:${c}"></i></div>
      <div class="wf-sub"><span>${Math.round(r.pct * 100)}%</span><span class="num">${r.spent <= r.budget ? `เหลือ ${bahtR(r.budget - r.spent)}` : `เกิน ${bahtR(r.spent - r.budget)}`}</span></div></div>`; }).join("")
    : `<div class="empty">ยังไม่ได้ตั้งงบรายหมวด${can("bills") ? `<br><button class="btn btn-soft btn-sm" type="button" onclick="openCatBud()" style="margin-top:10px">ตั้งงบรายหมวด</button>` : ""}</div>`;
}
function openCatBud() {
  const M = monthStart(state.anchor), b = catBudFor(ymd(M)), cur = {}; (b?.items || []).forEach(x => cur[x.category] = x.amount);
  $("cbTitle").textContent = `งบรายหมวด · ${monthLabel(M)}`;
  $("cbHint").textContent = `ใช้ตั้งแต่ ${monthLabel(M)} เป็นต้นไป เดือนที่ไม่ได้ตั้งจะใช้ของเดือนก่อน · เว้นว่าง = ไม่ตั้งงบหมวดนั้น · ระบบเตือนเมื่อใช้ถึง 80%`;
  $("cbList").innerHTML = CATEGORIES.expense.map(([c, e]) => `<div class="perm-row" style="padding:8px 0"><b>${e} ${esc(c)}</b>
    <input class="input num" style="max-width:130px" type="number" inputmode="decimal" min="0" step="1" data-cb="${esc(c)}" value="${cur[c] || ""}" placeholder="—" aria-label="งบ ${esc(c)}"></div>`).join("");
  cbTotal(); $("cbErr").textContent = ""; openSheet("sheetCatBud");
}
const cbTotal = () => $("cbTotal").textContent = bahtR([...document.querySelectorAll("[data-cb]")].reduce((a, i) => a + (+i.value || 0), 0));
$("cbList").addEventListener("input", cbTotal);
$("btnCatBud").onclick = openCatBud;
$("formCatBud").onsubmit = async (e) => {
  e.preventDefault();
  const items = [...document.querySelectorAll("[data-cb]")].filter(i => +i.value > 0).map(i => ({ category: i.dataset.cb, amount: round2(i.value) }));
  const btn = $("cbSave"); btn.disabled = true;
  try { await api.saveCatBudget({ family_id: state.family.id, effective_month: ymd(monthStart(state.anchor)), items }); closeSheet("sheetCatBud"); toast("บันทึกงบรายหมวดแล้ว"); await reload(); }
  catch (err) { $("cbErr").textContent = friendlyError(err); } finally { btn.disabled = false; }
};
function renderPersonalByMember(S) {
  const B = compareBuckets(), hi = B.findIndex(b => b.cur);
  // ยอดใช้ส่วนตัวต่อคนต่อช่วง (จากรายจ่าย "ส่วนตัว" ที่บันทึกด้วยปุ่ม +)
  const val = (b, mid) => {
    let s0, e0;
    if (state.period === "all") { const y = +b.label - 543; s0 = `${y}-01-01`; e0 = `${y}-12-31`; }
    else { const M = b.f.start; s0 = ymd(M); e0 = ymd(new Date(M.getFullYear(), M.getMonth() + 1, 0)); }
    return memo(`pm|${mid}|${s0}|${e0}`, () => state.data.txs.filter(t => t.type === "expense" && t.scope === "personal" && t.member_id === mid && countable(t) && t.tx_date >= s0 && t.tx_date <= e0).reduce((a, t) => a + +t.amount, 0));
  };
  const series = adults().map(m => ({ name: m.display_name, color: avColor(memberIdx(m.id)), values: B.map(b => val(b, m.id)) }));
  const perNow = {}; S.txs.filter(t => t.type === "expense" && t.scope === "personal").forEach(t => perNow[t.member_id] = (perNow[t.member_id] || 0) + +t.amount);
  $("pmLegend").innerHTML = adults().map(m => `<span><i style="background:${avColor(memberIdx(m.id))}"></i>${esc(m.display_name)} <b class="num">${bahtR(perNow[m.id] || 0)}</b></span>`).join("");
  $("pmSub").textContent = state.period === "all" ? "รายปี" : "รายเดือน · ตัวเลขคือช่วงที่เลือก";
  barChart($("chartPM"), $("tipPM"), { labels: B.map(b => b.label), series, stacked: false, hi: hi >= 0 ? hi : null, initialTip: hi >= 0 ? hi : B.length - 1, emptyText: "ยังไม่มีรายจ่ายส่วนตัว",
    tip: (i) => `<b>${esc(B[i].name)}</b>` + series.map(x => `<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${x.color}"></i> ${esc(x.name)} <b class="num">${bahtR(x.values[i])}</b></span>`).join("") });
}
function bucketsOt(S) {
  const out = [];
  if (state.period === "month") eachDay(S.start, S.end, d => out.push({ kind: "day", d, label: String(d.getDate()) }));
  else eachMonth(S.start, S.calcEnd, M => out.push({ kind: "month", d: M, label: state.period === "year" ? monthShort(M) : monthShort(M) + String(M.getFullYear() + 543).slice(2) }));
  return out;
}
function renderOt(S) {
  const B = bucketsOt(S);
  const fmtH = (h) => h.toLocaleString("th-TH", { maximumFractionDigits: 1 });
  const legend = (hours) => { $("otLegend").innerHTML = adults().map((m, i) => `<span><i style="background:${avColor(memberIdx(m.id))}"></i>${esc(m.display_name)} <b class="num">${fmtH(hours[i])} ชม.</b></span>`).join("");
    $("otSub").textContent = `รวม ${fmtH(hours.reduce((a, b) => a + b, 0))} ชม. ในช่วงนี้`; };
  if (!B.length) { // มุมมองวัน
    legend(adults().map(m => { const r = dayRec(m.id, S.start); return r ? dayOtHours(r) : 0; }));
    const rows = adults().map(m => { const r = dayRec(m.id, S.start), e = dailyEarn(m.id, S.start);
      return `<div class="hbar"><div class="top"><b>${avatarHTML(m)}${esc(m.display_name)}</b><span class="num">${r ? dayOtHours(r) : 0} ชม. · ${bahtR(e.ot)}</span></div>
      <div class="sub">${r ? statusOf(r.status)[1] + (r.has_shift ? " · มีค่ากะ" : "") : "ยังไม่ได้บันทึกวันนี้"}</div></div>`; }).join("");
    $("chartOt").innerHTML = `<div class="hbars">${rows}</div>`; $("tipOt").innerHTML = ""; return;
  }
  const series = adults().map(m => ({ name: m.display_name, color: avColor(memberIdx(m.id)), values: B.map(b => {
    if (b.kind === "day") { const r = dayRec(m.id, b.d); return r ? dayOtHours(r) : 0; }
    let h = 0; eachDay(b.d, new Date(b.d.getFullYear(), b.d.getMonth() + 1, 0), d => { const r = dayRec(m.id, d); if (r) h += dayOtHours(r); }); return h;
  }) }));
  legend(series.map(s => s.values.reduce((a, b) => a + b, 0)));
  barChart($("chartOt"), $("tipOt"), {
    labels: B.map(b => b.label), series, stacked: true, fmt: (v) => shortNum(v) + "ช", emptyText: "ยังไม่มี OT ในช่วงนี้",
    tip: (i) => { const b = B[i]; const name = b.kind === "day" ? dayLabel(ymd(b.d)) : monthLabel(b.d);
      return `<b>${esc(name)}</b>` + series.map(s => `<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.color}"></i> ${esc(s.name)} <b class="num">${s.values[i]} ชม.</b></span>`).join(""); }
  });
}
// รายได้ทั้งหมด/รายจ่ายทั้งหมดของแต่ละคน: รวมเงินเดือน (ก่อนหัก) และรายการหักจากเงินเดือน
function memberMoney(mid, S) {
  const r = { gross: 0, deduct: 0, recIn: 0, recOut: 0, hasPay: false, actual: false };
  if (feat("salary")) eachMonth(S.start, S.calcEnd || S.end, M => {
    const p = payFor(mid, M); if (!p) return;
    r.hasPay = true;
    const gross = p.base + p.otTotal + p.shiftPay + p.incSum + p.dailyIncSum;
    r.gross += gross; r.deduct += p.actual !== null ? gross - p.actual : p.dedSum + p.unpaidDeduct;
    if (p.actual !== null) r.actual = true;
  });
  S.txs.filter(t => t.member_id === mid && t.scope !== "shared").forEach(t => {
    if (t.type === "income") { if (!(r.hasPay && SALARY_CATS.has(t.category))) r.recIn += +t.amount; }
    else r.recOut += +t.amount;
  });
  return { ...r, inc: r.gross + r.recIn, out: r.deduct + r.recOut };
}
function renderMemberIncome(S) {
  const rows = adults().map(m => ({ m, x: memberMoney(m.id, S) }));
  const max = Math.max(1, ...rows.map(r => Math.max(r.x.inc, r.x.out)));
  const seg = (v, c) => v > 0 ? `<i style="width:${(v / max * 100).toFixed(2)}%;background:${c}"></i>` : "";
  $("memberIncome").innerHTML = rows.map(({ m, x }) => { const net = x.inc - x.out;
    return `<div class="hbar"><div class="top"><b>${avatarHTML(m)}${esc(m.display_name)}</b><span class="num" style="font-weight:800;color:${net >= 0 ? "var(--income)" : "var(--expense)"}">เหลือ ${signed(Math.round(net))}</span></div>
      <div class="wf-sub" style="margin:0 0 3px"><span>รายได้ทั้งหมด</span><b class="num" style="color:var(--income)">${bahtR(x.inc)}</b></div>
      <div class="track">${seg(x.gross, "var(--income)")}${seg(x.recIn, "#8456C4")}</div>
      <div class="wf-sub" style="margin:8px 0 3px"><span>รายจ่ายทั้งหมด</span><b class="num" style="color:var(--expense)">${bahtR(x.out)}</b></div>
      <div class="track">${seg(x.deduct, "#E0620F")}${seg(x.recOut, "var(--expense)")}</div>
      <div class="sub num">${x.hasPay ? `เงินเดือนก่อนหัก ${bahtR(x.gross)} · หักในสลิป ${bahtR(x.deduct)}${x.actual ? " (ตามสลิปจริง)" : ""} · ` : ""}รายรับอื่น ${bahtR(x.recIn)} · ใช้ส่วนตัว ${bahtR(x.recOut)}</div></div>`; }).join("")
    + (S.sharedIncome ? `<div class="hbar"><div class="top"><b>🏠 รายรับของบ้าน</b><span class="num" style="font-weight:700">${bahtR(S.sharedIncome)}</span></div></div>` : "");
}
function renderCategories(S) {
  const entries = Object.entries(S.cats);
  entries.sort((a, b) => b[1] - a[1]);
  if (!entries.length) { $("catBox").innerHTML = `<div class="empty">ยังไม่มีรายจ่ายในช่วงนี้</div>`; $("txtTopCat").textContent = ""; return; }
  const sum = entries.reduce((a, e) => a + e[1], 0); let acc = 0;
  const color = (c, i) => c === "รายจ่ายหลัก" ? "var(--bill)" : CAT_COLORS[i % CAT_COLORS.length];
  const stops = entries.map(([c, v], i) => { const s = acc; acc += v / sum * 100; return `${color(c, i)} ${s.toFixed(2)}% ${acc.toFixed(2)}%`; }).join(",");
  $("txtTopCat").textContent = `มากสุด: ${entries[0][0]}`;
  $("catBox").innerHTML = `<div class="donut-wrap">
    <div class="donut" style="background:conic-gradient(${stops})" role="img" aria-label="สัดส่วนรายจ่ายตามหมวด"><div class="donut-center"><div>รวม<b class="num">${bahtR(sum)}</b></div></div></div>
    <div class="legend">${entries.slice(0, 7).map(([c, v], i) => `<div><i style="background:${color(c, i)}"></i><span>${c === "รายจ่ายหลัก" ? "📌" : catIcon("expense", c)} ${esc(c)}</span><b class="num">${Math.round(v / sum * 100)}%</b></div>`).join("")}
    ${entries.length > 7 ? `<div class="muted" style="font-size:13px">และอีก ${entries.length - 7} หมวด</div>` : ""}</div></div>`;
}

function ledgerHTML(list, groupByDay = true) {
  if (!list.length) return "";
  let html = "", lastDay = "";
  list.forEach(t => {
    if (groupByDay && t.tx_date !== lastDay) { html += `<div class="ledger-day">${esc(dayLabel(t.tx_date))}</div>`; lastDay = t.tx_date; }
    const isInc = t.type === "income", shared = t.scope === "shared";
    const ci = CATEGORIES.expense.findIndex(c => c[0] === t.category);
    const color = isInc ? "var(--income)" : CAT_COLORS[(ci + 10) % 10];
    const canDelete = t.created_by === state.user.id || can("tx_all"), canEdit = canDelete;
    const whoTxt = shared ? `<span class="tag-shared">${isInc ? "ของบ้าน" : "ใช้ร่วมกัน"}</span>` : esc(memberName(t.member_id));
    const meta = [whoTxt, !groupByDay ? esc(dayLabel(t.tx_date)) : ""].filter(Boolean).join(" · ");
    html += `<div class="row${canEdit ? " tap" : ""}" ${canEdit ? `data-edit-tx="${esc(t.id)}" role="button" tabindex="0" aria-label="แก้ไข ${esc(t.note || t.category)}"` : ""}>
      <div class="cat-ic" style="background:color-mix(in srgb,${color} 15%,var(--surface))" aria-hidden="true">${catIcon(t.type, t.category)}${t.recurring_id ? `<span style="position:absolute;right:-5px;bottom:-5px;font-size:11px">🔁</span>` : ""}</div>
      <div class="what"><b>${esc(t.note || t.category)}</b><span>${t.note ? esc(t.category) + " · " : ""}${meta}</span></div>
      <div class="amt num ${isInc ? "in" : ""}">${isInc ? "+" : "−"}${baht(t.amount)}</div>
      ${canDelete ? `<button class="del" type="button" data-del="${esc(t.id)}" aria-label="ลบรายการ">×</button>` : "<span></span>"}
    </div>`;
  });
  return html;
}
function ioBuckets(P, r) {
  const B = [];
  if (P === "month") eachDay(r.start, r.end, d => B.push({ key: ymd(d), label: String(d.getDate()), name: dayLabel(ymd(d)), end: ymd(d) }));
  else eachMonth(r.start, r.end, M => B.push({ key: ymd(M).slice(0, 7), label: P === "year" ? monthShort(M) : monthShort(M) + String(M.getFullYear() + 543).slice(2), name: monthLabel(M), end: ymd(new Date(M.getFullYear(), M.getMonth() + 1, 0)) }));
  return B;
}
function renderMonthStrip() {
  const P = state.ioPeriod, el = $("mstrip");
  el.classList.toggle("hidden", P === "all" || state.ioView === "save" || state.ioView === "adv");
  if (P === "all") return;
  const b = dataBounds(), t0 = today0(), a = state.anchor; let html = "";
  if (P === "month") {
    let start = addMonths(monthStart(t0), -23); if (b.start > start) start = monthStart(b.start);
    if (monthStart(a) < start) start = monthStart(a);
    for (let M = start; M <= addMonths(monthStart(t0), 1); M = addMonths(M, 1))
      html += `<button type="button" data-jump="${ymd(M)}" aria-pressed="${+M === +monthStart(a)}">${monthShort(M)} ${String(M.getFullYear() + 543).slice(2)}</button>`;
  } else for (let y = Math.min(b.start.getFullYear(), a.getFullYear()); y <= t0.getFullYear() + 1; y++)
    html += `<button type="button" data-jump="${y}-01-01" aria-pressed="${y === a.getFullYear()}">ปี ${y + 543}</button>`;
  el.innerHTML = html;
  const cur = el.querySelector('[aria-pressed="true"]'); if (cur) el.scrollLeft = cur.offsetLeft - el.clientWidth / 2 + cur.offsetWidth / 2;
}
document.addEventListener("click", (e) => { const j = e.target.closest("[data-jump]"); if (j) { state.anchor = parseYmd(j.dataset.jump); renderAll(); } });
document.querySelectorAll("[data-io-view]").forEach(b => b.onclick = () => { state.ioView = b.dataset.ioView; renderAll(); });
function renderIO() {
  renderMonthStrip();
  ["flow", "loan", "adv", "save"].forEach(v => $({ flow: "ioFlow", loan: "ioLoan", adv: "ioAdv", save: "ioSave" }[v]).classList.toggle("hidden", state.ioView !== v));
  const noPeriod = state.ioView === "save" || state.ioView === "adv";
  $("ioPeriodBar").classList.toggle("hidden", noPeriod); $("mstrip").classList.toggle("hidden", noPeriod || state.ioPeriod === "all");
  if (state.ioView === "save") return renderSavings();
  if (state.ioView === "loan") return renderLoans();
  if (state.ioView === "adv") return renderAdvances();
  const P = state.ioPeriod, r = periodRange(P), s0 = ymd(r.start), e0 = ymd(r.end);
  const txs = state.data.txs.filter(t => countable(t) && t.tx_date >= s0 && t.tx_date <= e0);
  let inc = 0, out = 0; const ec = {}, ic = {}, who = {}; let sharedOut = 0;
  txs.forEach(t => { const a = +t.amount;
    if (t.type === "income") { inc += a; ic[t.category] = (ic[t.category] || 0) + a; }
    else { out += a; ec[t.category] = (ec[t.category] || 0) + a; if (t.scope === "shared") sharedOut += a; else who[t.member_id] = (who[t.member_id] || 0) + a; } });
  $("ioIn").textContent = bahtR(inc); $("ioOut").textContent = bahtR(out);
  $("ioNet").textContent = signed(Math.round(inc - out)); $("ioNet").style.color = inc - out < 0 ? "var(--expense)" : "";
  $("ioDonut").innerHTML = donutSVG(inc, out, { size: 160 }); $("ioDIn").textContent = bahtR(inc); $("ioDOut").textContent = bahtR(out);
  $("ioDPct").textContent = inc ? Math.round(out / inc * 100) + "%" : "—";
  const lns = (state.data.debts || []).filter(d => d.kind === "loan" && d.tx_date >= s0 && d.tx_date <= e0);
  const lin = lns.filter(d => d.action === "borrow").reduce((a, d) => a + +d.amount, 0), lout = lns.filter(d => d.action === "repay").reduce((a, d) => a + +d.amount, 0);
  $("ioLoanNote").classList.toggle("hidden", !feat("loans") || (!lin && !lout));
  $("ioLoanNote").innerHTML = `🏦 รวมเงินกู้ช่วงนี้: กู้เข้า <b class="num" style="color:var(--shift)">+${bahtR(lin)}</b> · คืน <b class="num" style="color:var(--bill)">−${bahtR(lout)}</b> → เงินคงเหลือหลังรวมกู้ยืม <b class="num">${signed(Math.round(inc - out + lin - lout))}</b>`;

  // กราฟ: มุมมองเดือน = รายวัน · ปี/ทั้งหมด = รายเดือน
  const B = ioBuckets(P, r);
  const kl = P === "month" ? 10 : 7, bi = {}, bo = {};
  txs.forEach(t => { const k = t.tx_date.slice(0, kl); if (t.type === "income") bi[k] = (bi[k] || 0) + +t.amount; else bo[k] = (bo[k] || 0) + +t.amount; });
  $("ioChartTitle").textContent = P === "month" ? "รายรับ–รายจ่าย รายวัน" : "รายรับ–รายจ่าย รายเดือน";
  $("ioChartSub").textContent = P === "month" ? monthLabel(state.anchor) : P === "year" ? periodLabel() : "ทั้งหมด";
  barChart($("chartIO"), $("tipIO"), {
    labels: B.map(b => b.label), stacked: false, emptyText: "ยังไม่มีรายการในช่วงนี้",
    series: [{ color: "var(--income)", values: B.map(b => bi[b.key] || 0) }, { color: "var(--expense)", values: B.map(b => bo[b.key] || 0) }],
    tip: (i) => { const b = B[i], a = bi[b.key] || 0, o = bo[b.key] || 0;
      return `<b>${esc(b.name)}</b><span>รับ <b class="num">${bahtR(a)}</b></span><span>จ่าย <b class="num">${bahtR(o)}</b></span><span style="color:${a - o >= 0 ? "var(--income)" : "var(--expense)"}">${a - o >= 0 ? "เหลือ" : "ขาด"} ${bahtR(Math.abs(a - o))}</span>`; }
  });
  const catBars = (obj, type, total, color) => { const e = Object.entries(obj).sort((a, b) => b[1] - a[1]); if (!e.length) return `<div class="empty">ไม่มีรายการ</div>`;
    const max = e[0][1]; return e.map(([c, v], i) => `<div class="hbar"><div class="top"><b>${catIcon(type, c)} ${esc(c)}</b><span class="num" style="font-weight:700">${bahtR(v)} <small class="muted">${Math.round(v / total * 100)}%</small></span></div>
      <div class="track"><i style="width:${(v / max * 100).toFixed(1)}%;background:${color(c, i)}"></i></div></div>`).join(""); };
  $("ioExpCats").innerHTML = catBars(ec, "expense", out || 1, (c, i) => CAT_COLORS[i % CAT_COLORS.length]);
  $("ioIncCats").innerHTML = catBars(ic, "income", inc || 1, (c) => c === SAVE_CAT ? "var(--bill)" : "var(--income)");
  $("ioExpSub").textContent = bahtR(out); $("ioIncSub").textContent = bahtR(inc);
  const wRows = state.members.map(m => ({ html: `${avatarHTML(m)}${esc(m.display_name)}`, v: who[m.id] || 0 })).concat([{ html: "🏠 ใช้ร่วมกัน", v: sharedOut }]);
  const wMax = Math.max(1, ...wRows.map(w => w.v));
  $("ioWho").innerHTML = wRows.map(w => `<div class="hbar"><div class="top"><b>${w.html}</b><span class="num" style="font-weight:700">${bahtR(w.v)}</span></div>
    <div class="track"><i style="width:${(w.v / wMax * 100).toFixed(1)}%;background:var(--expense)"></i></div></div>`).join("");
  if (feat("heatmap")) renderHeat(P, r, txs);
  if (feat("cat_budgets")) { $("secCatBud").classList.toggle("hidden", P !== "month"); if (P === "month") renderCatBudgets(); }
  renderList({ txs });
}
/* ---------- บัญชี: บัญชีรายรับรายจ่าย (หลัก) + บัญชีเงินเก็บ ----------
   ยอดบัญชีรายรับรายจ่าย = รายรับ − รายจ่ายจากปุ่ม + ทั้งหมด ± ฝาก/ถอน/ให้ยืมที่ระบุบัญชีนี้
   ยอดบัญชีเงินเก็บ = ฝาก − ถอน − ให้ยืมออกไป + ได้คืน */
const MAIN = "main";
const acctKey = (id) => id || MAIN;
const acctList = () => [{ id: MAIN, name: "บัญชีรายรับรายจ่าย", emoji: "💼", main: true }, ...(state.data.accounts || []).filter(a => !a.archived)];
const acctName = (id) => acctList().find(a => a.id === acctKey(id))?.name || "บัญชีที่ลบไปแล้ว";
const moveSign = (k) => k === "deposit" || k === "loan_in" ? 1 : -1;
function acctBalance(id) {
  return memo("acct|" + id, () => {
    let b = (state.data.moves || []).filter(m => acctKey(m.account_id) === id).reduce((a, m) => a + moveSign(m.kind) * +m.amount, 0);
    if (id === MAIN) b += state.data.txs.filter(countable).reduce((a, t) => a + (t.type === "income" ? +t.amount : -t.amount), 0);
    return round2(b);
  });
}
// ใครยืมเงินจากบัญชีนี้อยู่บ้าง (ยังคืนไม่ครบ)
function acctLent(id) {
  const by = {};
  (state.data.moves || []).filter(m => acctKey(m.account_id) === id && m.debt_id && (m.kind === "loan_out" || m.kind === "loan_in")).forEach(m => {
    const d = (state.data.debts || []).find(x => x.id === m.debt_id); if (!d) return;
    const who = debtWho(d); by[who] = (by[who] || 0) + (m.kind === "loan_out" ? +m.amount : -m.amount);
  });
  return Object.entries(by).filter(([, v]) => v > 0.004).map(([who, amt]) => ({ who, amt: round2(amt) }));
}
function goalSaved(g) {
  if (g.account_id && acctList().some(a => a.id === g.account_id)) return acctBalance(g.account_id);
  return (state.data.contribs || []).filter(c => c.goal_id === g.id).reduce((a, c) => a + +c.amount, 0);
}
let openAcct = null;
function renderSavings() {
  const accts = acctList(), main = acctBalance(MAIN), save = accts.filter(a => !a.main).reduce((x, a) => x + acctBalance(a.id), 0);
  const lentTot = accts.reduce((x, a) => x + acctLent(a.id).reduce((y, l) => y + l.amt, 0), 0);
  $("svTotal").textContent = signed(Math.round(main + save));
  $("svMain").textContent = signed(Math.round(main)); $("svSave").textContent = signed(Math.round(save));
  $("svPill").textContent = lentTot > 0 ? `มีคนยืมอยู่ ${bahtR(lentTot)}` : `${accts.length} บัญชี`;
  $("svSub").textContent = lentTot > 0 ? `ถ้าได้เงินคืนครบ จะมีรวม ${bahtR(main + save + lentTot)}` : "";
  $("btnSvLend").classList.toggle("hidden", !feat("loans") || !can("loans"));
  $("acctList").innerHTML = accts.map(a => { const bal = acctBalance(a.id), lent = acctLent(a.id), lentSum = lent.reduce((x, l) => x + l.amt, 0);
    const mv = (state.data.moves || []).filter(m => acctKey(m.account_id) === a.id).sort(newest("move_date")).slice(0, 12);
    const label = { deposit: "ฝาก", withdraw: "ถอน", loan_out: "ให้ยืม", loan_in: "ได้คืน" };
    return `<div class="acct${lentSum > 0 ? " lent" : ""}"><div class="acct-h" role="button" tabindex="0" data-acct-open="${esc(a.id)}" style="cursor:pointer">
      <div class="goal-e" aria-hidden="true">${esc(a.emoji)}</div><div style="flex:1;min-width:0"><b>${esc(a.name)}${lentSum > 0 ? `<span class="lent-tag">มีคนยืม</span>` : ""}</b>
      <small>${a.main ? "รายรับ − รายจ่ายจากปุ่ม + ทั้งหมด" : "บัญชีเงินเก็บ"}</small></div>
      <div class="acct-bal"><b class="num" style="color:${bal < 0 ? "var(--expense)" : "var(--ink)"}">${signed(Math.round(bal))}</b></div></div>
      ${lentSum > 0 ? `<div class="lent-box"><b>ยังไม่ได้คืน ${baht(lentSum)}</b>${lent.map(l => `<div><span>👤 ${esc(l.who)}</span><b class="num">${baht(l.amt)}</b></div>`).join("")}</div>` : ""}
      <div class="goal-actions"><button class="btn btn-primary btn-sm" type="button" data-acct-dep="${esc(a.id)}">ฝาก</button><button class="btn btn-ghost btn-sm" type="button" data-acct-wd="${esc(a.id)}">ถอน</button>
        ${a.main ? "" : `<button class="btn btn-ghost btn-sm" type="button" data-acct-edit="${esc(a.id)}">แก้ไข</button>`}</div>
      ${openAcct === a.id ? `<div class="moves">${mv.length ? mv.map(m => `<div class="mv"><div><b>${label[m.kind]}</b> ${esc(m.note || "")}<small>${esc(dayLabel(String(m.move_date).slice(0, 10)))}${m.slip_path ? ` · <a href="#" data-mv-slip="${esc(m.id)}">🧾 ดูสลิป</a>` : ""}</small></div>
        <div style="text-align:right"><b class="num" style="color:${moveSign(m.kind) > 0 ? "var(--income)" : "var(--expense)"}">${moveSign(m.kind) > 0 ? "+" : "−"}${baht(m.amount)}</b>
        ${!m.debt_id && (m.created_by === state.user.id || can("tx_all")) ? `<br><button class="linkbtn" type="button" style="font-size:12px;padding:0;color:var(--muted)" data-mv-del="${esc(m.id)}">ลบ</button>` : ""}</div></div>`).join("") : `<div class="muted" style="padding:6px 0">ยังไม่มีรายการฝาก/ถอน${a.main ? " (ยอดหลักมาจากหน้ารับ–จ่าย)" : ""}</div>`}</div>` : ""}</div>`; }).join("");
  const shared = (state.data.paccts || []).filter(a => a.shared);
  $("secSharedPersonal").classList.toggle("hidden", !shared.length || !feat("personal"));
  $("sharedPaList").innerHTML = shared.map(a => paCard(a, false)).join("");
  // เป้าหมาย
  const goals = state.data.goals || [], t0 = today0();
  $("goalList").innerHTML = goals.map(g => { const saved = goalSaved(g), pct = Math.max(0, Math.min(100, saved / g.target * 100)), left = Math.max(0, g.target - saved);
    let plan = "";
    if (g.deadline && left > 0) { const dl = parseYmd(g.deadline), m = (dl.getFullYear() - t0.getFullYear()) * 12 + dl.getMonth() - t0.getMonth() + (dl.getDate() >= t0.getDate() ? 1 : 0);
      plan = m > 0 ? `ต้องออมเดือนละ ${bahtR(left / m)} อีก ${m} เดือน` : "เลยกำหนดแล้ว"; }
    const linked = g.account_id && acctList().some(a => a.id === g.account_id);
    return `<div class="goal"><div class="goal-h"><div class="goal-e" aria-hidden="true">${esc(g.emoji || "🎯")}</div>
      <div style="flex:1;min-width:0"><b>${esc(g.name)}</b><small>${linked ? `เก็บใน ${esc(acctName(g.account_id))}` : "ยังไม่ได้ผูกบัญชี"} · ${g.deadline ? `ภายใน ${shortDate(parseYmd(g.deadline))} ${parseYmd(g.deadline).getFullYear() + 543}` : "ไม่กำหนดเวลา"}</small></div>
      <div style="text-align:right"><b class="num" style="font-size:17px">${Math.round(pct)}%</b></div></div>
      <div class="track"><i style="width:${pct.toFixed(1)}%;background:${pct >= 100 ? "var(--income)" : "var(--bill)"}"></i></div>
      <div class="wf-sub"><span class="num">มีแล้ว ${baht(saved)} / ${baht(g.target)}</span><span>${left > 0 ? `อีก ${bahtR(left)}${plan ? " · " + plan : ""}` : "ถึงเป้าแล้ว 🎉"}</span></div>
      <div class="goal-actions">${linked ? `<button class="btn btn-primary btn-sm" type="button" data-acct-dep="${esc(g.account_id)}">+ ฝากเข้าบัญชีนี้</button>`
        : `<button class="btn btn-primary btn-sm" type="button" data-goal-in="${esc(g.id)}">+ ออมเข้า</button><button class="btn btn-ghost btn-sm" type="button" data-goal-out="${esc(g.id)}">ดึงออก</button>`}
        <button class="btn btn-ghost btn-sm" type="button" data-goal-edit="${esc(g.id)}">แก้ไข</button></div></div>`; }).join("")
    || `<div class="card empty">ยังไม่มีเป้าหมาย<br><button class="btn btn-soft btn-sm" type="button" style="margin-top:10px" onclick="openGoal()">+ ตั้งเป้าหมายแรก</button></div>`;
}
document.addEventListener("click", async (e) => {
  const o = e.target.closest("[data-acct-open]"); if (o) { openAcct = openAcct === o.dataset.acctOpen ? null : o.dataset.acctOpen; renderSavings(); }
  const dp = e.target.closest("[data-acct-dep]"); if (dp) openMoney({ kind: "deposit", account: dp.dataset.acctDep });
  const wd = e.target.closest("[data-acct-wd]"); if (wd) openMoney({ kind: "withdraw", account: wd.dataset.acctWd });
  const ed = e.target.closest("[data-acct-edit]"); if (ed) openAcctSheet(ed.dataset.acctEdit);
  const sl = e.target.closest("[data-mv-slip]"); if (sl) { e.preventDefault(); const m = state.data.moves.find(x => x.id === sl.dataset.mvSlip); if (m) openSlip(m.slip_path, state.me.id, parseYmd(m.move_date)); }
  const dl = e.target.closest("[data-mv-del]"); if (dl) { if (!confirm("ลบรายการนี้?")) return; try { await api.deleteMove(dl.dataset.mvDel); toast("ลบแล้ว"); await reload(); } catch (err) { toast(friendlyError(err)); } }
});
// ฝาก/ถอน
let mnMode = null;
function openMoney(o = {}) {
  mnMode = { kind: o.kind || "deposit", goal: o.goal || null, dir: o.dir || "in", personal: !!o.personal, depositM: o.depositM || null };
  const isGoal = !!o.goal;
  $("mnKind").classList.toggle("hidden", isGoal); $("mnAcctField").classList.toggle("hidden", isGoal); $("mnSlipRow").classList.toggle("hidden", isGoal);
  $("mnDir").classList.toggle("hidden", !isGoal);
  document.querySelectorAll("[data-mn-dir]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mnDir === mnMode.dir));
  $("mnAcct").innerHTML = mnMode.personal ? myPAccts().map(a => `<option value="${esc(a.id)}">${esc(a.emoji)} ${esc(a.name)} (${bahtR(paBalance(a.id))})</option>`).join("")
    : acctList().map(a => `<option value="${esc(a.id)}">${esc(a.emoji)} ${esc(a.name)} (${bahtR(acctBalance(a.id))})</option>`).join("");
  $("mnAcct").value = mnMode.personal ? o.personal : (o.account || ((state.data.accounts || []).find(a => !a.archived)?.id || MAIN));
  const dep = !!mnMode.depositM;
  $("mnAcctPickWrap").classList.toggle("hidden", !dep); if (dep) { $("mnKind").classList.add("hidden"); $("mnAcctField").classList.add("hidden"); $("mnAcct").value = MAIN; }
  if (isGoal) { const g = (state.data.goals || []).find(x => x.id === o.goal);
    $("mnTitle").textContent = `${g?.emoji || "🎯"} ${g?.name || "เป้าหมาย"}`; $("mnHint").textContent = `ออมแล้ว ${bahtR(goalSaved(g))} จาก ${bahtR(g?.target || 0)} · แนะนำให้ผูกเป้าหมายกับบัญชีเงินเก็บ`; }
  else $("mnTitle").textContent = o.title || "ฝาก / ถอน";
  $("mnAmount").value = o.amount || ""; $("mnNote").value = o.note || ""; $("mnDate").value = o.date || ymd(today0()); $("mnErr").textContent = "";
  $("mnSlip").value = ""; $("mnSlipLbl").textContent = "📷 แนบสลิป (ถ้ามี)";
  paintMoney(); openSheet("sheetMoney"); setTimeout(() => $("mnAmount").focus(), 60);
}
function paintMoney() {
  if (mnMode.goal) return;
  document.querySelectorAll("[data-mn-kind]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mnKind === mnMode.kind));
  if (mnMode.personal) { $("mnHint").textContent = `บัญชีส่วนตัว · ยอดตอนนี้ ${baht(paBalance($("mnAcct").value))}`; return; }
  const id = $("mnAcct").value, main = id === MAIN, bal = acctBalance(id);
  if (mnMode.depositM) $("mnAcctPick").innerHTML = acctList().map(a => `<button type="button" data-mn-pick="${esc(a.id)}" aria-pressed="${a.id === id}"><span class="e">${esc(a.emoji)}</span><b>${esc(a.name)}</b><small class="num">${signed(acctBalance(a.id))}</small></button>`).join("");
  if (mnMode.depositM && mnMode.kind === "deposit") { const inM = $("mnDate").value ? monthLabel(parseYmd($("mnDate").value)) : ""; $("mnHint").textContent = `นับเป็นรายรับของ ${inM} (เงินเดือนออกสิ้นเดือน ใช้เดือนถัดไป) · ` + `บันทึกเป็นรายรับหมวด “${SAVE_CAT}” ในหน้ารับ–จ่าย${main ? "" : ` แล้วโอนเข้า ${acctName(id)}`} · พร้อมบันทึกรายจ่ายหลักของรอบนี้ · ลบรายการนี้ในหน้ารับ–จ่าย รายจ่ายประจำของรอบนี้จะหายตาม`; return; }
  $("mnHint").textContent = main
    ? (mnMode.kind === "deposit" ? `ฝากเข้าบัญชีรายรับรายจ่าย จะบันทึกเป็นรายรับหมวด “${SAVE_CAT}” ในหน้ารับ–จ่าย` : "ถอนจากบัญชีรายรับรายจ่าย (ไม่นับเป็นรายจ่าย)") + ` · ยอดตอนนี้ ${baht(bal)}`
    : `ยอดในบัญชีตอนนี้ ${baht(bal)}`;
}
document.querySelectorAll("[data-mn-kind]").forEach(b => b.onclick = () => { mnMode.kind = b.dataset.mnKind; paintMoney(); });
$("mnAcct").addEventListener("change", paintMoney);
$("mnDate").addEventListener("change", () => mnMode && !mnMode.goal && paintMoney());
$("mnAcctPick").addEventListener("click", (e) => { const b = e.target.closest("[data-mn-pick]"); if (b) { $("mnAcct").value = b.dataset.mnPick; paintMoney(); } });
$("mnSlip").addEventListener("change", () => { $("mnSlipLbl").textContent = $("mnSlip").files[0] ? "📷 แนบแล้ว ✓ (แตะเพื่อเปลี่ยน)" : "📷 แนบสลิป (ถ้ามี)"; });
document.querySelectorAll("[data-mn-dir]").forEach(b => b.onclick = () => { mnMode.dir = b.dataset.mnDir; document.querySelectorAll("[data-mn-dir]").forEach(x => x.setAttribute("aria-pressed", x === b)); });
$("formMoney").onsubmit = async (e) => {
  e.preventDefault();
  const amount = round2($("mnAmount").value); if (!(amount > 0)) { $("mnErr").textContent = "ใส่จำนวนเงินมากกว่า 0"; return; }
  const btn = $("mnSave"); btn.disabled = true;
  try {
    if (mnMode.goal) await api.addContrib({ family_id: state.family.id, goal_id: mnMode.goal, amount: mnMode.dir === "out" ? -amount : amount, note: $("mnNote").value.trim(), contrib_date: $("mnDate").value });
    else {
      const id = $("mnAcct").value, note = $("mnNote").value.trim();
      let slip_path = null;
      if ($("mnSlip").files[0]) slip_path = await api.uploadSlip(`${state.family.id}/${state.me.id}/acct-${Date.now()}.jpg`, await slipBlob($("mnSlip").files[0]));
      if (mnMode.depositM && mnMode.kind === "deposit") {
        // ฝากเงินคงเหลือ: ลงเป็นรายรับหมวด "เงินฝากจากเงินเหลือ" ในหน้ารับ–จ่ายเสมอ
        // ถ้าเลือกบัญชีเงินเก็บ → โอนจากบัญชีรายรับรายจ่ายเข้าบัญชีนั้นต่อ (ยอดไม่นับซ้ำ)
        const dn = depositNote(mnMode.depositM);
        await api.addTx({ family_id: state.family.id, member_id: state.me.id, type: "income", scope: "shared", amount, category: SAVE_CAT, note: dn, tx_date: $("mnDate").value });
        if (id !== MAIN) await api.addMoves([
          { family_id: state.family.id, account_id: null, kind: "withdraw", amount, note: dn, move_date: $("mnDate").value, slip_path: null, debt_id: null },
          { family_id: state.family.id, account_id: id, kind: "deposit", amount, note: dn, move_date: $("mnDate").value, slip_path, debt_id: null }]);
      }
      else if (mnMode.personal) await api.addPMove({ family_id: state.family.id, account_id: id, kind: mnMode.kind, amount, note, move_date: $("mnDate").value, slip_path });
      else if (id === MAIN && mnMode.kind === "deposit") await api.addTx({ family_id: state.family.id, member_id: state.me.id, type: "income", scope: "shared", amount, category: SAVE_CAT, note: note || "ฝากเงิน", tx_date: $("mnDate").value });
      else await api.addMoves([{ family_id: state.family.id, account_id: id === MAIN ? null : id, kind: mnMode.kind, amount, note, move_date: $("mnDate").value, slip_path, debt_id: null }]);
      // ฝากเงินคงเหลือ: บันทึกรายจ่ายหลัก + รายการหักในสลิปของรอบนี้ไว้ดูด้วย
      if (mnMode.depositM && mnMode.kind === "deposit") { try { await saveBillPays(mnMode.depositM, true); } catch (er) { console.warn(er); toast("ฝากแล้ว แต่บันทึกรายจ่ายหลักไม่สำเร็จ (ให้รัน schema_phase11.sql)"); } }
    }
    closeSheet("sheetMoney"); toast("บันทึกแล้ว"); await reload();
  } catch (err) { $("mnErr").textContent = friendlyError(err); } finally { btn.disabled = false; }
};
// สร้าง/แก้บัญชีเงินเก็บ
$("acShareRow").addEventListener("click", () => { const sw = $("swShare"); sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") !== "true"); });
const ACCT_EMOJI = ["🔒", "👛", "🏦", "🐷", "💰", "🪙", "💳", "🏠", "🎓", "🛟", "✈️", "👶", "📈", "🧧"];
let acEdit = null, acEmoji = "🏦", acPersonal = false;
function openAcctSheet(id, personal = false) {
  acPersonal = personal;
  acEdit = (personal ? state.data.paccts : state.data.accounts || []).find(a => a.id === id) || null; acEmoji = acEdit?.emoji || (personal ? "🔒" : "🏦");
  $("acShareRow").classList.toggle("hidden", !personal); $("swShare").setAttribute("aria-checked", !!acEdit?.shared);
  $("acTitle").textContent = acEdit ? "แก้ไขบัญชี" : personal ? "เพิ่มบัญชีส่วนตัว" : "เพิ่มบัญชีเงินเก็บ"; $("acName").value = acEdit?.name || ""; $("acOpen").value = "";
  $("acOpenField").classList.toggle("hidden", !!acEdit); $("acDelete").classList.toggle("hidden", !acEdit); $("acErr").textContent = "";
  paintAcEmoji(); openSheet("sheetAcct");
}
const paintAcEmoji = () => $("acEmojis").innerHTML = ACCT_EMOJI.map(e => `<button type="button" data-acemo="${e}" aria-pressed="${e === acEmoji}">${e}</button>`).join("");
$("acEmojis").addEventListener("click", (e) => { const b = e.target.closest("[data-acemo]"); if (b) { acEmoji = b.dataset.acemo; paintAcEmoji(); } });
$("btnNewAcct").onclick = () => openAcctSheet();
$("formAcct").onsubmit = async (e) => {
  e.preventDefault(); const name = $("acName").value.trim(); if (!name) { $("acErr").textContent = "ตั้งชื่อบัญชี"; return; }
  const btn = $("acSave"); btn.disabled = true;
  try {
    const open = round2($("acOpen").value);
    if (acPersonal) {
      const a = await api.savePAcct({ ...(acEdit ? { id: acEdit.id } : { family_id: state.family.id, member_id: state.me.id }), name, emoji: acEmoji, shared: $("swShare").getAttribute("aria-checked") === "true" });
      if (!acEdit && open > 0) await api.addPMove({ family_id: state.family.id, account_id: a.id, kind: "deposit", amount: open, note: "ยอดเริ่มต้น", move_date: ymd(today0()), slip_path: null });
      closeSheet("sheetAcct"); toast("บันทึกบัญชีแล้ว"); await reload(); return;
    }
    const a = await api.saveAcct({ ...(acEdit ? { id: acEdit.id } : { family_id: state.family.id }), name, emoji: acEmoji });
    if (!acEdit && open > 0) await api.addMoves([{ family_id: state.family.id, account_id: a.id, kind: "deposit", amount: open, note: "ยอดเริ่มต้น", move_date: ymd(today0()), slip_path: null, debt_id: null }]);
    closeSheet("sheetAcct"); toast("บันทึกบัญชีแล้ว"); await reload();
  } catch (err) { $("acErr").textContent = friendlyError(err); } finally { btn.disabled = false; }
};
$("acDelete").onclick = async () => { if (!acEdit || !confirm(`ลบบัญชี “${acEdit.name}” และรายการฝาก/ถอนทั้งหมดของบัญชีนี้?`)) return;
  try { if (acPersonal) await api.deletePAcct(acEdit.id); else await api.deleteAcct(acEdit.id); closeSheet("sheetAcct"); await reload(); } catch (err) { $("acErr").textContent = friendlyError(err); } };
$("btnSvDeposit").onclick = () => openMoney({ kind: "deposit" });
$("btnSvLend").onclick = () => openAdd({ type: "loan", loanAction: "borrow" });
// เป้าหมาย
const GOAL_EMOJI = ["🎯", "✈️", "🏠", "🚗", "🎓", "🛟", "💍", "👶", "📱", "🏍️", "🏖️", "💰"];
let glEdit = null, glEmoji = "🎯";
function openGoal(id) {
  glEdit = (state.data.goals || []).find(g => g.id === id) || null; glEmoji = glEdit?.emoji || "🎯";
  $("glTitle").textContent = glEdit ? "แก้ไขเป้าหมาย" : "เป้าหมายใหม่";
  $("glName").value = glEdit?.name || ""; $("glTarget").value = glEdit?.target || ""; $("glDeadline").value = glEdit?.deadline ? String(glEdit.deadline).slice(0, 10) : "";
  $("glAcct").innerHTML = `<option value="">— ยังไม่ผูกบัญชี —</option>` + (state.data.accounts || []).filter(a => !a.archived).map(a => `<option value="${esc(a.id)}">${esc(a.emoji)} ${esc(a.name)} (${bahtR(acctBalance(a.id))})</option>`).join("");
  $("glAcct").value = glEdit?.account_id || ((state.data.accounts || [])[0]?.id || "");
  $("glDelete").classList.toggle("hidden", !glEdit); $("glErr").textContent = "";
  paintEmojis(); openSheet("sheetGoal");
}
const paintEmojis = () => $("glEmojis").innerHTML = GOAL_EMOJI.map(e => `<button type="button" data-emo="${e}" aria-pressed="${e === glEmoji}">${e}</button>`).join("");
$("glEmojis").addEventListener("click", (e) => { const b = e.target.closest("[data-emo]"); if (b) { glEmoji = b.dataset.emo; paintEmojis(); } });
$("formGoal").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("glName").value.trim(), target = round2($("glTarget").value);
  if (!name) { $("glErr").textContent = "ตั้งชื่อเป้าหมาย"; return; } if (!(target > 0)) { $("glErr").textContent = "ใส่ยอดเป้าหมาย"; return; }
  const btn = $("glSave"); btn.disabled = true;
  try { await api.saveGoal({ ...(glEdit ? { id: glEdit.id } : { family_id: state.family.id }), name, target, emoji: glEmoji, deadline: $("glDeadline").value || null, account_id: $("glAcct").value || null });
    closeSheet("sheetGoal"); toast("บันทึกเป้าหมายแล้ว"); await reload(); }
  catch (err) { $("glErr").textContent = friendlyError(err); } finally { btn.disabled = false; }
};
$("glDelete").onclick = async () => { if (!glEdit || !confirm(`ลบเป้าหมาย “${glEdit.name}”? (เงินในบัญชีไม่หาย)`)) return;
  try { await api.deleteGoal(glEdit.id); closeSheet("sheetGoal"); await reload(); } catch (err) { $("glErr").textContent = friendlyError(err); } };
$("btnNewGoal").onclick = () => openGoal();
document.addEventListener("click", (e) => {
  const gi = e.target.closest("[data-goal-in]"); if (gi) openMoney({ goal: gi.dataset.goalIn, dir: "in" });
  const go = e.target.closest("[data-goal-out]"); if (go) openMoney({ goal: go.dataset.goalOut, dir: "out" });
  const ge = e.target.closest("[data-goal-edit]"); if (ge) openGoal(ge.dataset.goalEdit);
});
function renderLoans() {
  const P = state.ioPeriod, r = periodRange(P), s0 = ymd(r.start), e0 = ymd(r.end), all = (state.data.debts || []).filter(d => d.kind === "loan");
  const inP = all.filter(d => d.tx_date >= s0 && d.tx_date <= e0);
  const L = loanBook(all), tot = L.reduce((a, g) => a + Math.max(0, g.left), 0);
  $("lnOutstanding").textContent = baht(tot);
  $("lnPill").textContent = `${L.filter(g => g.left > 0.004).length} คนยังค้างคืน`;
  $("lnBorrow").textContent = "+" + bahtR(inP.filter(d => d.action === "borrow").reduce((a, d) => a + +d.amount, 0));
  $("lnRepay").textContent = "−" + bahtR(inP.filter(d => d.action === "repay").reduce((a, d) => a + +d.amount, 0));
  $("lnCards").innerHTML = L.length ? L.map(g => { const pct = g.borrowed ? Math.min(100, g.repaid / g.borrowed * 100) : 100, m = state.members.find(x => x.id === g.memberId);
    const accLines = Object.entries(g.accts).filter(([, v]) => Math.abs(v) > 0.004).map(([k, v]) => `<div class="dcard-sub" style="margin-top:2px"><span>↳ จาก ${esc(acctName(k === MAIN ? null : k))}</span><span class="num">ค้าง ${baht(v)}</span></div>`).join("");
    return `<div class="dcard${g.left > 0.004 ? "" : ""}" style="${g.left > 0.004 ? "border:2px solid var(--shift)" : ""}"><div class="dcard-h"><span class="pair">${m ? avatarHTML(m) : "👤"} ${esc(g.borrower)}${m ? "" : ` <small class="muted">(คนนอก)</small>`}</span>
      ${g.left > 0.004 ? `<button type="button" class="iconlink" data-repay="${esc(g.key)}|${g.left}">รับเงินคืน</button>` : `<span class="tag ok">คืนครบแล้ว</span>`}</div>
      <div class="track"><i style="width:${pct.toFixed(1)}%;background:var(--bill)"></i></div>
      <div class="dcard-sub"><span class="num">คืนแล้ว ${baht(g.repaid)} จาก ${baht(g.borrowed)} (${Math.round(pct)}%)</span><b class="num" style="color:${g.left > 0 ? "var(--shift)" : "var(--income)"}">ค้าง ${baht(Math.max(0, g.left))}</b></div>
      ${accLines}
      <div class="pairlog">${g.items.slice().sort(newest("tx_date")).slice(0, 4).map(d => `<div><span>${esc(shortDate(parseYmd(d.tx_date)))} ${d.action === "borrow" ? "ยืม" : "คืน"}${d.note ? " · " + esc(d.note) : ""}</span><span class="num">${d.action === "borrow" ? "−" : "+"}${baht(d.amount)}</span></div>`).join("")}</div></div>`; }).join("")
    : `<div class="card empty">ยังไม่มีใครยืมเงิน<br><button class="btn btn-soft btn-sm" type="button" data-new-debt="loan" style="margin-top:10px">+ บันทึกการให้ยืม</button></div>`;
  const B = ioBuckets(P, r), kl = P === "month" ? 10 : 7, bi = {}, bo = {};
  inP.forEach(d => { const k = d.tx_date.slice(0, kl); if (d.action === "borrow") bi[k] = (bi[k] || 0) + +d.amount; else bo[k] = (bo[k] || 0) + +d.amount; });
  $("lnChartSub").textContent = P === "month" ? "รายวัน" : "รายเดือน";
  barChart($("chartLoan"), $("tipLoan"), { labels: B.map(b => b.label), stacked: false, emptyText: "ไม่มีการกู้หรือคืนในช่วงนี้",
    series: [{ color: "var(--shift)", values: B.map(b => bi[b.key] || 0) }, { color: "var(--bill)", values: B.map(b => bo[b.key] || 0) }],
    tip: (i) => `<b>${esc(B[i].name)}</b><span>ให้ยืม <b class="num">${bahtR(bi[B[i].key] || 0)}</b></span><span>ได้คืน <b class="num">${bahtR(bo[B[i].key] || 0)}</b></span>` });
  const bal = B.map(b => all.filter(d => d.tx_date <= b.end).reduce((a, d) => a + (d.action === "borrow" ? +d.amount : -d.amount), 0));
  if (all.length) lineChart($("chartLoanBal"), $("tipLoanBal"), { labels: B.map(b => b.label), series: [{ color: "var(--shift)", values: bal }],
    tip: (i) => `<b>${esc(B[i].name)}</b><span>ค้างคืน <b class="num">${bahtR(bal[i])}</b></span>` });
  else { $("chartLoanBal").innerHTML = `<div class="empty">ยังไม่มีข้อมูล</div>`; $("tipLoanBal").innerHTML = ""; }
  const list = [...inP].sort(newest("tx_date"));
  $("lnList").innerHTML = list.map(debtRow).join("") || `<div class="empty">ไม่มีรายการในช่วงนี้</div>`;
}
function renderAdvances() {
  const all = (state.data.debts || []).filter(d => d.kind === "advance"), inP = all; // ดูได้แบบทั้งหมดอย่างเดียว
  const A = advanceBook(all), tot = A.pairs.reduce((a, p) => a + p.amount, 0);
  $("avOutstanding").textContent = bahtR(tot);
  $("avPill").textContent = `${A.pairs.length} คู่ค้างคืน`;
  $("avPaid").textContent = bahtR(inP.filter(d => d.action === "pay").reduce((a, d) => a + +d.amount, 0));
  $("avSettled").textContent = bahtR(inP.filter(d => d.action === "settle").reduce((a, d) => a + +d.amount, 0));
  $("avPairs").innerHTML = A.pairs.length ? A.pairs.map(p => { const f = state.members.find(m => m.id === p.from), t = state.members.find(m => m.id === p.to);
    return `<div class="dcard"><div class="dcard-h"><span class="pair">${f ? avatarHTML(f) : ""}${esc(memberName(p.from))} <span class="arrow">ต้องคืน</span> ${t ? avatarHTML(t) : ""}${esc(memberName(p.to))}</span>
      <b class="num" style="color:var(--st-personal);font-size:17px">${baht(p.amount)}</b></div>
      <div class="pairlog">${all.filter(d => (d.member_id === p.from && d.other_id === p.to) || (d.member_id === p.to && d.other_id === p.from)).sort(newest("tx_date")).slice(0, 6)
        .map(d => `<div><span>${esc(shortDate(parseYmd(d.tx_date)))} · ${esc(memberName(d.member_id))} ${d.action === "pay" ? "ออกให้" : "คืน"} ${esc(memberName(d.other_id))}${d.note ? " · " + esc(d.note) : ""}</span><span class="num">${baht(d.amount)}</span></div>`).join("")}</div>
      <div class="dcard-sub"><span>${esc(memberName(p.from))} ต้องคืน ${esc(memberName(p.to))} อีก <b class="num">${baht(p.amount)}</b></span><button type="button" class="iconlink" data-settle="${esc(p.from)}|${esc(p.to)}|${p.amount}">บันทึกคืนเงิน</button></div></div>`; }).join("")
    : `<div class="card empty">ไม่มีใครค้างคืนกัน 🎉<br><button class="btn btn-soft btn-sm" type="button" data-new-debt="advance" style="margin-top:10px">+ บันทึกออกให้ก่อน</button></div>`;
  divChart($("chartAdvNet"), $("tipAdvNet"), { labels: state.members.map(m => m.display_name), values: state.members.map(m => round2(A.pos[m.id] || 0)), emptyText: "ทุกคนเคลียร์กันหมดแล้ว",
    tip: (i) => { const m = state.members[i], v = A.pos[m.id] || 0; return `<b>${esc(m.display_name)}</b><span>${v > 0 ? `คนอื่นค้างคืน <b class="num">${bahtR(v)}</b>` : v < 0 ? `ต้องคืนคนอื่น <b class="num">${bahtR(-v)}</b>` : "เคลียร์แล้ว"}</span>`; } });
  // แต่ละคน: ออกให้คนอื่นไปก่อนเท่าไร + คืนคนอื่นไปแล้วเท่าไร (อยู่ในแท่งเดียวกัน พร้อมยอดรวม)
  const paid = state.members.map(m => all.filter(d => d.action === "pay" && d.member_id === m.id).reduce((a, d) => a + +d.amount, 0));
  const back = state.members.map(m => all.filter(d => d.action === "settle" && d.member_id === m.id).reduce((a, d) => a + +d.amount, 0));
  barChart($("chartAdv"), $("tipAdv"), { labels: state.members.map(m => m.display_name), stacked: true, emptyText: "ยังไม่มีรายการ", totalLabels: true,
    series: [{ color: "var(--st-personal)", values: paid }, { color: "var(--income)", values: back }],
    tip: (i) => `<b>${esc(state.members[i].display_name)}</b><span>ออกให้คนอื่นก่อน <b class="num">${baht(paid[i])}</b></span><span>คืนคนอื่นไปแล้ว <b class="num">${baht(back[i])}</b></span><span>รวม <b class="num">${baht(paid[i] + back[i])}</b></span>` });
  $("avList").innerHTML = [...inP].sort(newest("tx_date")).map(debtRow).join("") || `<div class="empty">ไม่มีรายการในช่วงนี้</div>`;
}
function lastAdvanceNote(p) {
  const d = (state.data.debts || []).filter(x => x.kind === "advance" && x.action === "pay" && x.member_id === p.to && x.other_id === p.from).sort(newest("tx_date"))[0];
  return d ? `ล่าสุด: ${d.note || "ออกให้ก่อน"} (${shortDate(parseYmd(d.tx_date))})` : "";
}
function renderHeat(P, r, txs) {
  const box = $("heatBox"), per = {};
  txs.filter(t => t.type === "expense").forEach(t => per[t.tx_date] = (per[t.tx_date] || 0) + +t.amount);
  const vals = Object.values(per).sort((a, b) => a - b), q = (p) => vals.length ? vals[Math.min(vals.length - 1, Math.floor(p * vals.length))] : 0;
  const steps = [q(.25), q(.5), q(.75)], level = (v) => !v ? 0 : v <= steps[0] ? 1 : v <= steps[1] ? 2 : v <= steps[2] ? 3 : 4;
  const shade = (l) => l ? `color-mix(in srgb,var(--expense) ${[0, 22, 42, 66, 92][l]}%,var(--surface-2))` : "var(--surface-2)";
  const tStr = ymd(today0());
  $("secHeat").classList.toggle("hidden", P === "all");
  if (P === "all") return;
  const scale = `<div class="heat-scale">น้อย ${[0, 1, 2, 3, 4].map(l => `<i style="background:${shade(l)}"></i>`).join("")} มาก</div>`;
  if (P === "month") {
    $("heatTitle").textContent = "ปฏิทินการใช้จ่าย";
    let h = WD.map(w => `<div class="hd">${w}</div>`).join("");
    for (let i = 0; i < r.start.getDay(); i++) h += "<div></div>";
    eachDay(r.start, r.end, d => { const k = ymd(d), v = per[k] || 0, l = level(v);
      h += `<button type="button" class="hc${k === tStr ? " today" : ""}" data-heat="${k}" style="background:${shade(l)};${l >= 3 ? "color:#fff" : ""}" aria-label="${esc(dayLabel(k))} ใช้ ${bahtR(v)}">${d.getDate()}${v ? `<small class="num">${shortNum(v)}</small>` : ""}</button>`; });
    box.innerHTML = `<div class="heat">${h}</div>${scale}`;
  } else {
    $("heatTitle").textContent = "ปฏิทินการใช้จ่ายทั้งปี";
    const start = addDays(r.start, -r.start.getDay()), cs = 13, gap = 3, cols = Math.ceil(daysBetween(start, r.end) / 7);
    const W = 26 + cols * (cs + gap), H = 18 + 7 * (cs + gap);
    let g = "", lastM = -1;
    for (let c = 0; c < cols; c++) for (let w = 0; w < 7; w++) {
      const d = addDays(start, c * 7 + w); if (d < r.start || d > r.end) continue;
      const k = ymd(d), v = per[k] || 0;
      if (w === 0 || d.getDate() === 1) { if (d.getMonth() !== lastM && d.getDate() <= 7) { lastM = d.getMonth(); g += `<text x="${26 + c * (cs + gap)}" y="11" font-size="10" fill="var(--muted)">${monthShort(d)}</text>`; } }
      g += `<rect class="hit" data-heat="${k}" x="${26 + c * (cs + gap)}" y="${18 + w * (cs + gap)}" width="${cs}" height="${cs}" rx="3" style="fill:${shade(level(v))}${k === tStr ? ";stroke:var(--brand);stroke-width:1.5" : ""}"><title>${dayLabel(k)} ${bahtR(v)}</title></rect>`;
    }
    ["จ", "พ", "ศ"].forEach((t, i) => g += `<text x="0" y="${18 + (i * 2 + 1) * (cs + gap) + 10}" font-size="9.5" fill="var(--muted)">${t}</text>`);
    box.innerHTML = `<div class="yheat"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg></div>${scale}`;
  }
  const show = (k) => { const items = txs.filter(t => t.type === "expense" && t.tx_date === k).sort((a, b) => b.amount - a.amount);
    $("heatTip").innerHTML = `<b>${esc(dayLabel(k))}</b><span>ใช้ <b class="num">${bahtR(per[k] || 0)}</b></span>` + items.slice(0, 3).map(t => `<span>${catIcon("expense", t.category)} ${esc(t.note || t.category)} ${bahtR(t.amount)}</span>`).join(""); };
  box.querySelectorAll("[data-heat]").forEach(el => { el.addEventListener("click", () => openDayDetail(el.dataset.heat)); el.addEventListener("mouseenter", () => show(el.dataset.heat)); });
  $("heatTip").innerHTML = "<span>แตะวันเพื่อดูว่าวันนั้นใช้จ่ายอะไรบ้าง</span>";
}
function renderList(S) {
  const f = state.filter, q = ($("ioSearch").value || "").trim().toLowerCase(), wf = $("ioWhoFilter").value || "all";
  const wsel = $("ioWhoFilter"), wcur = wsel.value;
  wsel.innerHTML = `<option value="all">ทุกคน</option>` + state.members.map(m => `<option value="${esc(m.id)}">${esc(m.display_name)}</option>`).join("") + `<option value="shared">ใช้ร่วมกัน/ของบ้าน</option>`;
  wsel.value = [...wsel.options].some(o => o.value === wcur) ? wcur : "all";
  const list = [...S.txs].filter(t => f === "all" || (f === "shared" ? t.scope === "shared" : t.type === f))
    .filter(t => wf === "all" || (wf === "shared" ? t.scope === "shared" : t.scope !== "shared" && t.member_id === wf))
    .filter(t => !q || [t.note, t.category, memberName(t.member_id), String(t.amount), String(Math.round(t.amount))].some(x => String(x || "").toLowerCase().includes(q)))
    .sort(newest("tx_date"));
  const shown = list.slice(0, 400), sumIn = list.filter(t => t.type === "income").reduce((a, t) => a + +t.amount, 0), sumOut = list.filter(t => t.type === "expense").reduce((a, t) => a + +t.amount, 0);
  $("listCount").textContent = `${list.length} รายการ${sumOut ? ` · จ่าย ${bahtR(sumOut)}` : ""}${sumIn ? ` · รับ ${bahtR(sumIn)}` : ""}`;
  $("fullList").innerHTML = (ledgerHTML(shown) || `<div class="empty">ไม่มีรายการตามที่เลือกในช่วงนี้</div>`)
    + (list.length > shown.length ? `<div class="empty">แสดง ${shown.length} จาก ${list.length} รายการ เลือกช่วงเวลาให้แคบลงเพื่อดูเพิ่ม</div>` : "");
}
$("ioSearch").addEventListener("input", () => { clearTimeout($("ioSearch")._t); $("ioSearch")._t = setTimeout(renderIO, 200); });
$("ioWhoFilter").addEventListener("change", renderIO);
document.querySelectorAll("[data-filter]").forEach(b => b.onclick = () => {
  state.filter = b.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b));
  renderIO();
});
document.querySelectorAll("[data-period]").forEach(b => b.onclick = () => { state.period = b.dataset.period; renderAll(); });
$("btnPrev").onclick = () => shiftAnchor(-1);
(() => { // ปัดซ้าย/ขวาที่ช่องวันที่ เพื่อเลื่อนเดือนเร็ว ๆ
  const el = document.querySelector(".month"); let x0 = null, y0 = null;
  el.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener("touchend", (e) => {
    if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); shiftAnchor(dx < 0 ? 1 : -1); }
  });
})();
$("inJump").addEventListener("click", (e) => { try { e.target.showPicker(); } catch (_) {} });
$("inJump").addEventListener("change", () => { if ($("inJump").value) { state.anchor = parseYmd($("inJump").value); renderAll(); } });
document.querySelectorAll("[data-io-period]").forEach(b => b.onclick = () => { state.ioPeriod = b.dataset.ioPeriod; renderAll(); });
$("btnNext").onclick = () => shiftAnchor(1);

/* =========================================================
   กู้ยืม / ออกให้ก่อน
   ========================================================= */
const debtWho = (d) => d.member_id ? memberName(d.member_id) : (d.member_name || "ไม่ระบุ");
const debtOther = (d) => d.other_id ? memberName(d.other_id) : d.other_name;
// การให้ยืม: จัดกลุ่มตามคนกู้ (คนในบ้านหรือคนนอก) และแยกยอดค้างตามบัญชีที่ให้ยืมออกไป
const borrowerKey = (d) => d.member_id ? "m:" + d.member_id : "n:" + (d.member_name || "ไม่ระบุ");
function loanBook(list = state.data.debts || []) {
  const groups = {};
  list.filter(d => d.kind === "loan").forEach(d => {
    const key = borrowerKey(d);
    const g = groups[key] ||= { key, borrower: debtWho(d), memberId: d.member_id || null, borrowed: 0, repaid: 0, accts: {}, items: [] };
    if (d.action === "borrow") g.borrowed += +d.amount; else g.repaid += +d.amount;
    g.items.push(d);
    (state.data.moves || []).filter(m => m.debt_id === d.id).forEach(m => { const k = acctKey(m.account_id); g.accts[k] = (g.accts[k] || 0) + (m.kind === "loan_out" ? +m.amount : -m.amount); });
  });
  return Object.values(groups).map(g => ({ ...g, left: round2(g.borrowed - g.repaid) })).sort((a, b) => b.left - a.left);
}
function advanceBook(list = state.data.debts || []) {
  const owe = {}; // owe["A|B"] = A ต้องคืน B
  list.filter(d => d.kind === "advance" && d.member_id && d.other_id).forEach(d => {
    if (d.action === "pay") { const k = d.other_id + "|" + d.member_id; owe[k] = (owe[k] || 0) + +d.amount; }
    else { const k = d.member_id + "|" + d.other_id; owe[k] = (owe[k] || 0) - +d.amount; }
  });
  const pairs = [], seen = new Set();
  Object.keys(owe).forEach(k => {
    const [a, b] = k.split("|"), pk = [a, b].sort().join("|"); if (seen.has(pk)) return; seen.add(pk);
    const net = round2((owe[a + "|" + b] || 0) - (owe[b + "|" + a] || 0));
    if (Math.abs(net) > 0.004) pairs.push(net > 0 ? { from: a, to: b, amount: net } : { from: b, to: a, amount: -net });
  });
  const pos = {}; state.members.forEach(m => pos[m.id] = 0);
  pairs.forEach(p => { if (p.to in pos) pos[p.to] += p.amount; if (p.from in pos) pos[p.from] -= p.amount; });
  return { pairs: pairs.sort((x, y) => y.amount - x.amount), pos };
}
function renderDebtSummary() {
  let html = "";
  if (feat("savings")) {
    const goals = state.data.goals || [], accts = acctList().map(a => ({ a, bal: acctBalance(a.id), lent: acctLent(a.id).reduce((x, l) => x + l.amt, 0) }))
      .sort((x, y) => y.bal - x.bal), sv = accts.reduce((x, r) => x + r.bal, 0), pos = accts.reduce((x, r) => x + Math.max(0, r.bal), 0);
    const SV_COLORS = ["#2F7FC1", "#16805F", "#D08A1E", "#8456C4", "#1F9A8E", "#C2612D", "#C23A4A", "#5E8C3A", "#9C6B4E", "#7B8794"];
    let acc = 0; const stops = accts.filter(r => r.bal > 0).map((r, i) => { const s0 = acc; acc += r.bal / pos * 100; return `${SV_COLORS[accts.indexOf(r) % SV_COLORS.length]} ${s0.toFixed(2)}% ${acc.toFixed(2)}%`; }).join(",");
    const shared = feat("personal") ? (state.data.paccts || []).filter(a => a.shared) : [];
    html += `<div class="dcard" role="button" tabindex="0" data-goto-io="save"><div class="dcard-h"><b>🎯 เงินในบัญชีรวม</b><span class="muted" style="font-size:12.5px">${accts.length} บัญชี · รวมบัญชีรายรับรายจ่าย</span></div>
      ${accts.length ? `<div class="donut-wrap sv-donut">
        <div class="donut" style="background:${pos > 0 ? `conic-gradient(${stops})` : "var(--surface-2)"}" role="img" aria-label="สัดส่วนเงินในแต่ละบัญชีเงินเก็บ"><div class="donut-center"><div>รวม<b class="num">${signed(Math.round(sv))}</b></div></div></div>
        <div class="legend">${accts.map((r, i) => `<div><i style="background:${SV_COLORS[i % SV_COLORS.length]}"></i><span>${esc(r.a.emoji)} ${esc(r.a.name)}${r.lent > 0 ? ` <span class="lent-tag">มีคนยืม</span>` : ""}</span><b class="num">${pos > 0 && r.bal > 0 ? Math.round(r.bal / pos * 100) : 0}%</b></div>`).join("")}</div></div>
      <div class="sv-rows">${accts.map((r, i) => `<div class="dcard-sub"><span><i class="sv-dot" style="background:${SV_COLORS[i % SV_COLORS.length]}"></i>${esc(r.a.emoji)} ${esc(r.a.name)}${r.a.main ? ` <small class="muted">(รายรับ − รายจ่าย)</small>` : ""}</span><span class="num"><b style="color:${r.bal < 0 ? "var(--expense)" : "var(--ink)"}">${signed(round2(r.bal))}</b>${r.lent > 0 ? ` <small class="muted">(ให้ยืมอยู่ ${bahtR(r.lent)})</small>` : ""}</span></div>`).join("")}
        <div class="dcard-sub sv-total"><span>รวมทุกบัญชี</span><b class="num" style="color:var(--bill)">${signed(round2(sv))}</b></div></div>`
      : `<div class="dcard-sub"><span>ยังไม่มีบัญชีเงินเก็บ</span></div>`}
      ${goals.slice(0, 3).map(g => { const p = Math.max(0, Math.min(100, goalSaved(g) / g.target * 100)); return `<div class="dcard-sub"><span>${esc(g.emoji)} ${esc(g.name)}</span><span class="num">${Math.round(p)}%</span></div><div class="track" style="height:6px;margin-top:4px"><i style="width:${p.toFixed(1)}%;background:var(--bill)"></i></div>`; }).join("")}
      ${shared.length ? `<div class="sv-shared"><div class="subhead">👀 บัญชีส่วนตัวที่แชร์ให้ดู <small class="muted">(ไม่นับรวมยอดบ้าน)</small></div>
        ${shared.map(a => { const o = state.members.find(m => m.id === a.member_id); return `<div class="dcard-sub"><span>${o ? avatarHTML(o) : ""}${esc(a.emoji || "🔒")} ${esc(a.name)} <small class="muted">· ${esc(o?.display_name || "สมาชิก")}</small></span><b class="num">${signed(round2(paBalance(a.id)))}</b></div>`; }).join("")}
        <div class="dcard-sub sv-total"><span>รวมที่แชร์</span><b class="num">${signed(round2(shared.reduce((x, a) => x + paBalance(a.id), 0)))}</b></div></div>` : ""}</div>`;
  }
  if (feat("loans")) {
    const L = loanBook(), tot = L.reduce((a, g) => a + Math.max(0, g.left), 0), open = L.filter(g => g.left > 0.004);
    html += `<div class="dcard" role="button" tabindex="0" data-goto-io="loan"><div class="dcard-h"><b>🏦 มีคนยืมอยู่ ค้างคืน</b><b class="num" style="color:${tot ? "var(--shift)" : "var(--income)"}">${bahtR(tot)}</b></div>
      ${open.slice(0, 3).map(g => `<div class="dcard-sub"><span>👤 ${esc(g.borrower)}</span><span class="num">ค้าง ${bahtR(g.left)} / ${bahtR(g.borrowed)}</span></div>
        <div class="track" style="height:6px;margin-top:4px"><i style="width:${Math.min(100, g.repaid / g.borrowed * 100).toFixed(1)}%;background:var(--bill)"></i></div>`).join("") || `<div class="dcard-sub"><span>ไม่มีใครค้างคืน 🎉</span></div>`}</div>`;
  }
  if (feat("advances")) {
    const A = advanceBook(), tot = A.pairs.reduce((a, p) => a + p.amount, 0);
    html += `<div class="dcard" role="button" tabindex="0" data-goto-io="adv"><div class="dcard-h"><b>🤝 ออกให้ก่อน ค้างคืน</b><b class="num" style="color:${tot ? "var(--st-personal)" : "var(--income)"}">${bahtR(tot)}</b></div>
      ${A.pairs.slice(0, 3).map(p => `<div class="dcard-sub"><span>${esc(memberName(p.from))} → ${esc(memberName(p.to))}</span><span class="num">${bahtR(p.amount)}</span></div>`).join("") || `<div class="dcard-sub"><span>ไม่มีใครค้างคืนกัน</span></div>`}</div>`;
  }
  $("debtSummary").innerHTML = html;
}
document.addEventListener("click", (e) => { const g = e.target.closest("[data-goto-io]"); if (g) { state.ioView = g.dataset.gotoIo; setTab("list"); } });
const debtRow = (d) => {
  const loan = d.kind === "loan", inbound = d.action === "borrow" || d.action === "pay";
  const icon = loan ? (d.action === "borrow" ? "🏦" : "↩️") : (d.action === "pay" ? "🤝" : "↩️");
  const accts = loan ? (state.data.moves || []).filter(m => m.debt_id === d.id).map(m => `${acctName(m.account_id)} ${bahtR(m.amount)}`).join(", ") || d.other_name : "";
  const title = loan ? (d.action === "borrow" ? `${debtWho(d)} ยืมเงิน` : `${debtWho(d)} คืนเงิน`)
    : (d.action === "pay" ? `${debtWho(d)} ออกให้ ${debtOther(d)}` : `${debtWho(d)} คืน ${debtOther(d)}`);
  const color = loan ? (inbound ? "var(--shift)" : "var(--bill)") : (inbound ? "var(--st-personal)" : "var(--income)");
  const canDel = d.created_by === state.user.id || can("tx_all");
  return `<div class="row${canDel ? " tap" : ""}" ${canDel ? `data-edit-debt="${esc(d.id)}" role="button" tabindex="0"` : ""}><div class="cat-ic" style="background:color-mix(in srgb,${color} 16%,var(--surface))" aria-hidden="true">${icon}</div>
    <div class="what"><b>${esc(title)}</b><span>${esc(dayLabel(d.tx_date))}${loan && accts ? " · " + esc(accts) : ""}${d.note ? " · " + esc(d.note) : ""}</span></div>
    <div class="amt num" style="color:${color}">${baht(d.amount)}</div>
    ${canDel ? `<button class="del" type="button" data-del-debt="${esc(d.id)}" aria-label="ลบรายการ">×</button>` : "<span></span>"}</div>`;
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-del-debt]"); if (!b) return;
  if (!confirm("ลบรายการนี้?")) return;
  try { await api.deleteDebt(b.dataset.delDebt); toast("ลบรายการแล้ว"); await reload(); } catch (err) { toast(friendlyError(err)); }
});

function renderHome() {
  $("txtInvite").textContent = state.family.invite_code;
  $("txtMemberCount").textContent = `${state.members.length} คน`;
  $("txtEmail").textContent = `เข้าสู่ระบบด้วย ${state.user.email}`;
  const permText = (m) => { if (m.role === "owner") return "ทำได้ทุกอย่าง";
    const on = PERMS.filter(([k, , d]) => { const v = (m.permissions || {})[k]; return v === undefined ? d : v; }).map(x => x[1].split(" (")[0]);
    return on.length ? "ได้สิทธิ์: " + on.join(" · ") : "แก้ได้เฉพาะข้อมูลตัวเอง"; };
  $("memberList").innerHTML = state.members.map(m => `
    <div class="member" style="align-items:flex-start"><div class="l" style="align-items:flex-start">${avatarHTML(m, "avatar")}<div><b>${esc(m.display_name)}</b>${m.id === state.me.id ? ` <small class="muted">(คุณ)</small>` : ""}
      <div class="muted" style="font-size:12.5px;line-height:1.4">${isChild(m) ? `🎒 เด็ก · บันทึกเงินไปโรงเรียนในแท็บเงินเดือน${m.user_id ? "" : " · ไม่มีบัญชีเข้าระบบ"}` : esc(permText(m))}</div></div></div>
    <div style="display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:6px"><span class="badge${isChild(m) ? " kid" : ""}">${m.role === "owner" ? "เจ้าของบ้าน" : isChild(m) ? "เด็ก" : "ผู้ใหญ่"}</span>
      ${isOwner() && m.role !== "owner" && m.user_id ? `<button type="button" class="iconlink" style="margin:0" data-kind="${esc(m.id)}|${isChild(m) ? "adult" : "child"}">${isChild(m) ? "👤 เป็นผู้ใหญ่" : "🎒 เป็นเด็ก"}</button>` : ""}
      ${isOwner() && m.role !== "owner" && !isChild(m) ? `<button type="button" class="iconlink" style="margin:0" data-perms="${esc(m.id)}">⚙️ สิทธิ์</button>` : ""}${isOwner() && m.role !== "owner" ? `<button type="button" class="rm-btn" style="margin:0" data-rm-member="${esc(m.id)}" aria-label="ลบ ${esc(m.display_name)} ออกจากบ้าน">ลบ</button>` : ""}</div></div>`).join("");
  $("addKidRow").classList.toggle("hidden", !isOwner());
  const canFam = can("family");
  $("featHint").textContent = canFam ? "ปิดฟังก์ชันที่ไม่ใช้ เมนูและหัวข้อนั้นจะถูกซ่อนสำหรับทุกคนในบ้าน" : "เฉพาะเจ้าของบ้านหรือผู้ได้สิทธิ์ที่เปิด–ปิดได้";
  $("featList").innerHTML = FEATURES.map(([k, name, desc]) => `<div class="perm-row"><div><b>${esc(name)}</b><small>${esc(desc)}</small></div>
    <button type="button" class="switch brand" role="switch" aria-checked="${feat(k)}" aria-label="${esc(name)}" data-feat="${k}" ${canFam ? "" : "disabled"}></button></div>`).join("");
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-feat]"); if (!b || b.disabled) return;
  const features = { ...(state.family.features || {}) }; features[b.dataset.feat] = !feat(b.dataset.feat);
  b.setAttribute("aria-checked", features[b.dataset.feat]); b.disabled = true;
  try { await api.updateFamily(state.family.id, { features }); await refreshFamily(); toast("บันทึกแล้ว"); }
  catch (err) { toast(/features/.test(String(err.message || err)) ? "ให้รัน schema_phase7.sql ก่อน" : friendlyError(err)); renderAll(); }
});
let permTarget = null;
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-perms]"); if (!b) return;
  permTarget = state.members.find(m => m.id === b.dataset.perms); if (!permTarget) return;
  $("permTitle").textContent = `สิทธิ์ของ ${permTarget.display_name}`; $("permErr").textContent = "";
  $("permList").innerHTML = PERMS.map(([k, name, d]) => { const v = (permTarget.permissions || {})[k];
    return `<div class="perm-row"><div><b>${esc(name)}</b></div><button type="button" class="switch brand" role="switch" aria-checked="${v === undefined ? d : !!v}" aria-label="${esc(name)}" data-perm-key="${k}"></button></div>`; }).join("");
  openSheet("sheetPerms");
});
$("permList").addEventListener("click", (e) => { const b = e.target.closest("[data-perm-key]"); if (b) b.setAttribute("aria-checked", b.getAttribute("aria-checked") !== "true"); });
$("formPerms").onsubmit = async (e) => {
  e.preventDefault(); const perms = {};
  $("permList").querySelectorAll("[data-perm-key]").forEach(b => perms[b.dataset.permKey] = b.getAttribute("aria-checked") === "true");
  const btn = $("btnSavePerms"); btn.disabled = true;
  try { await api.setPermissions(permTarget.id, perms); closeSheet("sheetPerms"); toast("บันทึกสิทธิ์แล้ว"); await refreshFamily(); }
  catch (err) { $("permErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-rm-member]"); if (!b) return;
  const name = memberName(b.dataset.rmMember);
  if (!confirm(`ลบ “${name}” ออกจากบ้าน?\n\nข้อมูลส่วนตัวของ ${name} (รายรับรายจ่ายส่วนตัว วันทำงาน เงินเดือน รูปสลิป) จะถูกลบถาวร\nรายจ่าย “ใช้ร่วมกัน” ที่เคยบันทึกจะย้ายมาเป็นของคุณ`)) return;
  b.disabled = true;
  try {
    await api.removeMember(state.family.id, b.dataset.rmMember);
    if (state.salMember === b.dataset.rmMember) state.salMember = "all";
    toast(`ลบ ${name} ออกจากบ้านแล้ว`); await refreshFamily(); await reload();
  } catch (err) { toast(friendlyError(err)); b.disabled = false; }
});
$("btnCopyInvite").onclick = async () => {
  try { await navigator.clipboard.writeText(state.family.invite_code); toast("คัดลอกรหัสเชิญแล้ว"); }
  catch { toast(`รหัสเชิญ: ${state.family.invite_code}`); }
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-del]"); if (!b) return;
  if (!confirm(delTxMsg(b.dataset.del))) return;
  try { await deleteTxCascade(b.dataset.del); toast("ลบรายการแล้ว"); await reload(); }
  catch (err) { toast(friendlyError(err)); }
});

function setTab(tab) {
  state.tab = tab;
  window.scrollTo({ top: 0 });
  renderAll();
}
document.querySelectorAll(".nav [data-tab]").forEach(b => b.onclick = () => setTab(b.dataset.tab));
document.addEventListener("click", (e) => { const g = e.target.closest("[data-goto]"); if (g) setTab(g.dataset.goto); });

/* =========================================================
   งบส่วนตัว
   ========================================================= */
function defaultBudgetRange(M) {
  const st = feat("salary") ? settingsFor(state.me.id, ymd(M)) : null;
  return st ? cycleRange(M, +st.start_day, +st.end_day) : { start: monthStart(M), end: new Date(M.getFullYear(), M.getMonth() + 1, 0) };
}
function budgetInfo(M) {
  const mStr = ymd(M), rows = (state.data.budgets || []).filter(b => b.member_id === state.me.id)
    .sort((a, b) => String(b.cycle_month).localeCompare(String(a.cycle_month)));
  const exact = rows.find(b => String(b.cycle_month).slice(0, 10) === mStr), prev = rows.find(b => String(b.cycle_month).slice(0, 10) <= mStr);
  if (!prev) return null;
  const r = exact ? { start: parseYmd(exact.start_date), end: parseYmd(exact.end_date) } : defaultBudgetRange(M);
  return { amount: +prev.amount, ...r, inherited: !exact, from: parseYmd(prev.cycle_month) };
}
/* ---------- บัญชีส่วนตัว ---------- */
const paBalance = (id) => round2((state.data.pmoves || []).filter(m => m.account_id === id).reduce((a, m) => a + (m.kind === "deposit" ? +m.amount : -m.amount), 0));
const myPAccts = () => (state.data.paccts || []).filter(a => a.member_id === state.me.id);
let openPa = null;
function paCard(a, mine) {
  const bal = paBalance(a.id), owner = state.members.find(m => m.id === a.member_id);
  const mv = (state.data.pmoves || []).filter(m => m.account_id === a.id).sort(newest("move_date")).slice(0, 12);
  return `<div class="acct"><div class="acct-h" role="button" tabindex="0" data-pa-open="${esc(a.id)}" style="cursor:pointer">
    <div class="goal-e" aria-hidden="true">${esc(a.emoji || "🔒")}</div>
    <div style="flex:1;min-width:0"><b>${esc(a.name)}</b><small>${mine ? (a.shared ? "👀 คนในบ้านดูได้" : "🔒 ส่วนตัว เห็นคนเดียว") : `ของ ${esc(owner?.display_name || "สมาชิก")} · ดูได้อย่างเดียว`}</small></div>
    ${!mine && owner ? avatarHTML(owner) : ""}<div class="acct-bal"><b class="num">${signed(Math.round(bal))}</b></div></div>
    ${mine ? `<div class="goal-actions"><button class="btn btn-primary btn-sm" type="button" data-pa-dep="${esc(a.id)}">ฝาก</button><button class="btn btn-ghost btn-sm" type="button" data-pa-wd="${esc(a.id)}">ถอน</button><button class="btn btn-ghost btn-sm" type="button" data-pa-edit="${esc(a.id)}">แก้ไข</button></div>` : ""}
    ${openPa === a.id ? `<div class="moves">${mv.length ? mv.map(m => `<div class="mv"><div><b>${m.kind === "deposit" ? "ฝาก" : "ถอน"}</b> ${esc(m.note || "")}<small>${esc(dayLabel(String(m.move_date).slice(0, 10)))}${m.slip_path ? ` · <a href="#" data-pm-slip="${esc(m.id)}">🧾 ดูสลิป</a>` : ""}</small></div>
      <div style="text-align:right"><b class="num" style="color:${m.kind === "deposit" ? "var(--income)" : "var(--expense)"}">${m.kind === "deposit" ? "+" : "−"}${baht(m.amount)}</b>${mine ? `<br><button class="linkbtn" type="button" style="font-size:12px;padding:0;color:var(--muted)" data-pm-del="${esc(m.id)}">ลบ</button>` : ""}</div></div>`).join("") : `<div class="muted" style="padding:6px 0">ยังไม่มีรายการ</div>`}</div>` : ""}</div>`;
}
function renderPAccts() {
  const list = myPAccts(), tot = list.reduce((a, x) => a + paBalance(x.id), 0);
  $("paTotal").textContent = signed(Math.round(tot));
  $("paPill").textContent = `${list.length} บัญชี · แชร์ ${list.filter(a => a.shared).length}`;
  $("paList").innerHTML = list.map(a => paCard(a, true)).join("") || `<div class="card empty">ยังไม่มีบัญชีส่วนตัว<br><button class="btn btn-soft btn-sm" type="button" style="margin-top:10px" onclick="openAcctSheet(null, true)">+ เพิ่มบัญชีส่วนตัว</button></div>`;
}
document.querySelectorAll("[data-p-view]").forEach(b => b.onclick = () => { state.pView = b.dataset.pView; renderAll(); });
document.addEventListener("click", async (e) => {
  const o = e.target.closest("[data-pa-open]"); if (o) { openPa = openPa === o.dataset.paOpen ? null : o.dataset.paOpen; state.tab === "personal" ? renderPAccts() : renderSavings(); }
  const dp = e.target.closest("[data-pa-dep]"); if (dp) openMoney({ kind: "deposit", personal: dp.dataset.paDep });
  const wd = e.target.closest("[data-pa-wd]"); if (wd) openMoney({ kind: "withdraw", personal: wd.dataset.paWd });
  const ed = e.target.closest("[data-pa-edit]"); if (ed) openAcctSheet(ed.dataset.paEdit, true);
  const sl = e.target.closest("[data-pm-slip]"); if (sl) { e.preventDefault(); const m = state.data.pmoves.find(x => x.id === sl.dataset.pmSlip); if (m) openSlip(m.slip_path, state.me.id, parseYmd(m.move_date)); }
  const dl = e.target.closest("[data-pm-del]"); if (dl) { if (!confirm("ลบรายการนี้?")) return; try { await api.deletePMove(dl.dataset.pmDel); toast("ลบแล้ว"); await reload(); } catch (err) { toast(friendlyError(err)); } }
});
$("btnPaNew").onclick = () => openAcctSheet(null, true);
$("btnPaMove").onclick = () => { const a = myPAccts()[0]; if (!a) return openAcctSheet(null, true); openMoney({ kind: "deposit", personal: a.id }); };
$("btnPClear").onclick = async () => {
  const M = monthStart(state.anchor), b = budgetInfo(M); if (!b) return;
  const s0 = ymd(b.start), e0 = ymd(b.end), n = myPersonalAll(s0, e0).length;
  if (!n) { toast("รอบนี้ยังไม่มีข้อมูล"); return; }
  if (!confirm(`ล้างข้อมูลการใช้ส่วนตัว ${n} รายการ ของรอบ ${shortDate(b.start)} – ${shortDate(b.end)}?\n(งบที่ตั้งไว้ยังอยู่ · กู้คืนไม่ได้)`)) return;
  try { await api.clearPSpends(state.me.id, s0, e0); toast("ล้างข้อมูลรอบนี้แล้ว"); await reload(); } catch (err) { toast(friendlyError(err)); }
};
// เงินส่วนตัว: ใช้บันทึกแยก (personal_spends) ไม่ปนกับรายรับรายจ่ายของบ้าน
const myPersonalAll = (s0, e0) => (state.data.pspends || []).filter(t => t.member_id === state.me.id && t.spend_date >= s0 && t.spend_date <= e0).map(t => ({ ...t, tx_date: String(t.spend_date).slice(0, 10) }));
const myPersonalSpend = (s0, e0) => myPersonalAll(s0, e0).filter(t => (t.kind || "spend") === "spend");
function renderPersonal() {
  if (!feat("personal") || !state.me) return;
  document.querySelectorAll("[data-p-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.pView === state.pView));
  $("pAccts").classList.toggle("hidden", state.pView !== "accts"); $("pDaily").classList.toggle("hidden", state.pView !== "daily");
  document.querySelector(".month").classList.toggle("hidden", state.pView === "accts");
  if (state.pView === "accts") return renderPAccts();
  const M = monthStart(state.anchor); let b = budgetInfo(M);
  $("pEmpty").classList.toggle("hidden", !!b); $("pMain").classList.toggle("hidden", !b);
  if (!b) return;
  const s0 = ymd(b.start), e0 = ymd(b.end), items = myPersonalSpend(s0, e0), byDay = {};
  const ins = myPersonalAll(s0, e0).filter(t => t.kind === "income"), extra = ins.reduce((a, t) => a + +t.amount, 0), inByDay = {};
  ins.forEach(t => (inByDay[t.tx_date] ||= []).push(t));
  b = { ...b, base: b.amount, amount: b.amount + extra };
  items.forEach(t => (byDay[t.tx_date] ||= []).push(t));
  const dayTotal = (k) => (byDay[k] || []).reduce((a, t) => a + +t.amount, 0);
  const len = daysBetween(b.start, b.end), ideal = b.amount / len, t0 = today0(), tStr = ymd(t0);
  const spent = items.reduce((a, t) => a + +t.amount, 0), spentToday = dayTotal(tStr), left = b.amount - spent;
  const before = t0 < b.start, after = t0 > b.end;
  $("pPeriod").textContent = `${shortDate(b.start)} – ${shortDate(b.end)}${b.inherited ? " · ใช้งบจากรอบก่อน" : ""}`;
  $("pBudget").textContent = bahtR(b.amount); $("pSpent").textContent = bahtR(spent);
  if (extra) $("pBudget").title = `งบ ${bahtR(b.base)} + เงินเข้า ${bahtR(extra)}`;
  if (before) {
    $("pToday").textContent = bahtR(ideal); $("pTodaySub").textContent = `ยังไม่ถึงรอบ เริ่ม ${shortDate(b.start)} · เฉลี่ยวันละ ${bahtR(ideal)}`;
    $("pLeft").textContent = bahtR(left); $("pPerDayLbl").textContent = "เฉลี่ยวันละ"; $("pPerDay").textContent = bahtR(ideal);
    $("pDaysLeft").textContent = len; $("pAvg").textContent = "—";
  } else if (after) {
    $("pToday").textContent = signed(Math.round(left)); $("pTodaySub").textContent = left >= 0 ? `จบรอบแล้ว เหลือเก็บ ${bahtR(left)} 🎉` : `จบรอบแล้ว ใช้เกินงบ ${bahtR(-left)}`;
    $("pLeft").textContent = signed(Math.round(left)); $("pPerDayLbl").textContent = "เฉลี่ยที่ใช้ต่อวัน"; $("pPerDay").textContent = bahtR(spent / len);
    $("pDaysLeft").textContent = 0; $("pAvg").textContent = bahtR(spent / len);
  } else {
    const daysLeft = daysBetween(t0, b.end), allowToday = (b.amount - (spent - spentToday)) / daysLeft, leftToday = allowToday - spentToday;
    const perAfter = daysLeft > 1 ? left / (daysLeft - 1) : null, elapsed = daysBetween(b.start, t0);
    $("pToday").textContent = signed(Math.round(leftToday));
    $("pToday").style.color = leftToday < 0 ? "#FFB3BB" : "";
    $("pTodaySub").textContent = `งบวันนี้ ${bahtR(allowToday)} · ใช้ไปแล้ว ${bahtR(spentToday)}${leftToday < 0 ? " · เกินงบวันนี้" : ""}`;
    $("pLeft").textContent = signed(Math.round(left));
    $("pPerDayLbl").textContent = perAfter !== null ? `ต่อจากพรุ่งนี้ วันละ (${daysLeft - 1} วัน)` : "วันสุดท้ายของรอบ";
    $("pPerDay").textContent = perAfter !== null ? signed(Math.round(perAfter)) : "—";
    $("pDaysLeft").textContent = daysLeft; $("pAvg").textContent = bahtR(spent / elapsed);
  }
  $("pIdealTxt").textContent = `งบเฉลี่ย ${bahtR(ideal)}/วัน`;
  const days = []; eachDay(b.start, b.end, d => days.push(d));
  const vals = days.map(d => dayTotal(ymd(d))), hi = days.findIndex(d => ymd(d) === tStr);
  barChart($("chartPDaily"), $("tipPDaily"), {
    labels: days.map(d => String(d.getDate())), stacked: true, refLine: ideal, hi: hi >= 0 ? hi : null, initialTip: hi >= 0 ? hi : null, emptyText: "ยังไม่มีการใช้เงินในรอบนี้",
    series: [{ color: "var(--income)", values: vals.map(v => Math.min(v, ideal)) }, { color: "var(--expense)", values: vals.map(v => Math.max(0, v - ideal)) }],
    tip: (i) => { const k = ymd(days[i]), v = vals[i]; return `<b>${esc(dayLabel(k))}</b><span>ใช้ <b class="num">${bahtR(v)}</b></span><span style="color:${v > ideal ? "var(--expense)" : "var(--income)"}">${v > ideal ? "เกินงบเฉลี่ย" : "อยู่ในงบ"} ${bahtR(Math.abs(v - ideal))}</span>`; }
  });
  let cum = 0; const actual = days.map(d => { cum += dayTotal(ymd(d)); return ymd(d) <= tStr ? round2(b.amount - cum) : null; });
  const plan = days.map((_, i) => round2(b.amount - ideal * (i + 1)));
  lineChart($("chartPBurn"), $("tipPBurn"), { labels: days.map(d => String(d.getDate())), initialTip: hi >= 0 ? hi : null,
    series: [{ color: "var(--muted)", values: plan, dash: true, noArea: true }, { color: "var(--brand)", values: actual.map(v => v === null ? null : Math.max(0, v)) }],
    tip: (i) => `<b>${esc(dayLabel(ymd(days[i])))}</b><span>ตามแผนเหลือ <b class="num">${bahtR(plan[i])}</b></span>${actual[i] !== null ? `<span>เหลือจริง <b class="num" style="color:${actual[i] >= plan[i] ? "var(--income)" : "var(--expense)"}">${signed(Math.round(actual[i]))}</b></span>` : ""}` });
  // รายละเอียดรายวัน (ล่าสุดก่อน)
  let run = b.amount; const runAfter = {}; days.forEach(d => { run -= dayTotal(ymd(d)); runAfter[ymd(d)] = run; });
  const shown = days.filter(d => ymd(d) <= tStr).reverse();
  $("pDays").innerHTML = shown.length ? shown.map(d => { const k = ymd(d), list = [...(byDay[k] || []), ...(inByDay[k] || [])].sort(newest("tx_date")), tot = dayTotal(k), isT = k === tStr;
    return `<div class="pday${isT ? " today" : ""}"><div class="pday-h"><b>${isT ? "วันนี้ · " : ""}${esc(dayLabel(k))}</b>
      <span class="num"><span class="${tot > ideal ? "over" : tot ? "under" : "muted"}">${tot ? "−" + bahtR(tot) : "—"}</span>${isT ? `<button type="button" class="iconlink" data-p-add="${k}">+ เพิ่ม</button>` : ""}</span></div>
      ${list.length ? `<div class="pday-items">${list.map(t => `<div role="button" tabindex="0" data-ps-edit="${esc(t.id)}" style="cursor:pointer"><span>${t.kind === "income" ? "💵" : catIcon("expense", t.category)} ${esc(t.note || t.category)}</span><span class="num" style="${t.kind === "income" ? "color:var(--income);font-weight:700" : ""}">${t.kind === "income" ? "+" : ""}${baht(t.amount)} ✎</span></div>`).join("")}</div>` : ""}
      <div class="pday-items"><div><span>${list.length ? "เหลือหลังวันนี้" : "ไม่ได้ใช้ · งบคงเหลือ"}</span><b class="num" style="color:${runAfter[k] < 0 ? "var(--expense)" : "var(--ink)"}">${signed(Math.round(runAfter[k]))}</b></div></div></div>`; }).join("")
    : `<div class="empty">ยังไม่ถึงรอบ</div>`;
}
function openBudget() {
  const M = monthStart(state.anchor), b = budgetInfo(M), def = defaultBudgetRange(M);
  $("budTitle").textContent = `งบใช้ส่วนตัว · รอบ ${monthLabel(M)}`;
  $("budHint").textContent = "ส่วนนี้เห็นได้เฉพาะคุณ · วันที่เริ่มต้นตั้งตามรอบเงินเดือนของคุณ แก้ได้ · รอบถัดไปจะใช้งบเดิมให้อัตโนมัติ";
  $("budAmount").value = b ? b.amount : ""; $("budStart").value = ymd(b ? b.start : def.start); $("budEnd").value = ymd(b ? b.end : def.end);
  $("budErr").textContent = ""; budPreview(); openSheet("sheetBudget");
}
function budPreview() {
  const a = +$("budAmount").value || 0, s0 = $("budStart").value, e0 = $("budEnd").value;
  if (!s0 || !e0 || e0 < s0) { $("budPreview").textContent = "เลือกช่วงวันที่ให้ถูกต้อง"; return; }
  const len = daysBetween(parseYmd(s0), parseYmd(e0));
  $("budPreview").textContent = `${len} วัน · ใช้ได้เฉลี่ยวันละ ${baht(round2(a / len))}`;
}
["budAmount", "budStart", "budEnd"].forEach(id => $(id).addEventListener("input", budPreview));
document.addEventListener("click", (e) => { if (e.target.closest("[data-open-budget]")) openBudget(); });
$("formBudget").onsubmit = async (e) => {
  e.preventDefault();
  const amount = round2($("budAmount").value), s0 = $("budStart").value, e0 = $("budEnd").value;
  if (!(amount > 0)) { $("budErr").textContent = "ใส่งบที่ใช้ได้"; return; }
  if (!s0 || !e0 || e0 < s0) { $("budErr").textContent = "วันที่สิ้นสุดต้องไม่ก่อนวันเริ่ม"; return; }
  const btn = $("btnSaveBudget"); btn.disabled = true;
  try { await api.saveBudget({ family_id: state.family.id, member_id: state.me.id, cycle_month: ymd(monthStart(state.anchor)), amount, start_date: s0, end_date: e0 }); closeSheet("sheetBudget"); toast("บันทึกงบแล้ว"); await reload(); }
  catch (err) { $("budErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};
let psEdit = null, psCat = "อาหาร", psKind = "spend";
function setPsKind(k) { psKind = k; document.querySelectorAll("[data-ps-kind]").forEach(b => b.setAttribute("aria-pressed", b.dataset.psKind === k)); $("psCats").classList.toggle("hidden", k === "income"); $("psNote").placeholder = k === "income" ? "เช่น แม่ให้, ขายของ" : "เช่น ข้าวกลางวัน"; }
document.querySelectorAll("[data-ps-kind]").forEach(b => b.onclick = () => setPsKind(b.dataset.psKind));
function openPSpend(o = {}) {
  psEdit = o.edit || null; psCat = psEdit?.category || "อาหาร";
  $("psTitle").textContent = psEdit ? "แก้ไขการใช้ส่วนตัว" : "บันทึกการใช้ส่วนตัว";
  $("psAmount").value = psEdit ? psEdit.amount : ""; $("psNote").value = psEdit?.note || ""; $("psErr").textContent = "";
  $("psDate").value = psEdit ? String(psEdit.spend_date).slice(0, 10) : (o.date || ymd(today0()));
  $("psDelete").classList.toggle("hidden", !psEdit);
  renderPsCats(); setPsKind(psEdit?.kind || o.kind || "spend");
  // ใช้บ่อย (จากบันทึกส่วนตัวของคุณ)
  const freq = {}; (state.data.pspends || []).filter(t => t.member_id === state.me.id && (t.kind || "spend") === "spend").forEach(t => { const k = `${t.category}|${t.note}|${+t.amount}`; freq[k] = (freq[k] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $("psQuick").classList.toggle("hidden", !!psEdit || !top.length);
  $("psQuick").innerHTML = top.map(([k]) => { const [c, n, a] = k.split("|"); return `<button type="button" data-psq="${esc(k)}"><b>${catIcon("expense", c)} ${esc(n || c)}</b>${bahtR(a)}</button>`; }).join("");
  openSheet("sheetPSpend"); setTimeout(() => $("psAmount").focus(), 60);
}
function renderPsCats() { $("psCats").innerHTML = CATEGORIES.expense.map(([c, e]) => `<button type="button" class="cat-btn" data-pscat="${esc(c)}" aria-pressed="${c === psCat}"><span class="e">${e}</span>${esc(c)}</button>`).join(""); }
$("psCats").addEventListener("click", (e) => { const b = e.target.closest("[data-pscat]"); if (b) { psCat = b.dataset.pscat; renderPsCats(); } });
$("psQuick").addEventListener("click", (e) => { const b = e.target.closest("[data-psq]"); if (!b) return; const [c, n, a] = b.dataset.psq.split("|"); psCat = c; $("psNote").value = n; $("psAmount").value = a; renderPsCats(); });
$("formPSpend").onsubmit = async (e) => {
  e.preventDefault();
  const amount = round2($("psAmount").value); if (!(amount > 0)) { $("psErr").textContent = "ใส่จำนวนเงินมากกว่า 0"; return; }
  const row = { amount, category: psKind === "income" ? "เงินเข้า" : psCat, note: $("psNote").value.trim(), spend_date: $("psDate").value || ymd(today0()) };
  if (psKind === "income" || psEdit?.kind === "income") row.kind = psKind;
  const btn = $("psSave"); btn.disabled = true;
  try { if (psEdit) await api.updatePSpend(psEdit.id, row); else await api.addPSpend({ family_id: state.family.id, member_id: state.me.id, ...row });
    closeSheet("sheetPSpend"); toast("บันทึกแล้ว"); await reload(); }
  catch (err) { $("psErr").textContent = friendlyError(err); } finally { btn.disabled = false; }
};
$("psDelete").onclick = async () => { if (!psEdit || !confirm("ลบรายการนี้?")) return;
  try { await api.deletePSpend(psEdit.id); closeSheet("sheetPSpend"); toast("ลบแล้ว"); await reload(); } catch (err) { $("psErr").textContent = friendlyError(err); } };
$("btnPAdd").onclick = () => openPSpend({ date: ymd(today0()) });
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-p-add]"); if (b) openPSpend({ date: b.dataset.pAdd });
  const ed = e.target.closest("[data-ps-edit]"); if (ed) { const t = (state.data.pspends || []).find(x => x.id === ed.dataset.psEdit); if (t) openPSpend({ edit: t }); }
});

/* =========================================================
   SALARY TAB
   ========================================================= */
const DAY_COLS = [["work", "ทำงาน", "--st-work"], ["sick", "ลาป่วย", "--st-sick"], ["personal", "ลากิจ", "--st-personal"], ["vacation", "พักร้อน", "--st-vacation"], ["unpaid", "ขาด", "--st-unpaid"], ["off", "หยุด", "--st-off"]];
function renderSalaryChips() {
  const all = state.salMember === "all";
  $("salMembers").innerHTML = `<button class="chip" type="button" data-sal-member="all" aria-pressed="${all}">🏠 ทั้งบ้าน</button>`
    + state.members.map(m => `<button class="chip" type="button" data-sal-member="${esc(m.id)}" aria-pressed="${m.id === state.salMember}">${avatarHTML(m)}${esc(m.display_name)}${isChild(m) ? " 🎒" : ""}</button>`).join("");
  const kid = !all && isChild(state.salMember);
  $("salAll").classList.toggle("hidden", !all);
  $("salOne").classList.toggle("hidden", all || kid);
  $("salKid").classList.toggle("hidden", !kid);
}
const depositNote = (M) => `เงินเหลือรอบ ${monthLabel(M)}`;
function depositHTML(M, left) {
  if (left <= 0 || !feat("deposit")) return "";
  const note = depositNote(M);
  const done = state.data.txs.filter(t => t.category === SAVE_CAT && t.note === note).reduce((a, t) => a + +t.amount, 0)
    || (state.data.moves || []).filter(m => m.kind === "deposit" && m.note === note).reduce((a, m) => a + +m.amount, 0);
  const bp = bpaysOf(ymd(M), ymd(M)), bpTot = bp.reduce((a, x) => a + +x.amount, 0);
  const bpLine = `<button class="btn btn-ghost btn-sm" type="button" data-bpay-save="${ymd(M)}">${bp.length ? `📌 บันทึกรายจ่ายหลักแล้ว ${bp.length} รายการ ${baht(bpTot)} · บันทึกใหม่` : "📌 บันทึกรายจ่ายหลักและรายการหักของรอบนี้"}</button>
    <small class="muted" style="font-size:12.5px">ดูได้ในหน้าภาพรวม → จ่ายประจำ (ไม่นับรวมในรายจ่าย)</small>`;
  if (done) { const tx = state.data.txs.find(t => t.category === SAVE_CAT && t.note === note), mv = (state.data.moves || []).find(m => m.kind === "deposit" && m.note === note && !m.debt_id);
    const where = mv ? acctName(mv.account_id) : "บัญชีรายรับรายจ่าย", when = tx ? `นับเป็นรายรับ ${monthLabel(parseYmd(tx.tx_date))}` : "ยังไม่ขึ้นในหน้ารับ–จ่าย (ฝากด้วยรุ่นเก่า)";
    return `<div class="deposit"><div class="dep-done"><div><b>🏦 ฝากเงินเหลือจากเงินเดือน ${baht(done)} ✓</b><small>เข้า ${esc(where)} · ${when}</small></div>
      <button class="btn btn-ghost btn-sm" type="button" data-deposit-undo="${ymd(M)}">ยกเลิก / ฝากใหม่</button></div>${bpLine}</div>`; }
  if (M > monthStart(today0())) return `<div class="deposit"><button class="btn btn-soft" type="button" disabled>ฝากเงินเหลือได้เมื่อถึงรอบนี้</button></div>`;
  return `<div class="deposit"><button class="btn btn-primary" type="button" data-deposit="${round2(left)}">🏦 ฝากเงินคงเหลือ ${baht(round2(left))}</button>
    <small class="muted" style="font-size:12.5px">เลือกบัญชีที่จะฝากได้ · ระบบจะบันทึกรายจ่ายหลัก ${billPayRows(M).length} รายการ (รวมรายการหักในสลิป) ไว้ให้ด้วย</small></div>`;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-deposit]"); if (!b) return;
  const M = monthStart(state.anchor), t = today0(), endM = new Date(M.getFullYear(), M.getMonth() + 1, 0);
  // เงินเดือนออกสิ้นเดือน → เงินเหลือคือเงินใช้ของเดือนถัดไป จึงลงเป็นรายรับวันที่ 1 ของเดือนหน้า (แก้วันที่ได้)
  openMoney({ kind: "deposit", amount: round2(b.dataset.deposit), note: depositNote(M), date: ymd(addMonths(M, 1)), title: `ฝากเงินคงเหลือ รอบ ${monthLabel(M)}`, depositM: M });
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-deposit-undo]"); if (!b) return;
  const M = parseYmd(b.dataset.depositUndo), note = depositNote(M);
  if (!confirm(`ยกเลิกการฝากเงินคงเหลือ รอบ ${monthLabel(M)}?\n\nรายการในหน้ารับ–จ่าย เงินที่โอนเข้าบัญชีเงินเก็บ และรายจ่ายประจำของรอบนี้จะถูกลบ แล้วกดฝากใหม่ได้`)) return;
  b.disabled = true;
  try {
    for (const t of state.data.txs.filter(t => t.category === SAVE_CAT && t.note === note)) await api.deleteTx(t.id);
    for (const m of (state.data.moves || []).filter(m => !m.debt_id && m.note === note && (m.kind === "deposit" || m.kind === "withdraw"))) await api.deleteMove(m.id);
    try { await api.setBillPays(state.family.id, ymd(M), []); } catch (er) { console.warn(er); }
    toast("ยกเลิกแล้ว กดฝากใหม่ได้เลย"); await reload();
  } catch (err) { toast(friendlyError(err)); b.disabled = false; }
});
// เอารายได้สุทธิรวมของบ้าน ไล่จ่ายรายจ่ายหลักทีละรายการ ตามลำดับความสำคัญ (บนสุด = สำคัญสุด)
function renderWaterfall(M, income) {
  const mStr = ymd(M), b = billsFor(mStr), items = (b?.items || []).filter(x => +x.amount > 0);
  const from = b && String(b.effective_month).slice(0, 10) !== mStr ? parseYmd(b.effective_month) : null;
  const total = sumItems(items), left = income - total;
  $("allBills").textContent = baht(total);
  $("allLeftLabel").textContent = left >= 0 ? "คงเหลือ" : "ติดลบ";
  $("allLeft").textContent = (left < 0 ? "−" : "") + baht(Math.abs(left));
  $("allLeft").style.color = left < 0 ? "#FFB3BB" : "";
  $("wfInfo").textContent = `${monthLabel(M)}${from ? ` · ใช้รายการจาก ${monthLabel(from)}` : b ? " · ตั้งรายการรอบนี้" : ""}`;
  if (!items.length) {
    $("wfBox").innerHTML = `<div class="empty">ยังไม่มีรายจ่ายหลักของรอบนี้<br><button class="btn btn-soft btn-sm" type="button" data-open-bills style="margin-top:10px" ${can("bills") ? "" : "hidden"}>เพิ่มรายจ่าย</button></div>`;
    return;
  }
  const scale = Math.max(income, total, 1);
  let run = income, paidCount = 0, html = "", meter = "";
  items.forEach((x, i) => {
    const amt = +x.amount, before = run; run -= amt;
    const covered = Math.max(0, Math.min(amt, before)), cls = covered >= amt ? "wf-full" : covered > 0 ? "wf-part" : "wf-none";
    if (cls === "wf-full") paidCount++;
    const tag = cls === "wf-full" ? `<span class="tag ok">จ่ายได้</span>` : cls === "wf-part" ? `<span class="tag part">จ่ายได้ ${baht(covered)} ขาด ${baht(amt - covered)}</span>` : `<span class="tag no">ไม่พอจ่าย</span>`;
    const col = cls === "wf-full" ? "var(--income)" : cls === "wf-part" ? "var(--shift)" : "var(--expense)";
    html += `<div class="wf-row ${cls}"><div class="wf-n num">${i + 1}</div><div>
      <div class="wf-top"><b>${esc(x.name)}</b><span class="num">${baht(amt)}</span></div>
      <div class="track"><i style="width:${(covered / amt * 100).toFixed(1)}%;background:${col}"></i></div>
      <div class="wf-sub">${tag}<span class="num">เหลือหลังจ่าย <b style="color:${run < 0 ? "var(--expense)" : "var(--ink)"}">${run < 0 ? "−" : ""}${baht(Math.abs(run))}</b></span></div></div></div>`;
    if (covered > 0) meter += `<i style="width:${(covered / scale * 100).toFixed(2)}%;background:${col}" title="${esc(x.name)}"></i>`;
  });
  if (left > 0) meter += `<i style="width:${(left / scale * 100).toFixed(2)}%;background:repeating-linear-gradient(45deg,#E8A500 0 5px,#FFD45C 5px 10px)" title="คงเหลือ"></i>`;
  if (left < 0) meter += `<i style="width:${(-left / scale * 100).toFixed(2)}%;background:repeating-linear-gradient(45deg,var(--expense) 0 4px,color-mix(in srgb,var(--expense) 55%,transparent) 4px 8px)" title="ส่วนที่ขาด"></i>`;
  const reach = paidCount === items.length ? "จ่ายได้ครบทุกรายการ" : paidCount === 0 ? "ยังจ่ายรายการแรกได้ไม่ครบ" : `จ่ายได้ครบถึงรายการที่ ${paidCount} (${esc(items[paidCount - 1].name)})`;
  $("wfBox").innerHTML = `
    <div class="wf-head" style="margin-top:10px"><span>รายได้สุทธิรวม <b class="num">${baht(income)}</b></span><span>รายจ่ายหลัก <b class="num">${baht(total)}</b></span></div>
    <div class="wf-meter" role="img" aria-label="${reach}">${meter}</div>
    <div class="legend-row" style="margin:2px 0 6px"><span><i style="background:var(--income)"></i>จ่ายได้</span><span><i style="background:var(--shift)"></i>จ่ายได้บางส่วน</span><span><i style="background:repeating-linear-gradient(45deg,#E8A500 0 3px,#FFD45C 3px 6px)"></i>คงเหลือ</span>${left < 0 ? `<span><i style="background:var(--expense)"></i>ขาด</span>` : ""}</div>
    <div style="font-size:14px;font-weight:600">${reach}</div>
    <div class="wf-list">${html}</div>
    <div class="wf-end"><span>${left >= 0 ? "คงเหลือหลังจ่ายครบ" : "ยังขาดอีก"}</span><span class="num" style="color:${left >= 0 ? "#B97F00" : "var(--expense)"};font-size:20px">${left < 0 ? "−" : ""}${baht(Math.abs(left))}</span></div>
    ${depositHTML(M, left)}`;
}
function renderPayrollAll() {
  const M = monthStart(state.anchor);
  const rows = adults().map(m => ({ m, p: payFor(m.id, M) }));
  const set = rows.filter(r => r.p);
  const tot = (f) => set.reduce((a, r) => a + f(r.p), 0);
  const fmtH = (h) => (+h || 0).toLocaleString("th-TH", { maximumFractionDigits: 1 });
  $("allNet").textContent = signed(tot(p => p.used));
  // ใครได้เท่าไร ถึงได้ยอดรวมนี้ (ยอดจริงตามสลิปใช้ก่อนยอดคำนวณ)
  const totalUsed = Math.max(1, tot(p => Math.max(0, p.used)));
  $("allContrib").innerHTML = `<div class="stackbar">${set.map(r => `<i style="width:${(Math.max(0, r.p.used) / totalUsed * 100).toFixed(2)}%;background:${avColor(memberIdx(r.m.id))}"></i>`).join("")}</div>`
    + rows.map(({ m, p }) => `<div class="contrib-row">${avatarHTML(m, "avatar")}<div><b>${esc(m.display_name)}${p && p.actual !== null ? `<span class="tag-real">ยอดจริง</span>` : ""}</b>
      <small>${p ? (p.actual !== null ? `ตามสลิป · คำนวณได้ ${baht(p.net)}` : `คำนวณ${p.daily ? " · รายวัน" : ""}`) + ` · ${Math.round(Math.max(0, p.used) / totalUsed * 100)}%` : "ยังไม่ได้ตั้งค่าเงินเดือน"}</small></div>
      <div class="amt num"><b class="${p && p.actual !== null ? "gold" : ""}">${p ? baht(p.used) : "—"}</b></div></div>`).join("");
  $("allCount").textContent = `${set.length}/${rows.length} คนตั้งค่าแล้ว`;
  $("secWaterfall").classList.toggle("hidden", !feat("bills"));
  $("allBillsBox").parentElement.classList.toggle("hidden", !feat("bills"));
  $("btnEditBills2").classList.toggle("hidden", !can("bills"));
  if (feat("bills")) renderWaterfall(M, tot(p => p.used));

  // net: คำนวณ vs ได้จริง
  barChart($("chartAllNet"), $("tipAllNet"), {
    labels: rows.map(r => r.m.display_name), stacked: false, emptyText: "ยังไม่มีใครตั้งค่าเงินเดือน",
    series: [{ color: "color-mix(in srgb,var(--brand) 32%,transparent)", values: rows.map(r => r.p ? Math.max(0, r.p.net) : 0), label: true, labelColor: "var(--muted)", labelSize: 10 },
             { color: "#E8A500", values: rows.map(r => r.p && r.p.actual !== null ? r.p.actual : 0), label: true, labelColor: "#B97F00", labelSize: 13.5 }],
    tip: (i) => { const { m, p } = rows[i]; if (!p) return `<b>${esc(m.display_name)}</b><span>ยังไม่ได้ตั้งค่า</span>`;
      const d = p.actual !== null ? p.actual - p.net : null;
      return `<b>${esc(m.display_name)}</b><span>คำนวณ <b class="num">${baht(p.net)}</b></span><span>ได้จริง <b class="num">${p.actual !== null ? baht(p.actual) : "—"}</b></span>${d !== null ? `<span style="color:${d >= 0 ? "var(--income)" : "var(--expense)"}">ต่าง ${d >= 0 ? "+" : "−"}${baht(Math.abs(d))}</span>` : ""}`; }
  });

  const seg = (v, max, c) => v > 0 ? `<i style="width:${(v / max * 100).toFixed(2)}%;background:${c}"></i>` : "";
  const head = (m, right) => `<div class="top"><b>${avatarHTML(m)}${esc(m.display_name)}</b><span class="num" style="font-weight:700">${right}</span></div>`;
  const none = (m) => `<div class="hbar">${head(m, "—")}<div class="sub">ยังไม่ได้ตั้งค่าเงินเดือน</div></div>`;

  const gMax = Math.max(1, ...set.map(r => r.p.base + r.p.otTotal + r.p.shiftPay + r.p.incSum + r.p.dailyIncSum));
  $("allIncomeBars").innerHTML = rows.map(({ m, p }) => !p ? none(m) : `<div class="hbar">${head(m, bahtR(p.base + p.otTotal + p.shiftPay + p.incSum + p.dailyIncSum))}
    <div class="track">${seg(p.base, gMax, "var(--income)")}${seg(p.otTotal, gMax, "#2F7FC1")}${seg(p.shiftPay, gMax, "var(--shift)")}${seg(p.incSum + p.dailyIncSum, gMax, "#8456C4")}</div>
    <div class="sub num">${p.daily ? "ค่าแรง" : "เงินเดือน"} ${bahtR(p.base)} · OT ${bahtR(p.otTotal)} · กะ ${bahtR(p.shiftPay)}${p.incSum + p.dailyIncSum ? " · ประจำ/รายวัน " + bahtR(p.incSum + p.dailyIncSum) : ""} · หัก ${bahtR(p.dedSum + p.unpaidDeduct)} → <b style="color:var(--ink)">สุทธิ ${bahtR(p.net)}</b></div></div>`).join("");

  const hMax = Math.max(1, ...set.map(r => r.p.hours));
  $("allOtSub").textContent = `รวม ${fmtH(tot(p => p.hours))} ชม.`;
  $("allOtBars").innerHTML = rows.map(({ m, p }) => !p ? none(m) : `<div class="hbar">${head(m, fmtH(p.hours) + " ชม. · " + bahtR(p.otTotal))}
    <div class="track">${seg(p.h15, hMax, "#8FC3EC")}${seg(p.h20, hMax, "#2F7FC1")}${seg(p.h30, hMax, "#1B4F86")}</div>
    <div class="sub num">1.5× ${fmtH(p.h15)} ชม. (${bahtR(p.ot15)}) · 2× ${fmtH(p.h20)} ชม. (${bahtR(p.ot20)}) · 3× ${fmtH(p.h30)} ชม. (${bahtR(p.ot30)})</div></div>`).join("");

  $("allDayLegend").innerHTML = DAY_COLS.map(c => `<span><i style="background:var(${c[2]})"></i>${c[1]}</span>`).join("");
  const dMax = Math.max(1, ...set.map(r => daysBetween(r.p.range.start, r.p.range.end)));
  $("allDayBars").innerHTML = rows.map(({ m, p }) => { if (!p) return none(m);
    const len = daysBetween(p.range.start, p.range.end), rec = Object.values(p.counts).reduce((a, b) => a + b, 0);
    return `<div class="hbar">${head(m, `${p.counts.work} วันทำงาน`)}
    <div class="track">${DAY_COLS.map(c => seg(p.counts[c[0]], dMax, `var(${c[2]})`)).join("")}</div>
    <div class="sub num">${DAY_COLS.filter(c => p.counts[c[0]]).map(c => `${c[1]} ${p.counts[c[0]]}`).join(" · ") || "ยังไม่ได้บันทึก"} · บันทึกแล้ว ${rec}/${len} วัน (${shortDate(p.range.start)}–${shortDate(p.range.end)})</div></div>`; }).join("");

  const kv = (k, v, cls = "") => `<div><span>${k}</span><b class="num ${cls}">${v}</b></div>`;
  $("allCards").innerHTML = rows.map(({ m, p }) => `<div class="pcard" role="button" tabindex="0" data-sal-member="${esc(m.id)}" aria-label="ดูรายละเอียดของ ${esc(m.display_name)}">
    <div class="pcard-h"><div class="l">${avatarHTML(m, "avatar")}<div><b>${esc(m.display_name)}</b>${p ? `<span class="type-tag">${p.daily ? "รายวัน" : "รายเดือน"}</span>` : ""}
      <small>${p ? `รอบ ${shortDate(p.range.start)} – ${shortDate(p.range.end)}` : "ยังไม่ได้ตั้งค่าเงินเดือน"}</small></div></div>
      ${p ? `<div class="pcard-net"><small class="muted" style="font-size:12px">${p.actual !== null ? "ได้จริง" : "สุทธิ (คำนวณ)"}</small><b class="num">${baht(p.used)}</b></div>` : ""}</div>
    ${p ? `<div class="kv">
      ${kv(p.daily ? `ค่าแรง ${p.counts.work} วัน × ${bahtR(p.rate)}` : "เงินเดือน", baht(p.base))}
      ${p.h15 ? kv(`OT 1.5× · ${fmtH(p.h15)} ชม.`, "+" + baht(p.ot15), "plus") : ""}
      ${p.h20 ? kv(`OT 2× · ${fmtH(p.h20)} ชม.`, "+" + baht(p.ot20), "plus") : ""}
      ${p.h30 ? kv(`OT 3× · ${fmtH(p.h30)} ชม.`, "+" + baht(p.ot30), "plus") : ""}
      ${!p.hours ? kv("OT", "0 ชม.") : ""}
      ${kv(`ค่ากะ · ${p.shifts} วัน`, (p.shiftPay ? "+" : "") + baht(p.shiftPay), p.shiftPay ? "plus" : "")}
      ${p.incSum ? kv("รายรับประจำ", "+" + baht(p.incSum), "plus") : ""}
      ${p.dailyIncomes.map(x => kv(`${esc(x.name)} · ${x.days} วัน`, "+" + baht(x.total), "plus")).join("")}
      ${p.dedSum + p.unpaidDeduct ? kv(`รายการหัก${p.unpaidDeduct ? " (รวมหักวันขาด)" : ""}`, "−" + baht(p.dedSum + p.unpaidDeduct), "minus") : ""}
      ${kv("สุทธิคำนวณ", baht(p.net))}
      ${p.actual !== null ? kv("ได้จริงตามสลิป", baht(p.actual)) + kv("ส่วนต่าง", (p.actual - p.net >= 0 ? "+" : "−") + baht(Math.abs(p.actual - p.net)), p.actual - p.net >= 0 ? "plus" : "minus") : ""}
    </div>
    <div class="daychips">${DAY_COLS.map(c => `<span style="--c:var(${c[2]})">${c[1]} <b class="num">${p.counts[c[0]]}</b></span>`).join("")}
      ${p.slipPath && feat("slips") ? `<button type="button" class="slip-tag" data-view-slip="${esc(m.id)}">🧾 ดูรูปสลิป</button>` : ""}</div>` : ""}</div>`).join("");
}
function renderSalary() {
  renderSalaryChips();
  if (state.salMember === "all") { renderPayrollAll(); return; }
  if (isChild(state.salMember)) { renderKid(state.salMember); return; }
  $("secActual").classList.toggle("hidden", !feat("slips"));
  const mid = state.salMember, M = monthStart(state.anchor), editable = canEditMember(mid);
  const pRaw = payFor(mid, M);
  const p = pRaw || Object.assign(calcPay(DEFAULT_PAY, []), { range: cycleRange(M, 1, 31), settings: { ...DEFAULT_PAY }, days: [], actual: null, used: 0 });
  state.salPay = p;
  $("payNet").textContent = signed(p.net);
  $("payPeriod").textContent = `${shortDate(p.range.start)} – ${shortDate(p.range.end)}`;
  $("payActualHero").textContent = p.actual !== null ? baht(p.actual) : "ยังไม่บันทึก";
  $("payInherit").textContent = !pRaw ? "ยังไม่ได้ตั้งค่า" : p.inheritedFrom ? `ใช้ค่าจาก ${monthLabel(p.inheritedFrom)}` : "ตั้งค่ารอบนี้";
  $("statWork").textContent = p.work; $("statLeave").textContent = p.leave;
  $("statOtH").textContent = p.hours.toLocaleString("th-TH", { maximumFractionDigits: 1 }); $("statShift").textContent = p.shifts;

  const row = (label, val, cls = "") => `<div class="slip-row ${cls}"><span>${label}</span><span class="num">${val}</span></div>`;
  let html = !pRaw ? `<div class="empty">ยังไม่ได้ตั้งค่าเงินเดือน${editable ? "<br>กด “ตั้งค่ารอบนี้” เพื่อเริ่ม" : ""}</div>` : "";
  html += p.daily ? row(`ค่าแรงรายวัน · ${p.work} วัน × ${baht(p.rate)}`, baht(p.base)) : row("ฐานเงินเดือน", baht(p.base));
  if (p.h15) html += row(`OT 1.5 เท่า · ${p.h15} ชม. × ${baht(p.r15)}`, "+" + baht(p.ot15), "sub plus");
  if (p.h20) html += row(`OT 2 เท่า · ${p.h20} ชม. × ${baht(p.r20)}`, "+" + baht(p.ot20), "sub plus");
  if (p.h30) html += row(`OT 3 เท่า · ${p.h30} ชม. × ${baht(p.r30)}`, "+" + baht(p.ot30), "sub plus");
  if (p.shifts) html += row(`ค่ากะ · ${p.shifts} วัน × ${baht(p.shiftRate)}`, "+" + baht(p.shiftPay), "sub plus");
  p.incomes.forEach(x => html += row(esc(x.name || "รายรับ"), "+" + baht(x.amount), "sub plus"));
  p.dailyIncomes.forEach(x => html += row(`${esc(x.name || "รายรับรายวัน")} · ${x.days} วัน × ${baht(x.rate)}`, "+" + baht(x.total), "sub plus"));
  if (p.unpaid) html += row(`หักวันขาด/ไม่รับเงิน · ${p.unpaid} วัน`, "−" + baht(p.unpaidDeduct), "sub minus");
  p.deductions.forEach(x => html += row(esc(x.name || "รายการหัก"), "−" + baht(x.amount), "sub minus"));
  html += row("สุทธิ (คำนวณ)", baht(p.net), "total");
  $("slipRows").innerHTML = html;

  $("cmpEst").textContent = baht(p.net);
  $("cmpAct").textContent = p.actual !== null ? baht(p.actual) : "—";
  const diff = p.actual !== null ? p.actual - p.net : null;
  $("cmpDiff").textContent = diff === null ? "—" : (diff >= 0 ? "+" : "−") + baht(Math.abs(diff));
  $("cmpDiff").style.color = diff === null ? "" : diff >= 0 ? "var(--income)" : "var(--expense)";
  $("btnViewSlip").classList.toggle("hidden", !p.slipPath);
  $("btnEditActual").classList.toggle("hidden", !editable || !pRaw);
  $("btnEditActual").textContent = p.actual !== null || p.slipPath ? "✏️ แก้ไขยอดจริง / สลิป" : "✏️ บันทึกยอดจริง / แนบสลิป";
  renderActualHistory(mid, M, editable);
  $("btnPaySettings").classList.toggle("hidden", !editable);
  $("salReadonly").classList.toggle("hidden", editable);
  $("calHint").textContent = editable ? "แตะวันเพื่อบันทึก" : "ดูอย่างเดียว";
  renderCalendar(p, editable);

  // กราฟ 6 รอบล่าสุด: คำนวณ vs ได้จริง
  const months = []; for (let i = 5; i >= 0; i--) months.push(addMonths(M, -i));
  const ps = months.map(m => payFor(mid, m));
  barChart($("chartActual"), $("tipActual"), {
    labels: months.map(monthShort), stacked: false, emptyText: "ยังไม่มีข้อมูลเงินเดือนย้อนหลัง",
    series: [{ color: "color-mix(in srgb,var(--brand) 35%,transparent)", values: ps.map(x => x ? x.net : 0) }, { color: "var(--brand)", values: ps.map(x => x && x.actual !== null ? x.actual : 0) }],
    tip: (i) => { const x = ps[i]; if (!x) return `<b>${monthLabel(months[i])}</b><span>ไม่มีข้อมูล</span>`;
      const d = x.actual !== null ? x.actual - x.net : null;
      return `<b>${monthLabel(months[i])}</b><span>คำนวณ <b class="num">${baht(x.net)}</b></span><span>ได้จริง <b class="num">${x.actual !== null ? baht(x.actual) : "—"}</b></span>${d !== null ? `<span style="color:${d >= 0 ? "var(--income)" : "var(--expense)"}">ต่าง ${d >= 0 ? "+" : "−"}${baht(Math.abs(d))}</span>` : ""}`; }
  });
}
function renderCalendar(p, editable) {
  const { start, end } = p.range, mid = state.salMember, todayStr = ymd(today0());
  let html = WD.map(w => `<div class="cal-wd">${w}</div>`).join("");
  for (let i = 0; i < start.getDay(); i++) html += "<div></div>";
  eachDay(start, end, dt => {
    const s = ymd(dt), rec = dayRec(mid, s), st = rec ? statusOf(rec.status) : null;
    const cls = ["day", rec ? "rec" : "", s === todayStr ? "today" : "", s > todayStr ? "future" : ""].join(" ");
    const showMonth = dt.getDate() === 1 || +dt === +start;
    // ชั่วโมง OT แยกสีตามประเภท: ฟ้า 1.5 เท่า · ส้ม 2 เท่า · ชมพูเข้ม 3 เท่า
    const ots = rec ? [["ot15_hours", "--ot15"], ["ot20_hours", "--ot20"], ["ot30_hours", "--ot30"]].filter(([k]) => +rec[k]).map(([k, c]) => `<b style="--o:var(${c})">${+rec[k]}</b>`).join("") : "";
    html += `<button type="button" class="${cls}" data-day="${s}" ${editable ? "" : "disabled"} ${st ? `style="--c:var(${st[2]})"` : ""}
      aria-label="${esc(dayLabel(s))}${st ? " " + st[1] : ""}${rec && dayOtHours(rec) ? ` OT ${dayOtHours(rec)} ชั่วโมง` : ""}${rec?.has_shift ? " มีค่ากะ" : ""}${s > todayStr && rec ? " (บันทึกล่วงหน้า)" : ""}">
      ${rec?.has_shift ? `<span class="sh" aria-hidden="true"></span>` : ""}
      <span class="d num">${dt.getDate()}</span>${showMonth ? `<span class="m">${monthShort(dt)}</span>` : ""}
      ${ots ? `<span class="ots num">${ots}</span>` : `<span class="dot"></span>`}</button>`;
  });
  $("calGrid").innerHTML = html;
  $("calLegend").innerHTML = STATUSES.map(s => `<span><i style="background:var(${s[2]})"></i>${s[1]}</span>`).join("")
    + `<span><i style="background:var(--ot15);border-radius:3px"></i>OT 1.5×</span><span><i style="background:var(--ot20);border-radius:3px"></i>OT 2×</span><span><i style="background:var(--ot30);border-radius:3px"></i>OT 3×</span>`
    + `<span><i style="background:var(--shift);border-radius:2px;width:16px;height:5px"></i>แถบส้มด้านบน = มีค่ากะ</span><span><i style="border:1.5px dashed var(--brand);border-radius:3px;background:var(--brand-soft)"></i>ลายทาง = บันทึกล่วงหน้า</span>`;
}
document.addEventListener("click", (e) => {
  const vs = e.target.closest("[data-view-slip]"); if (vs) { const pp = payFor(vs.dataset.viewSlip, monthStart(state.anchor)); if (pp?.slipPath) openSlip(pp.slipPath, vs.dataset.viewSlip); return; }
  const c = e.target.closest("[data-sal-member]"); if (c) { state.salMember = c.dataset.salMember; renderSalary(); if (c.classList.contains("pcard")) window.scrollTo({ top: 0, behavior: "smooth" }); }
  const d = e.target.closest("[data-day]"); if (d && !d.disabled) openDaySheet(d.dataset.day);
});

/* ---------- actual pay (ยอดจริงตามสลิป) — แก้ได้ทุกรอบย้อนหลัง ---------- */
function renderActualHistory(mid, M, editable) {
  const rows = [];
  for (let i = 0; i < 12; i++) { const m = addMonths(M, -i), p = payFor(mid, m); if (p) rows.push({ m, p }); }
  $("actualHist").innerHTML = rows.length ? rows.map(({ m, p }) => { const d = p.actual !== null ? p.actual - p.net : null;
    return `<div class="hist-row"><div><b>${monthLabel(m)}</b><small class="num">คำนวณ ${baht(p.net)}${p.slipPath ? " · 🧾 มีสลิป" : ""}</small></div>
      <div class="num" style="text-align:right"><b>${p.actual !== null ? baht(p.actual) : "—"}</b>${d !== null ? `<small style="color:${d >= 0 ? "var(--income)" : "var(--expense)"}">${d >= 0 ? "+" : "−"}${baht(Math.abs(d))}</small>` : `<small>ยังไม่บันทึก</small>`}</div>
      ${editable ? `<button type="button" class="ed" data-edit-actual="${ymd(m)}">แก้ไข</button>` : p.slipPath ? `<button type="button" class="ed" data-hist-slip="${ymd(m)}">สลิป</button>` : "<span></span>"}</div>`; }).join("")
    : `<div class="empty">ยังไม่มีรอบที่ตั้งค่าเงินเดือน</div>`;
}
function openActual(mid, M) {
  state.act = { mid, M };
  const p = payFor(mid, M); if (!p) { toast("รอบนี้ยังไม่ได้ตั้งค่าเงินเดือน"); return; }
  $("actTitle").textContent = `ยอดจริง · ${memberName(mid)} · รอบ ${monthLabel(M)}`;
  $("inActual").value = p.actual !== null ? p.actual : "";
  $("actErr").textContent = "";
  paintActual();
  openSheet("sheetActual");
}
function paintActual() {
  const { mid, M } = state.act, p = payFor(mid, M);
  const v = $("inActual").value.trim() === "" ? null : round2($("inActual").value);
  $("actEst").textContent = baht(p.net);
  $("actNow").textContent = v !== null ? baht(v) : "—";
  const d = v !== null ? v - p.net : null;
  $("actDiff").textContent = d === null ? "—" : (d >= 0 ? "+" : "−") + baht(Math.abs(d));
  $("actDiff").style.color = d === null ? "" : d >= 0 ? "var(--income)" : "var(--expense)";
  $("actViewSlip").classList.toggle("hidden", !p.slipPath);
  $("actDelSlip").classList.toggle("hidden", !p.slipPath);
  $("actLblSlip").textContent = p.slipPath ? "📷 เปลี่ยนรูป" : "📷 แนบรูปสลิป";
  $("actDelAmount").classList.toggle("hidden", p.actual === null);
}
$("inActual").addEventListener("input", paintActual);
$("btnEditActual").onclick = () => openActual(state.salMember, monthStart(state.anchor));
document.addEventListener("click", (e) => {
  const ea = e.target.closest("[data-edit-actual]"); if (ea) openActual(state.salMember, parseYmd(ea.dataset.editActual));
  const hs = e.target.closest("[data-hist-slip]"); if (hs) { const M = parseYmd(hs.dataset.histSlip), p = payFor(state.salMember, M); if (p?.slipPath) openSlip(p.slipPath, state.salMember, M); }
});
const actRow = (actual_net, slip_path) => ({ family_id: state.family.id, member_id: state.act.mid, cycle_month: ymd(state.act.M), actual_net, slip_path, note: "" });
$("formActual").onsubmit = async (e) => {
  e.preventDefault();
  const p = payFor(state.act.mid, state.act.M), raw = $("inActual").value.trim();
  const v = raw === "" ? null : round2(raw);
  if (v !== null && !(v >= 0)) { $("actErr").textContent = "ใส่ตัวเลขให้ถูกต้อง"; return; }
  if (v === null && !p.slipPath) { $("actErr").textContent = "ใส่ยอดที่ได้จริง หรือแนบรูปสลิป"; return; }
  const btn = $("actSave"); btn.disabled = true;
  try { await api.saveActual(actRow(v, p.slipPath || null)); closeSheet("sheetActual"); toast("บันทึกยอดจริงแล้ว"); await reload(); }
  catch (err) { $("actErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};
$("actDelAmount").onclick = async () => {
  const p = payFor(state.act.mid, state.act.M);
  if (!confirm("ลบยอดจริงของรอบนี้?")) return;
  try {
    if (p.slipPath) await api.saveActual(actRow(null, p.slipPath)); else await api.deleteActual(state.act.mid, ymd(state.act.M));
    closeSheet("sheetActual"); toast("ลบยอดจริงแล้ว"); await reload();
  } catch (err) { $("actErr").textContent = friendlyError(err); }
};
$("inSlip").addEventListener("change", async () => {
  const file = $("inSlip").files[0]; $("inSlip").value = ""; if (!file) return;
  const { mid, M } = state.act, p = payFor(mid, M), cm = ymd(M);
  const typed = $("inActual").value.trim() === "" ? p.actual : round2($("inActual").value);
  const lbl = $("actLblSlip"); lbl.textContent = "กำลังอัปโหลด…";
  try {
    const path = await api.uploadSlip(`${state.family.id}/${mid}/${cm}-${Date.now()}.jpg`, await slipBlob(file));
    await api.saveActual(actRow(typed, path));
    if (p.slipPath && p.slipPath !== path) api.deleteSlip(p.slipPath).catch(() => {});
    toast("แนบรูปสลิปแล้ว"); await reload(); paintActual();
  } catch (err) { $("actErr").textContent = friendlyError(err); paintActual(); }
});
$("actViewSlip").onclick = () => { const p = payFor(state.act.mid, state.act.M); if (p?.slipPath) openSlip(p.slipPath, state.act.mid, state.act.M); };
$("actDelSlip").onclick = async () => {
  const p = payFor(state.act.mid, state.act.M);
  if (!p.slipPath || !confirm("ลบรูปสลิปของรอบนี้?")) return;
  try {
    await api.deleteSlip(p.slipPath);
    if (p.actual === null) await api.deleteActual(state.act.mid, ymd(state.act.M)); else await api.saveActual(actRow(p.actual, null));
    toast("ลบรูปสลิปแล้ว"); await reload(); paintActual();
  } catch (err) { $("actErr").textContent = friendlyError(err); }
};
$("btnViewSlip").onclick = () => openSlip(state.salPay.slipPath, state.salMember, monthStart(state.anchor));
async function openSlip(path, mid, M = monthStart(state.anchor)) {
  $("slipTitle").textContent = `สลิป ${memberName(mid)} · ${monthLabel(M)}`;
  $("slipImg").classList.add("hidden"); $("slipLoading").classList.remove("hidden"); $("slipLoading").textContent = "กำลังโหลดรูป…";
  $("slipOpen").classList.add("hidden");
  openSheet("sheetSlip");
  try {
    const url = await api.slipUrl(path);
    $("slipImg").onload = () => { $("slipLoading").classList.add("hidden"); $("slipImg").classList.remove("hidden"); };
    $("slipImg").src = url;
    $("slipOpen").href = url; $("slipOpen").classList.toggle("hidden", url.startsWith("data:"));
  } catch (err) { $("slipLoading").textContent = "เปิดรูปไม่ได้: " + friendlyError(err); }
}

/* ---------- day sheet ---------- */
const OT_KEYS = [["ot15_hours", "1.5 เท่า", "r15"], ["ot20_hours", "2 เท่า", "r20"], ["ot30_hours", "3 เท่า", "r30"]];
function setDayStatus(k) { state.day.status = k; document.querySelectorAll("#statusGrid [data-status]").forEach(b => b.setAttribute("aria-pressed", b.dataset.status === k)); updateDayEarn(); }
function setShift(on) { state.day.shift = on; $("swShift").setAttribute("aria-checked", on); updateDayEarn(); }
function updateDayEarn() {
  const p = state.salPay; if (!p || !$("in_ot15_hours")) return;
  const ot = OT_KEYS.reduce((a, [k, , rk]) => a + (+$("in_" + k).value || 0) * p[rk], 0);
  const sh = state.day.shift ? p.shiftRate : 0;
  $("dayEarn").textContent = `รายได้เพิ่มของวันนี้: OT ${baht(round2(ot))}${sh ? ` + ค่ากะ ${baht(sh)}` : ""} = ${baht(round2(ot + sh))}`;
}
function openDaySheet(date) {
  const rec = dayRec(state.salMember, date), p = state.salPay;
  state.day.date = date;
  $("dayTitle").textContent = `${dayLabel(date)} · ${memberName(state.salMember)}`;
  $("statusGrid").innerHTML = STATUSES.map(s => `<button type="button" class="st-btn" data-status="${s[0]}" style="--c:var(${s[2]})"><i></i>${s[1]}</button>`).join("");
  $("otFields").innerHTML = OT_KEYS.map(([k, label, rk]) => `
    <div><div class="ot-label">OT <b>${label}</b><br><span class="num">${baht(p[rk])}/ชม.</span></div>
      <div class="stepper"><button type="button" data-step="${k}" data-d="-0.5" aria-label="ลด">−</button>
      <input id="in_${k}" class="num" type="number" inputmode="decimal" min="0" max="24" step="0.5" value="${rec ? +rec[k] || "" : ""}" placeholder="0" aria-label="ชั่วโมง OT ${label}">
      <button type="button" data-step="${k}" data-d="0.5" aria-label="เพิ่ม">+</button></div></div>`).join("");
  $("shiftRateTxt").textContent = p.shiftRate ? `+${baht(p.shiftRate)} รวมเข้ารายได้ของวันนี้` : "ยังไม่ได้ตั้งค่ากะ (ตั้งได้ในตั้งค่ารอบ)";
  setShift(!!rec?.has_shift);
  setDayStatus(rec ? rec.status : (parseYmd(date).getDay() === 0 ? "off" : "work"));
  $("dayNote").value = rec?.note || ""; $("dayErr").textContent = "";
  $("btnClearDay").classList.toggle("hidden", !rec);
  openSheet("sheetDay");
}
$("shiftRow").addEventListener("click", () => setShift(!state.day.shift));
$("otFields").addEventListener("input", updateDayEarn);
document.addEventListener("click", (e) => {
  const s = e.target.closest("#statusGrid [data-status]"); if (s) setDayStatus(s.dataset.status);
  const st = e.target.closest("[data-step]");
  if (st) { const inp = $("in_" + st.dataset.step); inp.value = Math.min(24, Math.max(0, (+inp.value || 0) + +st.dataset.d)) || ""; updateDayEarn(); }
});
$("formDay").onsubmit = async (e) => {
  e.preventDefault();
  const row = { family_id: state.family.id, member_id: state.salMember, work_date: state.day.date, status: state.day.status, has_shift: state.day.shift, note: $("dayNote").value.trim() };
  for (const [k] of OT_KEYS) { const v = +$("in_" + k).value || 0; if (v < 0 || v > 24) { $("dayErr").textContent = "ชั่วโมง OT ต้องอยู่ระหว่าง 0–24"; return; } row[k] = Math.round(v * 10) / 10; }
  const btn = $("btnSaveDay"); btn.disabled = true;
  try { await api.saveWorkDay(row); closeSheet("sheetDay"); toast("บันทึกวันทำงานแล้ว"); await reload(); }
  catch (err) { $("dayErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};
$("btnClearDay").onclick = async () => {
  try { await api.deleteWorkDay(state.salMember, state.day.date); closeSheet("sheetDay"); toast("ล้างข้อมูลวันนี้แล้ว"); await reload(); }
  catch (err) { $("dayErr").textContent = friendlyError(err); }
};

/* ---------- editable line lists (incomes / deductions / bills) ---------- */
function renderLines(kind) {
  const items = state.draft[kind], ph = { incomes: "เช่น ค่าตำแหน่ง", dailyIncomes: "เช่น ค่าอาหาร", deductions: "เช่น ประกันสังคม", bills: "เช่น ค่าเช่าบ้าน", wizBills: "ชื่อรายการ" }[kind];
  const bills = kind === "bills";
  $("lines-" + kind).innerHTML = items.length ? items.map((x, i) => `
    <div class="li${bills ? " li-bill" : ""}"><input data-line="${kind}" data-i="${i}" data-k="name" maxlength="40" value="${esc(x.name)}" placeholder="${ph}" aria-label="ชื่อรายการ">
    <input data-line="${kind}" data-i="${i}" data-k="amount" class="num" type="number" inputmode="decimal" min="0" step="0.01" value="${x.amount || ""}" placeholder="บาท" aria-label="จำนวนเงิน">
    ${bills ? `<button type="button" data-mv-line="-1" data-i="${i}" aria-label="เลื่อนขึ้น (สำคัญกว่า)" ${i === 0 ? "disabled" : ""}>↑</button>
    <button type="button" data-mv-line="1" data-i="${i}" aria-label="เลื่อนลง" ${i === items.length - 1 ? "disabled" : ""}>↓</button>` : ""}
    <button type="button" data-rm-line="${kind}" data-i="${i}" aria-label="ลบรายการ">×</button></div>`).join("")
    : `<div class="muted" style="font-size:14px">ยังไม่มีรายการ</div>`;
  if (kind === "bills") $("billsDraftTotal").textContent = baht(sumItems(items));
}
document.addEventListener("input", (e) => {
  const l = e.target.closest("[data-line]"); if (!l) return;
  state.draft[l.dataset.line][+l.dataset.i][l.dataset.k] = l.value;
  if (l.dataset.line === "bills") $("billsDraftTotal").textContent = baht(sumItems(state.draft.bills));
});
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-add-line]"); if (a) { state.draft[a.dataset.addLine].push({ name: "", amount: "" }); renderLines(a.dataset.addLine); const ins = $("lines-" + a.dataset.addLine).querySelectorAll("input"); ins[ins.length - 2]?.focus(); }
  const mv = e.target.closest("[data-mv-line]");
  if (mv) { const a = state.draft.bills, i = +mv.dataset.i, j = i + +mv.dataset.mvLine; if (j >= 0 && j < a.length) { [a[i], a[j]] = [a[j], a[i]]; renderLines("bills"); } }
  const r = e.target.closest("[data-rm-line]"); if (r) { state.draft[r.dataset.rmLine].splice(+r.dataset.i, 1); renderLines(r.dataset.rmLine); }
});
const cleanLines = (arr) => arr.filter(x => String(x.name).trim() || +x.amount > 0).map(x => ({ name: String(x.name).trim() || "ไม่ระบุ", amount: round2(x.amount) }));

/* ---------- pay settings sheet ---------- */
function fillDaySelect(sel, val) { sel.innerHTML = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1 === 31 ? "31 (สิ้นเดือน)" : i + 1}</option>`).join(""); sel.value = String(val); }
function setPayType(t) {
  state.draft.payType = t;
  document.querySelectorAll("[data-paytype]").forEach(b => b.setAttribute("aria-pressed", b.dataset.paytype === t));
  $("psBaseLabel").textContent = t === "daily" ? "ค่าแรงต่อวัน (บาท)" : "ฐานเงินเดือน (บาท)";
  $("psTypeHint").textContent = t === "daily"
    ? "รายวัน: ได้ค่าแรงเฉพาะวันที่บันทึกว่า “มาทำงาน” ในปฏิทิน · OT ต่อชม. = ค่าแรง ÷ 8"
    : "รายเดือน: ได้เงินเดือนเต็มรอบ หักเฉพาะวัน “ขาด/ไม่รับเงิน” วันละ เงินเดือน ÷ 30 · OT ต่อชม. = เงินเดือน ÷ 240";
  updateRangePreview();
}
document.querySelectorAll("[data-paytype]").forEach(b => b.onclick = () => setPayType(b.dataset.paytype));
function updateRangePreview() {
  const M = monthStart(state.anchor), r = cycleRange(M, +$("psStart").value, +$("psEnd").value);
  const f = (d) => d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  $("psRangePreview").textContent = `รอบ ${monthLabel(M)} = ${f(r.start)} ถึง ${f(r.end)}`;
  const h = (+$("psBase").value || 0) / (state.draft.payType === "daily" ? 8 : 240);
  $("psOt15").placeholder = h ? round2(h * 1.5) : "อัตโนมัติ"; $("psOt20").placeholder = h ? round2(h * 2) : "อัตโนมัติ"; $("psOt30").placeholder = h ? round2(h * 3) : "อัตโนมัติ";
}
$("btnPaySettings").onclick = () => {
  const s = state.salPay.settings, M = monthStart(state.anchor);
  $("payTitle").textContent = `ตั้งค่าเงินเดือน · ${memberName(state.salMember)}`;
  $("payHint").textContent = `ค่าที่บันทึกจะใช้ตั้งแต่รอบ ${monthLabel(M)} เป็นต้นไป รอบก่อนหน้าไม่เปลี่ยน`;
  $("psBase").value = +s.base_salary || ""; $("psShift").value = +s.shift_rate || "";
  fillDaySelect($("psStart"), s.start_day); fillDaySelect($("psEnd"), s.end_day);
  $("psOt15").value = s.ot15_rate ?? ""; $("psOt20").value = s.ot20_rate ?? ""; $("psOt30").value = s.ot30_rate ?? "";
  state.draft.incomes = (s.incomes || []).map(x => ({ ...x })); state.draft.deductions = (s.deductions || []).map(x => ({ ...x }));
  state.draft.dailyIncomes = (s.daily_incomes || []).map(x => ({ ...x }));
  setPayType(s.pay_type === "daily" ? "daily" : "monthly");
  renderLines("incomes"); renderLines("deductions"); renderLines("dailyIncomes"); updateRangePreview(); $("payErr").textContent = "";
  openSheet("sheetPay");
};
["psStart", "psEnd", "psBase"].forEach(id => $(id).addEventListener("input", updateRangePreview));
$("formPay").onsubmit = async (e) => {
  e.preventDefault();
  const rate = (id) => { const v = $(id).value.trim(); return v === "" ? null : round2(v); };
  const row = {
    family_id: state.family.id, member_id: state.salMember, effective_month: ymd(monthStart(state.anchor)),
    pay_type: state.draft.payType === "daily" ? "daily" : "monthly",
    base_salary: Math.max(0, round2($("psBase").value)), shift_rate: Math.max(0, round2($("psShift").value)),
    start_day: +$("psStart").value, end_day: +$("psEnd").value,
    ot15_rate: rate("psOt15"), ot20_rate: rate("psOt20"), ot30_rate: rate("psOt30"),
    incomes: cleanLines(state.draft.incomes), deductions: cleanLines(state.draft.deductions)
  };
  const di = cleanLines(state.draft.dailyIncomes || []);
  if (di.length || (state.salPay.settings.daily_incomes || []).length) row.daily_incomes = di;
  const btn = $("btnSavePay"); btn.disabled = true;
  try { await api.savePaySettings(row); closeSheet("sheetPay"); toast("บันทึกการตั้งค่าแล้ว"); await reload(); }
  catch (err) { $("payErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};

/* ---------- bills sheet ---------- */
function openBills() {
  const M = monthStart(state.anchor), b = billsFor(ymd(M));
  $("billsTitle").textContent = `รายจ่ายหลัก · ${monthLabel(M)}`;
  $("billsHint").textContent = `เรียงจากสำคัญมากไปน้อย (บนสุดจ่ายก่อน) ใช้ปุ่ม ↑ ↓ จัดลำดับ · ใช้ตั้งแต่ ${monthLabel(M)} เป็นต้นไป เดือนที่ไม่ได้ตั้งจะใช้ของเดือนก่อนหน้า · ไม่ต้องบันทึกซ้ำในปุ่ม +`;
  state.draft.bills = (b?.items || []).map(x => ({ ...x }));
  if (!state.draft.bills.length) state.draft.bills.push({ name: "", amount: "" });
  renderLines("bills"); $("billsErr").textContent = "";
  openSheet("sheetBills");
}
$("btnEditBills2").onclick = openBills;
document.addEventListener("click", (e) => { if (e.target.closest("[data-open-bills]")) openBills(); });
$("formBills").onsubmit = async (e) => {
  e.preventDefault();
  const btn = $("btnSaveBills"); btn.disabled = true;
  try { await api.saveBills({ family_id: state.family.id, effective_month: ymd(monthStart(state.anchor)), items: cleanLines(state.draft.bills) }); closeSheet("sheetBills"); toast("บันทึกรายจ่ายหลักแล้ว"); await reload(); }
  catch (err) { $("billsErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};

/* =========================================================
   SHEETS + ADD TRANSACTION
   ========================================================= */
let lastFocus = null;
function openSheet(id) { lastFocus = document.activeElement; $(id).classList.remove("hidden"); }
function closeSheet(id) { $(id).classList.add("hidden"); lastFocus?.focus?.(); }
document.querySelectorAll(".scrim").forEach(sc => sc.addEventListener("click", (e) => { if (e.target === sc || e.target.closest("[data-close]")) closeSheet(sc.id); }));
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = [...document.querySelectorAll(".scrim")].filter(s => !s.classList.contains("hidden")).pop();
  if (open) closeSheet(open.id);
});

function renderWho() {
  const inc = state.tx.type === "income";
  $("whoLabel").textContent = inc ? "รายรับของใคร" : "ใครใช้จ่าย";
  const opts = state.members.map(m => ({ id: m.id, html: `${avatarHTML(m)}${esc(m.display_name)}` }))
    .concat([{ id: "shared", html: inc ? "🏠 ของบ้าน" : "🏠 ใช้ร่วมกัน" }]);
  $("whoGrid").innerHTML = opts.map(o => `<button type="button" class="chip" data-who="${esc(o.id)}" aria-pressed="${o.id === state.tx.who}">${o.html}</button>`).join("");
  $("txHint").classList.toggle("hidden", !inc || feat("salary_overview"));
  $("txHint").textContent = "บันทึกเงินเดือนที่ได้รับจริงเป็นรายรับหมวด “เงินเดือน” ได้ที่นี่ หน้าภาพรวมจะนับจากรายการนี้";
}
const chipsFor = (sel, extra = []) => state.members.map(m => ({ id: m.id, html: `${avatarHTML(m)}${esc(m.display_name)}` })).concat(extra)
  .map(o => `<button type="button" class="chip" data-pick="${esc(o.id)}" aria-pressed="${o.id === sel}">${o.html}</button>`).join("");
function renderLoanBox() {
  const t = state.tx, borrow = t.loanAction === "borrow";
  document.querySelectorAll("[data-loan-action]").forEach(b => b.setAttribute("aria-pressed", b.dataset.loanAction === t.loanAction));
  $("loanWhoLbl").textContent = borrow ? "ใครยืม" : "ใครคืน";
  $("loanWho").innerHTML = chipsFor(t.loanWho, [{ id: "other", html: "👤 คนนอกบ้าน" }]);
  $("loanNameField").classList.toggle("hidden", t.loanWho !== "other");
  const L = loanBook(); $("lenderList").innerHTML = L.filter(g => !g.memberId).map(g => `<option value="${esc(g.borrower)}">`).join("");
  $("loanSplitLbl").textContent = borrow ? "ให้ยืมจากบัญชีไหน เท่าไร (ใส่ได้หลายบัญชี)" : "รับเงินคืนเข้าบัญชีไหน เท่าไร";
  // ค้างคืนของคนนี้ แยกตามบัญชี
  const key = t.loanWho === "other" ? "n:" + ($("loanFrom").value.trim() || "") : "m:" + t.loanWho, g = L.find(x => x.key === key);
  const prev = {}; document.querySelectorAll("[data-split]").forEach(i => prev[i.dataset.split] = i.value);
  $("loanSplit").innerHTML = acctList().map(a => { const owe = g?.accts[a.id] || 0;
    return `<div class="split-row"><div><b>${esc(a.emoji)} ${esc(a.name)}</b><small class="num">ในบัญชี ${bahtR(acctBalance(a.id))}${owe > 0.004 ? ` · คนนี้ค้าง ${bahtR(owe)}` : ""}</small></div>
      <input class="num" type="number" inputmode="decimal" min="0" step="0.01" data-split="${esc(a.id)}" value="${prev[a.id] ?? (t.splitInit?.[a.id] || "")}" placeholder="0" aria-label="จำนวนจาก ${esc(a.name)}"></div>`; }).join("");
  t.splitInit = null;
  updLoanTotal(); updLoanHint();
  $("txNote").placeholder = borrow ? "ยืมไปทำอะไร" : "ไม่ใส่ก็ได้";
}
function updLoanHint() {
  const t = state.tx, key = t.loanWho === "other" ? "n:" + ($("loanFrom").value.trim() || "") : "m:" + t.loanWho, g = loanBook().find(x => x.key === key);
  $("loanHint").classList.toggle("hidden", !g);
  if (g) $("loanHint").innerHTML = `${esc(g.borrower)} ยืมไปทั้งหมด ${baht(g.borrowed)} · คืนแล้ว ${baht(g.repaid)} · <b>ค้าง ${baht(Math.max(0, g.left))}</b>`
    + Object.entries(g.accts).filter(([, v]) => v > 0.004).map(([k, v]) => `<br>↳ ${esc(acctName(k === MAIN ? null : k))} ค้าง ${baht(v)}`).join("");
}
function updLoanTotal() { const tot = [...document.querySelectorAll("[data-split]")].reduce((a, i) => a + (+i.value || 0), 0); $("loanTotal").textContent = baht(round2(tot)); return round2(tot); }
$("loanSplit").addEventListener("input", updLoanTotal);
function renderAdvBox() {
  const t = state.tx, pay = t.advAction === "pay";
  document.querySelectorAll("[data-adv-action]").forEach(b => b.setAttribute("aria-pressed", b.dataset.advAction === t.advAction));
  $("advPayLbl").textContent = pay ? "ใครออกเงิน" : "ใครคืนเงิน";
  $("advToLbl").textContent = pay ? "ออกให้ใคร" : "คืนให้ใคร";
  $("advPayer").innerHTML = chipsFor(t.advFrom); $("advTo").innerHTML = chipsFor(t.advTo);
  const A = advanceBook(), f = t.advFrom, to = t.advTo;
  let hint = state.members.length < 2 ? "ต้องมีสมาชิกในบ้านอย่างน้อย 2 คน" : "";
  if (f && to && f !== to) { const p = A.pairs.find(x => (x.from === f && x.to === to) || (x.from === to && x.to === f));
    hint = p ? `ตอนนี้ ${esc(memberName(p.from))} ค้างคืน ${esc(memberName(p.to))} <b class="num">${bahtR(p.amount)}</b>` : "ตอนนี้สองคนนี้ไม่มียอดค้างกัน"; }
  if (f && f === to) hint = "เลือกคนละคนกัน";
  $("advHint").classList.toggle("hidden", !hint); $("advHint").innerHTML = hint;
  $("txNote").placeholder = pay ? "ออกค่าอะไรให้" : "ไม่ใส่ก็ได้";
}
function setTxType(type, keepCat = false) {
  state.tx.type = type;
  document.querySelectorAll("#formTx [data-type]").forEach(b => b.setAttribute("aria-pressed", b.dataset.type === type));
  const flow = type === "expense" || type === "income";
  document.querySelector("#formTx .amount-box").classList.toggle("hidden", type === "loan");
  $("flowBox").classList.toggle("hidden", !flow); $("loanBox").classList.toggle("hidden", type !== "loan"); $("advBox").classList.toggle("hidden", type !== "advance");
  $("txHint").classList.add("hidden");
  if (flow) {
    if (!keepCat || !state.tx.category) state.tx.category = CATEGORIES[type][0][0];
    $("catGrid").innerHTML = CATEGORIES[type].map(([c, e]) => `<button type="button" class="cat-btn" data-cat="${esc(c)}" aria-pressed="${c === state.tx.category}"><span class="e">${e}</span>${esc(c)}</button>`).join("");
    $("txNote").placeholder = "ไม่ใส่ก็ได้";
    renderWho();
  } else if (type === "loan") renderLoanBox(); else renderAdvBox();
  $("recurRow").classList.toggle("hidden", !flow || !!state.tx.edit || !feat("recurring"));
  renderQuick();
}
// รายการที่ใช้บ่อย: จาก 120 วันล่าสุด จับกลุ่ม หมวด+โน้ต+จำนวน+ใคร
function renderQuick() {
  const t = state.tx, el = $("quickRow");
  if (t.edit || (t.type !== "expense" && t.type !== "income")) { el.classList.add("hidden"); return; }
  const since = ymd(addDays(today0(), -120)), freq = {};
  state.data.txs.filter(x => x.type === t.type && x.category !== SAVE_CAT && countable(x) && x.tx_date >= since && !x.recurring_id).forEach(x => {
    const who = x.scope === "shared" ? "shared" : x.member_id, k = [x.category, x.note || "", +x.amount, who].join("|"); freq[k] = (freq[k] || 0) + 1; });
  const top = Object.entries(freq).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8);
  el.classList.toggle("hidden", !top.length);
  el.innerHTML = top.map(([k]) => { const [c, n, a, w] = k.split("|");
    return `<button type="button" data-quick="${esc(k)}"><b>${catIcon(t.type, c)} ${esc(n || c)}</b>${bahtR(a)} · ${w === "shared" ? "ร่วมกัน" : esc(memberName(w))}</button>`; }).join("");
}
$("quickRow").addEventListener("click", (e) => {
  const b = e.target.closest("[data-quick]"); if (!b) return;
  const [c, n, a, w] = b.dataset.quick.split("|");
  state.tx.category = c; state.tx.who = state.members.some(m => m.id === w) || w === "shared" ? w : "shared";
  $("txAmount").value = a; $("txNote").value = n; setTxType(state.tx.type, true); toast("กรอกให้แล้ว ตรวจแล้วกดบันทึก");
});
$("recurRow").addEventListener("click", () => { const sw = $("swRecur"); sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") !== "true"); updRecurTxt(); });
$("txDate").addEventListener("change", updRecurTxt);
function updRecurTxt() { const d = $("txDate").value ? parseYmd($("txDate").value) : today0(); $("recurTxt").textContent = `บันทึกให้อัตโนมัติทุกวันที่ ${d.getDate()} ของเดือน`; }
document.querySelectorAll("#formTx [data-type]").forEach(b => b.onclick = () => setTxType(b.dataset.type));
document.querySelectorAll("[data-loan-action]").forEach(b => b.onclick = () => { state.tx.loanAction = b.dataset.loanAction; renderLoanBox(); });
document.querySelectorAll("[data-adv-action]").forEach(b => b.onclick = () => { state.tx.advAction = b.dataset.advAction; renderAdvBox(); });
$("loanWho").addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (b) { state.tx.loanWho = b.dataset.pick; renderLoanBox(); } });
$("loanFrom").addEventListener("input", updLoanHint);
$("advPayer").addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (b) { state.tx.advFrom = b.dataset.pick; renderAdvBox(); } });
$("advTo").addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (b) { state.tx.advTo = b.dataset.pick; renderAdvBox(); } });
$("whoGrid").addEventListener("click", (e) => { const b = e.target.closest("[data-who]"); if (!b) return; state.tx.who = b.dataset.who; renderWho(); });
$("catGrid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  state.tx.category = b.dataset.cat; $("catGrid").querySelectorAll("[data-cat]").forEach(x => x.setAttribute("aria-pressed", x === b));
});
function openAdd(o = {}) {
  const others = state.members.filter(m => m.id !== state.me.id), ed = o.edit || null, de = o.editDebt || null;
  state.tx.edit = ed; state.tx.editDebt = de;
  Object.assign(state.tx, { who: o.who || "shared", loanAction: o.loanAction || "borrow", loanWho: o.loanWho || "other", splitInit: o.splitInit || null,
    advAction: o.advAction || "pay", advFrom: o.advFrom || state.me.id, advTo: o.advTo || others[0]?.id || null, category: null });
  $("loanFrom").value = o.lender || ""; $("loanSplit").innerHTML = "";
  $("txAmount").value = o.amount || ""; $("txNote").value = ""; $("txErr").textContent = "";
  const t = today0(), r = periodRange(effPeriod());
  $("txDate").value = o.date || ymd(t >= r.start && t <= r.end ? t : (effPeriod() === "all" ? t : r.start));
  $("swRecur").setAttribute("aria-checked", "false");
  if (ed) {
    Object.assign(state.tx, { who: ed.scope === "shared" ? "shared" : ed.member_id, category: ed.category });
    $("txAmount").value = ed.amount; $("txNote").value = ed.note || ""; $("txDate").value = ed.tx_date;
  }
  if (de) {
    if (de.kind === "loan") { const init = {}; (state.data.moves || []).filter(m => m.debt_id === de.id).forEach(m => init[acctKey(m.account_id)] = (init[acctKey(m.account_id)] || 0) + +m.amount);
      Object.assign(state.tx, { loanAction: de.action, loanWho: de.member_id || "other", splitInit: Object.keys(init).length ? init : { [MAIN]: +de.amount } }); }
    else Object.assign(state.tx, { advAction: de.action, advFrom: de.member_id, advTo: de.other_id });
    $("loanFrom").value = de.kind === "loan" && !de.member_id ? de.member_name : "";
    $("txAmount").value = de.amount; $("txNote").value = de.note || ""; $("txDate").value = de.tx_date;
  }
  $("txTitle").textContent = ed || de ? "แก้ไขรายการ" : "บันทึกรายการ";
  // ตอนแก้ไข: เปลี่ยนได้แค่ในกลุ่มเดียวกัน (รับ/จ่าย หรือ กู้ยืม หรือ ออกให้ก่อน)
  document.querySelectorAll("#formTx [data-type]").forEach(b => b.disabled = !!(ed && !["expense", "income"].includes(b.dataset.type)) || !!(de && b.dataset.type !== (de.kind === "loan" ? "loan" : "advance")));
  $("btnDelInSheet")?.classList.toggle("hidden", !(ed || de));
  updRecurTxt();
  setTxType(de ? (de.kind === "loan" ? "loan" : "advance") : ed ? ed.type : (o.type || "expense"), !!ed);
  openSheet("sheetTx"); if (!ed && !de) setTimeout(() => $("txAmount").focus(), 60);
}
$("btnAdd").onclick = () => openAdd({}); // เริ่มที่ “รายจ่าย” เสมอ
$("btnDelInSheet").onclick = async () => {
  const t = state.tx; if (!(t.edit || t.editDebt) || !confirm(t.edit ? delTxMsg(t.edit.id) : "ลบรายการนี้?")) return;
  try { if (t.edit) await deleteTxCascade(t.edit.id); else await api.deleteDebt(t.editDebt.id); closeSheet("sheetTx"); toast("ลบรายการแล้ว"); await reload(); }
  catch (err) { $("txErr").textContent = friendlyError(err); }
};
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-del],[data-del-debt]")) return;
  const r = e.target.closest("[data-edit-tx]"); if (r) { const t = state.data.txs.find(x => x.id === r.dataset.editTx); if (t) openAdd({ edit: t }); }
  const d = e.target.closest("[data-edit-debt]"); if (d) { const t = (state.data.debts || []).find(x => x.id === d.dataset.editDebt); if (t) openAdd({ editDebt: t }); }
});
document.addEventListener("keydown", (e) => { if (e.key !== "Enter") return; const r = e.target.closest?.("[data-edit-tx],[data-edit-debt]"); if (r) r.click(); });
document.addEventListener("click", (e) => {
  const r = e.target.closest("[data-repay]");
  if (r) { const [key, left] = r.dataset.repay.split("|"); const g = loanBook().find(x => x.key === key); if (!g) return;
    // เสนอให้คืนเข้าบัญชีเดิมที่ให้ยืมไป ตามสัดส่วนที่ค้าง
    const init = {}; Object.entries(g.accts).forEach(([k, v]) => { if (v > 0.004) init[k] = round2(v); });
    if (!Object.keys(init).length) init[MAIN] = round2(left);
    openAdd({ type: "loan", loanAction: "repay", loanWho: g.memberId || "other", lender: g.memberId ? "" : g.borrower, splitInit: init }); }
  const st = e.target.closest("[data-settle]");
  if (st) { const [from, to, amt] = st.dataset.settle.split("|"); openAdd({ type: "advance", advAction: "settle", advFrom: from, advTo: to, amount: round2(amt) }); }
  const nd = e.target.closest("[data-new-debt]"); if (nd) openAdd({ type: nd.dataset.newDebt });
});
$("formTx").onsubmit = async (e) => {
  e.preventDefault();
  const t = state.tx, amount = round2($("txAmount").value);
  if (t.type !== "loan" && !(amount > 0)) { $("txErr").textContent = "ใส่จำนวนเงินมากกว่า 0"; $("txAmount").focus(); return; }
  if (!$("txDate").value) { $("txErr").textContent = "เลือกวันที่"; return; }
  if (t.type === "loan" || t.type === "advance") {
    let row;
    if (t.type === "loan") {
      const name = t.loanWho === "other" ? $("loanFrom").value.trim() : memberName(t.loanWho);
      if (!name) { $("txErr").textContent = "ใส่ชื่อคนยืม"; $("loanFrom").focus(); return; }
      const splits = [...document.querySelectorAll("[data-split]")].filter(i => +i.value > 0).map(i => ({ id: i.dataset.split, amount: round2(i.value) }));
      if (!splits.length) { $("txErr").textContent = "ใส่จำนวนเงินอย่างน้อย 1 บัญชี"; return; }
      t.splits = splits;
      row = { kind: "loan", action: t.loanAction, member_id: t.loanWho === "other" ? null : t.loanWho, member_name: name, other_id: null, other_name: splits.map(x => acctName(x.id === MAIN ? null : x.id)).join(", ").slice(0, 40) };
    } else {
      if (!t.advFrom || !t.advTo || t.advFrom === t.advTo) { $("txErr").textContent = "เลือกคนออกเงินและคนรับ ให้เป็นคนละคน"; return; }
      row = { kind: "advance", action: t.advAction, member_id: t.advFrom, member_name: memberName(t.advFrom), other_id: t.advTo, other_name: memberName(t.advTo) };
    }
    const btn = $("btnSaveTx"); btn.disabled = true;
    try { const amt = t.type === "loan" ? round2(t.splits.reduce((a, x) => a + x.amount, 0)) : amount;
      const body = { ...row, amount: amt, note: $("txNote").value.trim(), tx_date: $("txDate").value };
      let debtId;
      if (t.editDebt) { await api.updateDebt(t.editDebt.id, body); debtId = t.editDebt.id; if (t.type === "loan") await api.deleteMovesByDebt(debtId); }
      else debtId = (await api.addDebt({ family_id: state.family.id, ...body })).id;
      if (t.type === "loan") await api.addMoves(t.splits.map(x => ({ family_id: state.family.id, account_id: x.id === MAIN ? null : x.id, kind: t.loanAction === "borrow" ? "loan_out" : "loan_in", amount: x.amount, note: `${t.loanAction === "borrow" ? "ให้" : "รับคืนจาก"} ${row.member_name}${t.loanAction === "borrow" ? " ยืม" : ""}`, move_date: body.tx_date, slip_path: null, debt_id: debtId })));
      closeSheet("sheetTx"); toast("บันทึกแล้ว"); await reload(); }
    catch (err) { $("txErr").textContent = friendlyError(err); }
    finally { btn.disabled = false; }
    return;
  }
  const shared = state.tx.who === "shared";
  const btn = $("btnSaveTx"); btn.disabled = true;
  try {
    const body = { member_id: shared ? (t.edit && t.edit.scope === "shared" ? t.edit.member_id : state.me.id) : state.tx.who, type: state.tx.type, scope: shared ? "shared" : "personal",
      amount, category: state.tx.category, note: $("txNote").value.trim(), tx_date: $("txDate").value };
    if (t.edit) await api.updateTx(t.edit.id, body);
    else if ($("swRecur").getAttribute("aria-checked") === "true" && feat("recurring")) {
      const d = parseYmd(body.tx_date), rec = await api.addRecurring({ family_id: state.family.id, ...body, day_of_month: d.getDate(), start_month: ymd(monthStart(d)) });
      await api.addTx({ family_id: state.family.id, ...body, recurring_id: rec.id, recurring_month: ymd(monthStart(d)) });
    } else await api.addTx({ family_id: state.family.id, ...body });
    closeSheet("sheetTx"); toast("บันทึกแล้ว");
    const d = parseYmd($("txDate").value), r = periodRange(effPeriod());
    if (effPeriod() !== "all" && (d < r.start || d > r.end)) state.anchor = d;
    await reload();
  } catch (err) { $("txErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};

/* ---------- family settings / reset ---------- */
function renderRecurringList() {
  const list = [...(state.data.recurring || [])].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  $("recurList").innerHTML = list.length ? list.map(r => { const mine = r.created_by === state.user.id || can("tx_all");
    return `<div class="perm-row"><div style="min-width:0"><b>${catIcon(r.type, r.category)} ${esc(r.note || r.category)} <span class="num" style="color:${r.type === "income" ? "var(--income)" : "var(--expense)"}">${r.type === "income" ? "+" : "−"}${bahtR(r.amount)}</span></b>
      <small>ทุกวันที่ ${r.day_of_month} · ${r.scope === "shared" ? "ใช้ร่วมกัน" : esc(memberName(r.member_id))} · เริ่ม ${monthLabel(parseYmd(r.start_month))}${r.active ? "" : " · หยุดชั่วคราว"}</small></div>
      <div style="display:flex;gap:6px;align-items:center">${mine ? `<button type="button" class="switch brand" role="switch" aria-checked="${!!r.active}" aria-label="เปิดใช้งาน" data-rec-toggle="${esc(r.id)}"></button>
        <button type="button" class="rm-btn" style="margin:0" data-rec-del="${esc(r.id)}">ลบ</button>` : ""}</div></div>`; }).join("")
    : `<div class="muted" style="font-size:14px">ยังไม่มีรายการประจำ</div>`;
}
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-rec-toggle]"), d = e.target.closest("[data-rec-del]"); if (!t && !d) return;
  try {
    if (t) { const r = state.data.recurring.find(x => x.id === t.dataset.recToggle); await api.updateRecurring(r.id, { active: !r.active }); toast(r.active ? "หยุดชั่วคราวแล้ว" : "เปิดใช้งานแล้ว"); }
    else { if (!confirm("ลบรายการประจำนี้? (รายการที่บันทึกไปแล้วยังอยู่)")) return; await api.deleteRecurring(d.dataset.recDel); toast("ลบแล้ว"); }
    await reload();
  } catch (err) { toast(friendlyError(err)); }
});
let installEvt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; if (state.tab === "settings") renderInstall(); });
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
function installText() {
  if (isStandalone()) return "ติดตั้งเป็นแอปบนเครื่องนี้แล้ว ✓";
  if (isIOS()) return "iPhone/iPad: เปิดใน Safari → กดปุ่มแชร์ (สี่เหลี่ยมมีลูกศรขึ้น) → “เพิ่มไปยังหน้าจอโฮม”";
  return installEvt ? "กดปุ่มด้านล่าง แล้วสมุดบ้านจะมีไอคอนบนหน้าจอ เปิดเต็มจอเหมือนแอปทั่วไป" : "Android: เปิดใน Chrome → เมนู ⋮ → “ติดตั้งแอป” หรือ “เพิ่มลงในหน้าจอหลัก”";
}
function renderInstall() { $("installTxt").textContent = installText(); $("btnInstall").classList.toggle("hidden", !installEvt || isStandalone()); }
$("btnInstall").onclick = async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; renderInstall(); };
$("btnWizard").onclick = () => openWizard(true);

/* ---------- ตัวช่วยตั้งค่าครั้งแรก ---------- */
const WZ_KEY = () => "samudbaan-setup-" + state.me.id;
let wz = null;
function maybeWizard() {
  if (wz || !state.me) return;
  let done = false; try { done = !!localStorage.getItem(WZ_KEY()); } catch (e) { done = true; }
  if (done) return;
  const hasPay = (state.data.settings || []).some(x => x.member_id === state.me.id), hasTx = state.data.txs.some(t => t.created_by === state.user.id);
  if (!hasPay && !hasTx) openWizard(false);
}
function openWizard() {
  const steps = ["welcome"];
  if (feat("salary")) steps.push("pay");
  if (can("bills")) steps.push("bills");
  if (can("family")) steps.push("features");
  steps.push("done");
  const st = settingsFor(state.me.id, ymd(monthStart(today0())));
  wz = { steps, i: 0, name: meMember().display_name, payType: st?.pay_type || "monthly", base: st ? +st.base_salary : "", sd: st ? st.start_day : 1, ed: st ? st.end_day : 31,
    bills: (billsFor(ymd(monthStart(today0())))?.items || []).map(x => ({ ...x })), feats: Object.fromEntries(FEATURES.map(f => [f[0], feat(f[0])])) };
  paintWizard(); openSheet("sheetWizard");
}
const WZ_SUGG = ["ค่าเช่า/ผ่อนบ้าน", "ค่าน้ำค่าไฟ", "อินเทอร์เน็ต/มือถือ", "ผ่อนรถ", "ค่าเทอมลูก", "ประกัน"];
function paintWizard() {
  const k = wz.steps[wz.i], last = wz.i === wz.steps.length - 1;
  $("wzSteps").innerHTML = wz.steps.map((_, i) => `<i class="${i <= wz.i ? "on" : ""}"></i>`).join("");
  $("wzBack").classList.toggle("hidden", wz.i === 0); $("wzSkip").classList.toggle("hidden", last || k === "welcome");
  $("wzNext").textContent = last ? "เริ่มใช้งาน" : "ถัดไป"; $("wzErr").textContent = "";
  const days = (sel) => Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${+sel === i + 1 ? "selected" : ""}>${i + 1 === 31 ? "31 (สิ้นเดือน)" : i + 1}</option>`).join("");
  const B = {
    welcome: `<div class="wiz-hero">👋</div><h2 id="wzTitle" style="text-align:center">ยินดีต้อนรับสู่สมุดบ้าน</h2>
      <p class="muted" style="text-align:center;margin:-6px 0 16px">ตั้งค่าสั้น ๆ ไม่ถึง 1 นาที แล้วเริ่มจดได้เลย ข้ามขั้นไหนก็ได้ ตั้งทีหลังได้เสมอ</p>
      <div class="field"><label for="wzName">ชื่อที่คนในบ้านเห็น</label><input id="wzName" maxlength="40" value="${esc(wz.name)}"></div>`,
    pay: `<div class="wiz-hero">💼</div><h2 id="wzTitle">ค่าจ้างของคุณ</h2><p class="muted" style="margin:-6px 0 12px">ใช้คำนวณเงินเดือน OT และเงินเหลือของบ้าน (คนในบ้านจะเห็นยอดนี้)</p>
      <div class="seg" role="group" aria-label="รูปแบบค่าจ้าง"><button type="button" data-wz-pay="monthly" aria-pressed="${wz.payType === "monthly"}">รายเดือน</button><button type="button" data-wz-pay="daily" aria-pressed="${wz.payType === "daily"}">รายวัน</button></div>
      <div class="field"><label for="wzBase">${wz.payType === "daily" ? "ค่าแรงต่อวัน (บาท)" : "เงินเดือน (บาท)"}</label><input id="wzBase" class="num" type="number" inputmode="decimal" min="0" value="${wz.base || ""}" placeholder="0"></div>
      <div class="grid2"><div class="field"><label for="wzSd">ตัดรอบเริ่มวันที่</label><select id="wzSd">${days(wz.sd)}</select></div><div class="field"><label for="wzEd">ถึงวันที่</label><select id="wzEd">${days(wz.ed)}</select></div></div>`,
    bills: `<div class="wiz-hero">🏠</div><h2 id="wzTitle">รายจ่ายหลักของบ้าน</h2><p class="muted" style="margin:-6px 0 10px">ค่าใช้จ่ายที่ต้องจ่ายทุกเดือน เรียงจากสำคัญมากไปน้อย (แก้ทีหลังได้)</p>
      <div class="sugg">${WZ_SUGG.map(n => `<button type="button" data-wz-sugg="${esc(n)}">+ ${esc(n)}</button>`).join("")}</div>
      <div id="lines-wizBills" class="list-edit"></div>`,
    features: `<div class="wiz-hero">🧩</div><h2 id="wzTitle">เลือกสิ่งที่บ้านนี้จะใช้</h2><p class="muted" style="margin:-6px 0 6px">ปิดสิ่งที่ไม่ใช้ แอปจะดูง่ายขึ้น เปิดเพิ่มได้ในหน้าตั้งค่า</p>
      ${FEATURES.filter(f => !["bills_overview", "shift", "slips", "deposit", "heatmap"].includes(f[0])).map(([fk, name, desc]) => `<div class="perm-row"><div><b>${esc(name)}</b><small>${esc(desc)}</small></div>
        <button type="button" class="switch brand" role="switch" aria-checked="${!!wz.feats[fk]}" data-wz-feat="${fk}" aria-label="${esc(name)}"></button></div>`).join("")}`,
    done: `<div class="wiz-hero">🎉</div><h2 id="wzTitle" style="text-align:center">พร้อมแล้ว!</h2>
      <p class="muted" style="text-align:center;margin:-6px 0 14px">กดปุ่ม <b>+</b> ด้านล่างเพื่อจดรายจ่ายแรก · ชวนคนในบ้านด้วยรหัส <b>${esc(state.family.invite_code)}</b> (ในหน้าตั้งค่า)</p>
      <div class="hint">📲 ${esc(installText())}</div>${installEvt ? `<button type="button" class="btn btn-soft btn-block" id="wzInstall">ติดตั้งแอปบนเครื่องนี้</button>` : ""}`
  };
  $("wzBody").innerHTML = B[k];
  if (k === "bills") { state.draft.wizBills = wz.bills; renderLines("wizBills"); }
}
function wzCollect() {
  const k = wz.steps[wz.i];
  if (k === "welcome") wz.name = $("wzName").value.trim() || wz.name;
  if (k === "pay") { wz.base = $("wzBase").value; wz.sd = +$("wzSd").value; wz.ed = +$("wzEd").value; }
  if (k === "bills") wz.bills = state.draft.wizBills;
}
$("wzBody").addEventListener("click", (e) => {
  const p = e.target.closest("[data-wz-pay]"); if (p) { wzCollect(); wz.payType = p.dataset.wzPay; paintWizard(); }
  const sg = e.target.closest("[data-wz-sugg]"); if (sg) { wzCollect(); if (!wz.bills.some(b => b.name === sg.dataset.wzSugg)) wz.bills.push({ name: sg.dataset.wzSugg, amount: "" }); state.draft.wizBills = wz.bills; renderLines("wizBills"); const ins = $("lines-wizBills").querySelectorAll('[data-k="amount"]'); ins[ins.length - 1]?.focus(); }
  const f = e.target.closest("[data-wz-feat]"); if (f) { wz.feats[f.dataset.wzFeat] = !wz.feats[f.dataset.wzFeat]; f.setAttribute("aria-checked", wz.feats[f.dataset.wzFeat]); }
  if (e.target.closest("#wzInstall")) $("btnInstall").click();
});
$("wzBack").onclick = () => { wzCollect(); wz.i--; paintWizard(); };
$("wzSkip").onclick = () => { wz.i++; paintWizard(); };
async function finishWizard() { try { localStorage.setItem(WZ_KEY(), "1"); } catch (e) {} closeSheet("sheetWizard"); wz = null; }
$("formWizard").onsubmit = async (e) => {
  e.preventDefault(); wzCollect();
  const k = wz.steps[wz.i], btn = $("wzNext"); btn.disabled = true;
  try {
    if (k === "welcome" && wz.name !== meMember().display_name) { await api.updateMe(state.me.id, { display_name: wz.name }); await refreshFamily(); }
    if (k === "pay" && +wz.base > 0) { // รวมกับค่าที่มีอยู่ ไม่ล้างรายรับ/รายการหักเดิม
      const cur = settingsFor(state.me.id, ymd(monthStart(today0()))) || {};
      const keep = ["shift_rate", "ot15_rate", "ot20_rate", "ot30_rate", "incomes", "deductions"].reduce((o, k2) => (o[k2] = cur[k2] ?? (k2 === "incomes" || k2 === "deductions" ? [] : k2 === "shift_rate" ? 0 : null), o), {});
      if (cur.daily_incomes?.length) keep.daily_incomes = cur.daily_incomes;
      await api.savePaySettings({ family_id: state.family.id, member_id: state.me.id, effective_month: ymd(monthStart(today0())), ...keep,
        pay_type: wz.payType, base_salary: round2(wz.base), start_day: wz.sd, end_day: wz.ed }); }
    if (k === "bills") { const items = cleanLines(wz.bills || []); if (items.length) await api.saveBills({ family_id: state.family.id, effective_month: ymd(monthStart(today0())), items }); }
    if (k === "features") { await api.updateFamily(state.family.id, { features: { ...(state.family.features || {}), ...wz.feats } }); await refreshFamily(); }
    if (k === "done") { await finishWizard(); await reload(); return; }
    wz.i++; paintWizard();
  } catch (err) { $("wzErr").textContent = friendlyError(err); }
  finally { btn.disabled = false; }
};
$("sheetWizard").addEventListener("click", (e) => { if (e.target === $("sheetWizard")) finishWizard(); });

function applyTheme(t) {
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("samudbaan-theme", t); } catch (e) {}
  document.querySelectorAll("[data-theme-opt]").forEach(b => b.setAttribute("aria-pressed", b.dataset.themeOpt === t));
  if (state.family) renderAll(); // วาดกราฟใหม่ให้สีตรงธีม
}
const currentTheme = () => document.documentElement.dataset.theme || "auto";
const currentPalette = () => document.documentElement.dataset.palette || "forest";
function applyPalette(p) {
  if (p && p !== "forest") document.documentElement.dataset.palette = p; else delete document.documentElement.dataset.palette;
  try { localStorage.setItem("samudbaan-palette", p); } catch (e) {}
  document.querySelectorAll("[data-palette]").forEach(b => b.setAttribute("aria-pressed", b.dataset.palette === currentPalette()));
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--p-h1-l").trim() || "#16614F";
  if (state.family) renderAll();
}
document.querySelectorAll(".swatch[data-palette]").forEach(b => b.onclick = () => applyPalette(b.dataset.palette));
document.querySelectorAll("[data-theme-opt]").forEach(b => b.onclick = () => applyTheme(b.dataset.themeOpt));
function paintProfileEditors() {
  const famLetter = initial(state.family.name.replace(/^บ้าน\s*/, "") || "บ้าน"), me = meMember();
  const famAv = state.draft.famAv !== undefined ? state.draft.famAv : state.family.avatar_url;
  const myAv = state.draft.myAv !== undefined ? state.draft.myAv : me.avatar_url;
  paintAvatar($("setFamAv"), famAv, famLetter, "linear-gradient(150deg,var(--hero-1),var(--hero-2))");
  paintAvatar($("setMyAv"), myAv, initial(me.display_name), avColor(memberIdx(me.id)));
  $("btnRmFamPhoto").classList.toggle("hidden", !famAv); $("btnRmMyPhoto").classList.toggle("hidden", !myAv);
}
async function pickAvatar(input, key) {
  const f = input.files[0]; input.value = ""; if (!f) return;
  try { state.draft[key] = await avatarDataUrl(f); paintProfileEditors(); }
  catch (err) { $("profErr").textContent = friendlyError(err); }
}
$("inFamPhoto").addEventListener("change", () => pickAvatar($("inFamPhoto"), "famAv"));
$("inMyPhoto").addEventListener("change", () => pickAvatar($("inMyPhoto"), "myAv"));
$("btnRmFamPhoto").onclick = () => { state.draft.famAv = null; paintProfileEditors(); };
$("btnRmMyPhoto").onclick = () => { state.draft.myAv = null; paintProfileEditors(); };
async function refreshFamily() {
  const fam = await api.getMyFamily(state.user.id);
  if (fam) Object.assign(state, { family: fam.family, me: fam.me, members: fam.members });
  renderAll();
}
$("btnSaveFam").onclick = async () => {
  const name = $("inFamName").value.trim(); $("profErr").textContent = "";
  if (!name) { $("profErr").textContent = "ใส่ชื่อบ้านก่อน"; return; }
  const patch = { name }; if (state.draft.famAv !== undefined) patch.avatar_url = state.draft.famAv;
  const btn = $("btnSaveFam"); btn.disabled = true;
  try { await api.updateFamily(state.family.id, patch); delete state.draft.famAv; await refreshFamily(); toast("บันทึกข้อมูลบ้านแล้ว"); }
  catch (err) { $("profErr").textContent = friendlyError(err).includes("avatar_url") ? "ให้รัน schema_phase5.sql ก่อน" : friendlyError(err); }
  finally { btn.disabled = false; }
};
$("btnSaveMe").onclick = async () => {
  const name = $("inMyName").value.trim(); $("profErr").textContent = "";
  if (!name) { $("profErr").textContent = "ใส่ชื่อของคุณก่อน"; return; }
  const patch = { display_name: name }; if (state.draft.myAv !== undefined) patch.avatar_url = state.draft.myAv;
  const btn = $("btnSaveMe"); btn.disabled = true;
  try { await api.updateMe(state.me.id, patch); delete state.draft.myAv; await refreshFamily(); toast("บันทึกโปรไฟล์แล้ว"); }
  catch (err) { $("profErr").textContent = friendlyError(err).includes("avatar_url") ? "ให้รัน schema_phase5.sql ก่อน" : friendlyError(err); }
  finally { btn.disabled = false; }
};
function openSettings(keepOpen) {
  const owner = isOwner(), canFam = can("family"), act = document.activeElement;
  if (!keepOpen) { delete state.draft.famAv; delete state.draft.myAv; $("profErr").textContent = ""; }
  document.querySelectorAll("[data-theme-opt]").forEach(b => b.setAttribute("aria-pressed", b.dataset.themeOpt === currentTheme()));
  document.querySelectorAll(".swatch[data-palette]").forEach(b => b.setAttribute("aria-pressed", b.dataset.palette === currentPalette()));
  if (act !== $("inFamName")) $("inFamName").value = state.family.name;
  $("inFamName").disabled = !canFam;
  $("famEditActions").classList.toggle("hidden", !canFam); $("famReadonly").classList.toggle("hidden", canFam);
  if (act !== $("inMyName")) $("inMyName").value = meMember().display_name;
  paintProfileEditors();
  $("setFamName").textContent = state.family.name;
  $("setMembers").textContent = `${state.members.length} คน`;
  $("setRole").textContent = owner ? "เจ้าของบ้าน" : "สมาชิก";
  $("resetOwnerOnly").classList.toggle("hidden", !owner);
  $("resetNotOwner").classList.toggle("hidden", owner);
  $("resetLabel").textContent = `พิมพ์ “${state.family.name}” เพื่อยืนยัน`;
  if (!keepOpen) { $("inResetConfirm").value = ""; $("resetErr").textContent = ""; }
  $("inResetConfirm").placeholder = state.family.name;
  $("btnReset").disabled = $("inResetConfirm").value.trim() !== state.family.name;
}
$("btnSettings").onclick = () => { openSettings(false); setTab(state.tab === "settings" ? "overview" : "settings"); };
document.addEventListener("keydown", (e) => { const c = e.target.closest?.(".pcard[role=button]"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); c.click(); } });
$("inResetConfirm").addEventListener("input", () => { $("btnReset").disabled = $("inResetConfirm").value.trim() !== state.family.name; });
$("formReset").onsubmit = async (e) => {
  e.preventDefault();
  const v = $("inResetConfirm").value.trim();
  if (v !== state.family.name) { $("resetErr").textContent = "ชื่อบ้านที่พิมพ์ไม่ตรง"; return; }
  if (!confirm("ยืนยันอีกครั้ง: ข้อมูลทั้งหมดของบ้านจะถูกลบถาวร")) return;
  const btn = $("btnReset"); btn.disabled = true;
  try { await api.resetFamily(state.family.id, v, state.members.map(m => m.id)); $("inResetConfirm").value = ""; toast("ล้างข้อมูลทั้งหมดแล้ว"); await reload(); }
  catch (err) { $("resetErr").textContent = friendlyError(err); btn.disabled = false; }
};

/* =========================================================
   รายจ่ายหลักที่จ่ายไป (บันทึกตอนกด "ฝากเงินคงเหลือ")
   ไม่นับรวมในรายรับรายจ่าย ใช้ดูว่าแต่ละเดือนจ่ายอะไรไปเท่าไร
   ========================================================= */
function billPayRows(M) {
  const mStr = ymd(M), b = billsFor(mStr), t = today0(), endM = new Date(M.getFullYear(), M.getMonth() + 1, 0), pay_date = ymd(t < endM ? t : endM), rows = [];
  (b?.items || []).filter(x => +x.amount > 0).forEach(x => rows.push({ family_id: state.family.id, cycle_month: mStr, source: "bill", member_id: null, name: String(x.name || "รายจ่ายหลัก").slice(0, 60), amount: round2(x.amount), pay_date }));
  adults().forEach(m => { const p = payFor(m.id, M); if (!p) return;
    p.deductions.forEach(x => rows.push({ family_id: state.family.id, cycle_month: mStr, source: "deduct", member_id: m.id, name: String(x.name || "รายการหัก").slice(0, 60), amount: round2(x.amount), pay_date })); });
  return rows;
}
const bpaysOf = (s0, e0) => (state.data.bpays || []).filter(r => { const k = String(r.cycle_month).slice(0, 10); return k >= s0 && k <= e0; });
async function saveBillPays(M, quiet) {
  const rows = billPayRows(M);
  await api.setBillPays(state.family.id, ymd(M), rows);
  if (!quiet) toast(`บันทึกรายจ่ายหลักของรอบ ${monthLabel(M)} แล้ว ${rows.length} รายการ`);
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-bpay-save]"); if (!b) return;
  const M = parseYmd(b.dataset.bpaySave), had = bpaysOf(ymd(M), ymd(M)).length;
  if (had && !confirm(`บันทึกรายจ่ายหลักของรอบ ${monthLabel(M)} ใหม่ ตามรายการและสลิปตอนนี้?`)) return;
  b.disabled = true;
  try { await saveBillPays(M); await reload(); } catch (err) { toast(/bill_payments/.test(String(err.message || err)) ? "ให้รัน schema_phase11.sql ก่อน" : friendlyError(err)); b.disabled = false; }
});
// ภาพรวม: จ่ายประจำ (รายจ่ายหลัก + หักในสลิป)
function renderBillPays() {
  const sec = $("secBillPay"), on = feat("bills");
  sec.classList.toggle("hidden", !on);
  const r = periodRange(state.period), s0 = ymd(monthStart(r.start)), e0 = ymd(r.end), list = bpaysOf(s0, e0);
  const total = list.reduce((a, x) => a + +x.amount, 0);
  $("kBills").textContent = bahtR(total);
  $("kBillsSub").textContent = list.length ? `${new Set(list.map(x => String(x.cycle_month).slice(0, 7))).size} รอบ · ไม่นับในรายจ่าย` : "กดฝากเงินคงเหลือเพื่อบันทึก";
  if (!on) return;
  const agg = {};
  list.forEach(x => { const k = x.source + "|" + x.name; const g = agg[k] ||= { name: x.name, source: x.source, amount: 0, who: new Set(), n: new Set() };
    g.amount += +x.amount; if (x.member_id) g.who.add(memberName(x.member_id)); g.n.add(String(x.cycle_month).slice(0, 7)); });
  const rows = Object.values(agg).sort((a, b) => b.amount - a.amount), max = Math.max(1, ...rows.map(x => x.amount));
  $("bpSub").textContent = `รวม ${bahtR(total)}`;
  $("bpList").innerHTML = rows.length ? rows.map((x, i) => `<div class="hbar"><div class="top"><b><span class="rank num">${i + 1}</span>${x.source === "deduct" ? "🧾" : "📌"} ${esc(x.name)}</b><span class="num" style="font-weight:700">${baht(round2(x.amount))} <small class="muted">${Math.round(x.amount / (total || 1) * 100)}%</small></span></div>
      <div class="track"><i style="width:${(x.amount / max * 100).toFixed(1)}%;background:${x.source === "deduct" ? "#E0620F" : "var(--bill)"}"></i></div>
      <div class="sub">${x.source === "deduct" ? `หักในสลิป${x.who.size ? " · " + esc([...x.who].join(", ")) : ""}` : "รายจ่ายหลักของบ้าน"}${x.n.size > 1 ? ` · ${x.n.size} รอบ` : ""}</div></div>`).join("")
    : `<div class="empty">ยังไม่มีบันทึกในช่วงนี้<br><small>ไปที่ เงินเดือน → ทั้งบ้าน แล้วกด “ฝากเงินคงเหลือ” ระบบจะบันทึกรายจ่ายหลักและรายการหักในสลิปของรอบนั้นให้</small></div>`;
  // กราฟตามช่วง: แยก รายจ่ายหลัก / หักในสลิป
  const B = compareBuckets(), hi = B.findIndex(b => b.cur);
  const span = (b) => state.period === "all" ? [`${+b.label - 543}-01-01`, `${+b.label - 543}-12-31`] : [ymd(b.f.start), ymd(new Date(b.f.start.getFullYear(), b.f.start.getMonth() + 1, 0))];
  const vb = B.map(b => { const [a, z] = span(b); return bpaysOf(a, z).filter(x => x.source === "bill").reduce((s, x) => s + +x.amount, 0); });
  const vd = B.map(b => { const [a, z] = span(b); return bpaysOf(a, z).filter(x => x.source === "deduct").reduce((s, x) => s + +x.amount, 0); });
  barChart($("chartBP"), $("tipBP"), { labels: B.map(b => b.label), stacked: true, hi: hi >= 0 ? hi : null, initialTip: hi >= 0 ? hi : B.length - 1, emptyText: "ยังไม่มีข้อมูล", totalLabels: true,
    series: [{ color: "var(--bill)", values: vb }, { color: "#E0620F", values: vd }],
    tip: (i) => `<b>${esc(B[i].name)}</b><span>รายจ่ายหลัก <b class="num">${bahtR(vb[i])}</b></span><span>หักในสลิป <b class="num">${bahtR(vd[i])}</b></span><span>รวม <b class="num">${bahtR(vb[i] + vd[i])}</b></span>` });
}

// ลบรายการ: ถ้าเป็นรายการ "ฝากเงินคงเหลือ" ลบรายจ่ายประจำ + การโอนเข้าบัญชีของรอบนั้นตามไปด้วย
function depositMonthOf(t) {
  if (!t || t.category !== SAVE_CAT || !String(t.note || "").startsWith("เงินเหลือรอบ")) return null;
  const d = parseYmd(t.tx_date);
  for (let i = -3; i <= 24; i++) { const M = addMonths(monthStart(d), -i); if (depositNote(M) === t.note) return M; }
  return null;
}
const delTxMsg = (id) => { const M = depositMonthOf(state.data.txs.find(x => x.id === id));
  return M ? `ลบรายการฝากเงินคงเหลือ รอบ ${monthLabel(M)}?\n\nรายจ่ายประจำของรอบนี้ในหน้าภาพรวม และเงินที่โอนเข้าบัญชีเงินเก็บ จะถูกลบตามไปด้วย` : "ลบรายการนี้?"; };
async function deleteTxCascade(id) {
  const t = state.data.txs.find(x => x.id === id), M = depositMonthOf(t);
  await api.deleteTx(id);
  if (!M) return;
  const others = state.data.txs.some(x => x.id !== id && x.category === SAVE_CAT && x.note === t.note);
  if (others) return; // ยังมีรายการฝากของรอบนี้อีก
  for (const m of (state.data.moves || []).filter(m => !m.debt_id && m.note === t.note && (m.kind === "deposit" || m.kind === "withdraw"))) await api.deleteMove(m.id);
  try { await api.setBillPays(state.family.id, ymd(M), []); } catch (e) { console.warn(e); }
}

/* ---------- ภาพรวม: รายรับเดือนก่อน vs รายจ่ายเดือนนี้ ---------- */
const incomeOnly = (s0, e0) => state.data.txs.filter(t => t.type === "income" && countable(t) && t.category !== SAVE_CAT && t.tx_date >= s0 && t.tx_date <= e0).reduce((a, t) => a + +t.amount, 0);
const expenseOnly = (s0, e0) => state.data.txs.filter(t => t.type === "expense" && countable(t) && t.tx_date >= s0 && t.tx_date <= e0).reduce((a, t) => a + +t.amount, 0);
const mEnd = (M) => ymd(new Date(M.getFullYear(), M.getMonth() + 1, 0));
const saveIn = (s0, e0) => state.data.txs.filter(t => t.type === "income" && t.category === SAVE_CAT && t.tx_date >= s0 && t.tx_date <= e0).reduce((a, t) => a + +t.amount, 0);
// เงินที่ใช้ได้ของเดือน M = รายรับเดือนก่อน + เงินเหลือที่ฝากเข้าเดือน M (ซึ่งลงวันที่เดือนที่ใช้อยู่แล้ว)
function carryPair(M) { const P = addMonths(M, -1); return { M, P, inc: memo("ci|" + ymd(M), () => incomeOnly(ymd(P), mEnd(P)) + saveIn(ymd(M), mEnd(M))), out: memo("co|" + ymd(M), () => expenseOnly(ymd(M), mEnd(M))) }; }
function renderCarry() {
  const t0 = monthStart(today0()), a = state.anchor;
  const T = state.period === "month" ? monthStart(a) : state.period === "year" && a.getFullYear() < t0.getFullYear() ? new Date(a.getFullYear(), 11, 1) : t0;
  const c = carryPair(T), left = c.inc - c.out, pct = c.inc ? c.out / c.inc * 100 : null;
  $("carryTitle").textContent = `ใช้เงินของ ${monthShort(c.P)} เกินไหม`;
  $("carrySub").textContent = `รายรับ ${monthLabel(c.P)} → จ่าย ${monthLabel(T)}`;
  const col = left >= 0 ? "var(--income)" : "var(--expense)";
  $("carryBox").innerHTML = `<div class="cmp2">
      <div><span>รายรับ ${esc(monthShort(c.P))} + เงินเหลือที่ฝาก</span><b class="num" style="color:var(--income)">${bahtR(c.inc)}</b></div>
      <div><span>รายจ่าย ${esc(monthLabel(T))}</span><b class="num" style="color:var(--expense)">${bahtR(c.out)}</b></div>
      <div><span>${left >= 0 ? "ยังเหลือ" : "ใช้เกิน"}</span><b class="num" style="color:${col}">${left >= 0 ? "" : "−"}${bahtR(Math.abs(left))}</b></div></div>
    <div class="track" style="height:12px;margin-top:12px"><i style="width:${pct === null ? 0 : Math.min(100, pct).toFixed(1)}%;background:${pct !== null && pct > 100 ? "var(--expense)" : pct !== null && pct > 85 ? "var(--shift)" : "var(--income)"}"></i></div>
    <div class="wf-sub"><span>${pct === null ? "เดือนก่อนยังไม่มีรายรับที่บันทึก" : `ใช้ไปแล้ว ${Math.round(pct)}% ของรายรับเดือนก่อน`}</span><span class="muted">รวมเงินเหลือที่ฝากเข้าเดือนนี้</span></div>`;
  const B = []; for (let i = 11; i >= 0; i--) B.push(carryPair(addMonths(T, -i)));
  barChart($("chartCarry"), $("tipCarry"), { labels: B.map(b => monthShort(b.M)), stacked: false, hi: B.length - 1, initialTip: B.length - 1,
    series: [{ color: "var(--income)", values: B.map(b => b.inc) }, { color: "var(--expense)", values: B.map(b => b.out) }],
    tip: (i) => { const b = B[i], d = b.inc - b.out; return `<b>จ่าย ${esc(monthLabel(b.M))}</b><span>รายรับ ${esc(monthLabel(b.P))} + เงินเหลือ <b class="num">${bahtR(b.inc)}</b></span><span>รายจ่าย ${esc(monthLabel(b.M))} <b class="num">${bahtR(b.out)}</b></span><span style="color:${d >= 0 ? "var(--income)" : "var(--expense)"}">${d >= 0 ? "เหลือ" : "ใช้เกิน"} ${bahtR(Math.abs(d))}</span>`; } });
}

/* ---------- ปฏิทินการใช้จ่าย: แตะวัน → ป๊อปอัปรายละเอียด ---------- */
function openDayDetail(k) {
  const list = state.data.txs.filter(t => countable(t) && t.tx_date === k).sort(newest("tx_date"));
  const inc = list.filter(t => t.type === "income").reduce((a, t) => a + +t.amount, 0), out = list.filter(t => t.type === "expense").reduce((a, t) => a + +t.amount, 0);
  $("ddTitle").textContent = dayLabel(k) + " " + (parseYmd(k).getFullYear() + 543);
  $("ddSum").innerHTML = `<div><span>รายจ่าย</span><b class="num" style="color:var(--expense)">${bahtR(out)}</b></div><div><span>รายรับ</span><b class="num" style="color:var(--income)">${bahtR(inc)}</b></div><div><span>${list.length} รายการ</span><b class="num">${signed(Math.round(inc - out))}</b></div>`;
  const cats = {}; list.filter(t => t.type === "expense").forEach(t => cats[t.category] = (cats[t.category] || 0) + +t.amount);
  const ce = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  $("ddCats").innerHTML = ce.length > 1 ? `<div class="stackbar" style="margin:10px 0 4px">${ce.map(([c, v], i) => `<i style="width:${(v / out * 100).toFixed(2)}%;background:${CAT_COLORS[i % CAT_COLORS.length]}" title="${esc(c)}"></i>`).join("")}</div>
    <div class="legend-row">${ce.map(([c, v], i) => `<span><i style="background:${CAT_COLORS[i % CAT_COLORS.length]}"></i>${catIcon("expense", c)} ${esc(c)} <b class="num">${bahtR(v)}</b></span>`).join("")}</div>` : "";
  $("ddList").innerHTML = ledgerHTML(list, false) || `<div class="empty">วันนี้ไม่มีรายการ</div>`;
  $("ddAdd").dataset.date = k;
  openSheet("sheetDayList");
}
$("ddList").addEventListener("click", (e) => { if (e.target.closest("[data-edit-tx],[data-del]")) closeSheet("sheetDayList"); }, true);
$("ddAdd").onclick = () => { const k = $("ddAdd").dataset.date; closeSheet("sheetDayList"); openAdd({ date: k }); };

/* =========================================================
   เด็ก: เงินไปโรงเรียน (ไม่นับรวมรายรับรายจ่ายของบ้าน)
   ========================================================= */
const kidDays = (mid, s0 = "0000", e0 = "9999") => (state.data.cdays || []).filter(r => r.member_id === mid && String(r.day_date).slice(0, 10) >= s0 && String(r.day_date).slice(0, 10) <= e0);
const kidBuys = (mid, s0 = "0000", e0 = "9999") => (state.data.cspends || []).filter(r => r.member_id === mid && String(r.spend_date).slice(0, 10) >= s0 && String(r.spend_date).slice(0, 10) <= e0);
function kidSum(mid, s0, e0) {
  const d = kidDays(mid, s0, e0), b = kidBuys(mid, s0, e0);
  const given = d.reduce((a, r) => a + +r.given, 0), spent = d.reduce((a, r) => a + +r.spent, 0), buys = b.reduce((a, r) => a + +r.amount, 0);
  return { given, spent, left: given - spent, buys, days: d.length };
}
const kidWallet = (mid) => { const s = kidSum(mid); return round2(s.left - s.buys); }; // เงินเก็บสะสมของน้อง
const kidLastGiven = (mid) => { const r = [...kidDays(mid)].sort(newest("day_date"))[0]; return r ? +r.given : ""; };
function renderKid(mid) {
  const m = state.members.find(x => x.id === mid), M = monthStart(state.anchor), s0 = ymd(M), e0 = mEnd(M), tStr = ymd(today0()), edit = canKid();
  const S = kidSum(mid, s0, e0), wallet = kidWallet(mid);
  $("kidName").textContent = `เงินไปโรงเรียน · ${m?.display_name || ""}`;
  $("kidPill").textContent = monthLabel(M);
  $("kidLeft").textContent = signed(round2(S.left));
  $("kidGiven").textContent = baht(S.given); $("kidSpent").textContent = baht(S.spent);
  $("kidWallet").textContent = signed(wallet);
  $("kidBuyMonth").textContent = S.buys ? `เดือนนี้ใช้เงินเก็บไป ${baht(S.buys)}` : "เหลือแต่ละวันสะสมไว้ที่นี่";
  $("btnKidBuy").classList.toggle("hidden", !edit);
  $("kidCalHint").textContent = edit ? "แตะวันเพื่อบันทึก" : "ดูอย่างเดียว";
  // ปฏิทิน
  const rec = {}; kidDays(mid, s0, e0).forEach(r => rec[String(r.day_date).slice(0, 10)] = r);
  let h = WD.map(w => `<div class="cal-wd">${w}</div>`).join("");
  for (let i = 0; i < M.getDay(); i++) h += "<div></div>";
  eachDay(M, parseYmd(e0), d => { const k = ymd(d), r = rec[k], l = r ? +r.given - +r.spent : 0;
    const cls = ["kday", r ? (l < 0 ? "over" : l > 0 ? "save" : "zero") : "", k === tStr ? "today" : "", k > tStr ? "future" : ""].join(" ");
    h += `<button type="button" class="${cls}" data-kid-day="${k}" ${edit ? "" : "disabled"} aria-label="${esc(dayLabel(k))}${r ? ` ให้ ${baht(r.given)} ใช้ ${baht(r.spent)}` : ""}">
      <span class="d num">${d.getDate()}</span>${r ? `<span class="g num">${shortNum(+r.given)}</span><span class="s num">${l > 0 ? "+" + shortNum(l) : l < 0 ? "−" + shortNum(-l) : "0"}</span>` : ""}</button>`; });
  $("kidCal").innerHTML = h;
  // กราฟรายวัน: ใช้ไป + เหลือ
  const days = []; eachDay(M, parseYmd(e0), d => days.push(d));
  const sp = days.map(d => +(rec[ymd(d)]?.spent || 0)), lf = days.map(d => { const r = rec[ymd(d)]; return r ? Math.max(0, +r.given - +r.spent) : 0; });
  const hi = days.findIndex(d => ymd(d) === tStr);
  barChart($("chartKid"), $("tipKid"), { labels: days.map(d => String(d.getDate())), stacked: true, hi: hi >= 0 ? hi : null, initialTip: hi >= 0 && rec[tStr] ? hi : null, emptyText: "ยังไม่ได้บันทึกเดือนนี้",
    series: [{ color: "var(--expense)", values: sp }, { color: "var(--income)", values: lf }],
    tip: (i) => { const r = rec[ymd(days[i])]; if (!r) return `<b>${esc(dayLabel(ymd(days[i])))}</b><span>ไม่ได้บันทึก</span>`;
      const l = +r.given - +r.spent; return `<b>${esc(dayLabel(ymd(days[i])))}</b><span>ให้ไป <b class="num">${baht(r.given)}</b></span><span>ใช้ไป <b class="num">${baht(r.spent)}</b></span><span style="color:${l >= 0 ? "var(--income)" : "var(--expense)"}">${l >= 0 ? "เหลือ" : "ใช้เกิน"} ${baht(Math.abs(l))}</span>${r.note ? `<span>${esc(r.note)}</span>` : ""}`; } });
  // 6 เดือนล่าสุด
  const months = []; for (let i = 5; i >= 0; i--) months.push(addMonths(M, -i));
  const ms = months.map(x => kidSum(mid, ymd(x), mEnd(x)));
  barChart($("chartKid6"), $("tipKid6"), { labels: months.map(monthShort), stacked: false, hi: 5, initialTip: 5,
    series: [{ color: "color-mix(in srgb,var(--brand) 40%,transparent)", values: ms.map(x => x.given) }, { color: "var(--expense)", values: ms.map(x => x.spent) }, { color: "var(--income)", values: ms.map(x => Math.max(0, x.left)) }],
    tip: (i) => `<b>${esc(monthLabel(months[i]))}</b><span>ให้ไป <b class="num">${baht(ms[i].given)}</b> (${ms[i].days} วัน)</span><span>ใช้ไป <b class="num">${baht(ms[i].spent)}</b></span><span>เหลือ <b class="num">${signed(round2(ms[i].left))}</b></span>${ms[i].buys ? `<span>ใช้เงินเก็บ <b class="num">${baht(ms[i].buys)}</b></span>` : ""}` });
  // ใช้เงินเก็บ (ล่าสุดก่อน)
  const buys = [...kidBuys(mid)].sort(newest("spend_date"));
  $("kidBuys").innerHTML = buys.length ? buys.slice(0, 30).map(b => `<div class="row"><div class="cat-ic" style="background:color-mix(in srgb,var(--bill) 16%,var(--surface))" aria-hidden="true">🧸</div>
      <div class="what"><b>${esc(b.note || "ใช้เงินเก็บ")}</b><span>${esc(dayLabel(String(b.spend_date).slice(0, 10)))}</span></div>
      <div class="amt num">−${baht(b.amount)}</div>${edit ? `<button class="del" type="button" data-kid-buy-del="${esc(b.id)}" aria-label="ลบรายการ">×</button>` : "<span></span>"}</div>`).join("")
    : `<div class="empty">ยังไม่ได้ใช้เงินเก็บ</div>`;
  // รายละเอียดรายวัน (ล่าสุดก่อน)
  const dl = Object.values(rec).sort(newest("day_date"));
  $("kidDays").innerHTML = dl.length ? dl.map(r => { const k = String(r.day_date).slice(0, 10), l = +r.given - +r.spent;
    return `<div class="row${edit ? " tap" : ""}" ${edit ? `data-kid-day="${k}" role="button" tabindex="0"` : ""}><div class="cat-ic" style="background:color-mix(in srgb,${l < 0 ? "var(--expense)" : "var(--income)"} 14%,var(--surface))" aria-hidden="true">🎒</div>
      <div class="what"><b>${esc(dayLabel(k))}</b><span class="num">ให้ ${baht(r.given)} · ใช้ ${baht(r.spent)}${r.note ? " · " + esc(r.note) : ""}</span></div>
      <div class="amt num" style="color:${l < 0 ? "var(--expense)" : "var(--income)"}">${l >= 0 ? "เหลือ " : "เกิน "}${baht(Math.abs(l))}</div><span></span></div>`; }).join("")
    : `<div class="empty">ยังไม่ได้บันทึกเดือนนี้${edit ? "<br>แตะวันที่ในปฏิทินเพื่อเริ่ม" : ""}</div>`;
}
// บันทึกรายวัน
let kd = null;
function openKidDay(k) {
  const mid = state.salMember, r = kidDays(mid, k, k)[0] || null;
  kd = { mid, k, r };
  $("kdTitle").textContent = `${memberName(mid)} · ${dayLabel(k)}`;
  const last = kidLastGiven(mid);
  $("kdGiven").value = r ? +r.given : last; $("kdSpent").value = r ? +r.spent : ""; $("kdNote").value = r?.note || "";
  $("kdRemember").textContent = !r && last !== "" ? `ใส่ค่าที่ให้ครั้งก่อน (${baht(last)}) ไว้ให้แล้ว` : "";
  $("kdClear").classList.toggle("hidden", !r); $("kdErr").textContent = "";
  kdPreview(); openSheet("sheetKidDay"); setTimeout(() => $(r || last === "" ? "kdGiven" : "kdSpent").focus(), 60);
}
function kdPreview() {
  const g = +$("kdGiven").value || 0, s = +$("kdSpent").value || 0, l = round2(g - s);
  $("kdLeft").innerHTML = `${l >= 0 ? "เหลือวันนี้" : "ใช้เกิน"} <b class="num" style="color:${l >= 0 ? "var(--income)" : "var(--expense)"}">${baht(Math.abs(l))}</b> <small class="muted">(เก็บสะสมเข้าเงินของน้อง)</small>`;
}
["kdGiven", "kdSpent"].forEach(id => $(id).addEventListener("input", kdPreview));
document.querySelectorAll("[data-kd-quick]").forEach(b => b.onclick = () => { const g = +$("kdGiven").value || 0, q = b.dataset.kdQuick;
  $("kdSpent").value = q === "all" ? g : q === "none" ? 0 : round2(g / 2); kdPreview(); });
$("formKidDay").onsubmit = async (e) => {
  e.preventDefault();
  const given = round2($("kdGiven").value), spent = round2($("kdSpent").value);
  if (given < 0 || spent < 0) { $("kdErr").textContent = "ตัวเลขต้องไม่ติดลบ"; return; }
  if (!given && !spent) { $("kdErr").textContent = "ใส่เงินที่ให้ไปหรือที่ใช้ไป"; return; }
  const btn = $("kdSave"); btn.disabled = true;
  try { await api.saveChildDay({ family_id: state.family.id, member_id: kd.mid, day_date: kd.k, given, spent, note: $("kdNote").value.trim() }); closeSheet("sheetKidDay"); toast("บันทึกแล้ว"); await reload(); }
  catch (err) { $("kdErr").textContent = /child_days/.test(String(err.message || err)) ? "ให้รัน schema_phase11.sql ก่อน" : friendlyError(err); } finally { btn.disabled = false; }
};
$("kdClear").onclick = async () => { if (!kd?.r || !confirm("ลบบันทึกของวันนี้?")) return;
  try { await api.deleteChildDay(kd.mid, kd.k); closeSheet("sheetKidDay"); toast("ลบแล้ว"); await reload(); } catch (err) { $("kdErr").textContent = friendlyError(err); } };
// ใช้เงินเก็บของน้อง (เช่น ซื้อของเล่น)
function openKidBuy() {
  const mid = state.salMember;
  $("kbTitle").textContent = `ใช้เงินเก็บของ ${memberName(mid)}`;
  $("kbAmount").value = ""; $("kbNote").value = ""; $("kbDate").value = ymd(today0()); $("kbErr").textContent = "";
  $("kbHint").textContent = `เงินเก็บของน้องตอนนี้ ${baht(kidWallet(mid))}`;
  openSheet("sheetKidBuy"); setTimeout(() => $("kbAmount").focus(), 60);
}
$("btnKidBuy").onclick = openKidBuy;
$("formKidBuy").onsubmit = async (e) => {
  e.preventDefault();
  const mid = state.salMember, amount = round2($("kbAmount").value);
  if (!(amount > 0)) { $("kbErr").textContent = "ใส่จำนวนเงินมากกว่า 0"; return; }
  const w = kidWallet(mid);
  if (amount > w && !confirm(`ใช้ ${baht(amount)} มากกว่าเงินเก็บที่มี (${baht(w)}) ยอดจะติดลบ บันทึกต่อไหม?`)) return;
  const btn = $("kbSave"); btn.disabled = true;
  try { await api.addChildSpend({ family_id: state.family.id, member_id: mid, amount, note: $("kbNote").value.trim(), spend_date: $("kbDate").value || ymd(today0()) }); closeSheet("sheetKidBuy"); toast("บันทึกแล้ว"); await reload(); }
  catch (err) { $("kbErr").textContent = /child_spends/.test(String(err.message || err)) ? "ให้รัน schema_phase11.sql ก่อน" : friendlyError(err); } finally { btn.disabled = false; }
};
document.querySelectorAll("[data-kb-quick]").forEach(b => b.onclick = () => { $("kbNote").value = b.dataset.kbQuick; });
document.addEventListener("click", async (e) => {
  const d = e.target.closest("[data-kid-day]"); if (d && !d.disabled) return openKidDay(d.dataset.kidDay);
  const x = e.target.closest("[data-kid-buy-del]"); if (x) { if (!confirm("ลบรายการนี้? เงินจะกลับเข้าเงินเก็บของน้อง")) return;
    try { await api.deleteChildSpend(x.dataset.kidBuyDel); toast("ลบแล้ว"); await reload(); } catch (err) { toast(friendlyError(err)); } }
});
// ภาพรวม: เงินไปโรงเรียนของเด็กทุกคน
function renderKidsOverview() {
  const K = kids(); $("secKids").classList.toggle("hidden", !K.length); if (!K.length) return;
  const r = periodRange(state.period), s0 = ymd(r.start), e0 = ymd(r.end);
  const max = Math.max(1, ...K.map(m => kidSum(m.id, s0, e0).given));
  $("kidsOv").innerHTML = K.map(m => { const S = kidSum(m.id, s0, e0), w = kidWallet(m.id);
    return `<div class="hbar" role="button" tabindex="0" data-goto-kid="${esc(m.id)}" style="cursor:pointer"><div class="top"><b>${avatarHTML(m)}${esc(m.display_name)}</b><span class="num" style="font-weight:800;color:var(--bill)">เงินเก็บ ${signed(w)}</span></div>
      <div class="track"><i style="width:${(Math.min(S.spent, S.given) / max * 100).toFixed(2)}%;background:var(--expense)"></i><i style="width:${(Math.max(0, S.left) / max * 100).toFixed(2)}%;background:var(--income)"></i></div>
      <div class="sub num">ให้ไป ${baht(S.given)} (${S.days} วัน) · ใช้ ${baht(S.spent)} · เหลือ ${signed(round2(S.left))}${S.buys ? ` · ใช้เงินเก็บ ${baht(S.buys)}` : ""}</div></div>`; }).join("");
  const B = compareBuckets(), hi = B.findIndex(b => b.cur);
  const span = (b) => state.period === "all" ? [`${+b.label - 543}-01-01`, `${+b.label - 543}-12-31`] : [ymd(b.f.start), mEnd(b.f.start)];
  const sums = B.map(b => { const [a, z] = span(b); return K.reduce((acc, m) => { const s = kidSum(m.id, a, z); acc.g += s.given; acc.s += s.spent; return acc; }, { g: 0, s: 0 }); });
  barChart($("chartKidsOv"), $("tipKidsOv"), { labels: B.map(b => b.label), stacked: false, hi: hi >= 0 ? hi : null, initialTip: hi >= 0 ? hi : B.length - 1, emptyText: "ยังไม่มีข้อมูล",
    series: [{ color: "color-mix(in srgb,var(--brand) 40%,transparent)", values: sums.map(x => x.g) }, { color: "var(--expense)", values: sums.map(x => x.s) }],
    tip: (i) => `<b>${esc(B[i].name)}</b><span>ให้ไป <b class="num">${baht(sums[i].g)}</b></span><span>ใช้ไป <b class="num">${baht(sums[i].s)}</b></span><span style="color:var(--income)">เหลือ <b class="num">${signed(round2(sums[i].g - sums[i].s))}</b></span>` });
}
document.addEventListener("click", (e) => { const g = e.target.closest("[data-goto-kid]"); if (g) { state.salMember = g.dataset.gotoKid; setTab("salary"); } });
// ตั้งค่า: เพิ่มเด็ก / เปลี่ยนเป็นเด็ก-ผู้ใหญ่
$("btnAddKid").onclick = async () => {
  const name = $("inKidName").value.trim(); if (!name) { toast("ใส่ชื่อเด็กก่อน"); $("inKidName").focus(); return; }
  const btn = $("btnAddKid"); btn.disabled = true;
  try { await api.addChild(state.family.id, name); $("inKidName").value = ""; toast(`เพิ่ม ${name} แล้ว`); await refreshFamily(); await reload(); }
  catch (err) { toast(/add_child_member|member_kind/.test(String(err.message || err)) ? "ให้รัน schema_phase11.sql ก่อน" : friendlyError(err)); } finally { btn.disabled = false; }
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-kind]"); if (!b) return;
  const [mid, kind] = b.dataset.kind.split("|"); b.disabled = true;
  try { await api.setMemberKind(mid, kind); toast(kind === "child" ? "ตั้งเป็นเด็กแล้ว" : "ตั้งเป็นผู้ใหญ่แล้ว"); await refreshFamily(); }
  catch (err) { toast(/set_member_kind|member_kind/.test(String(err.message || err)) ? "ให้รัน schema_phase11.sql ก่อน" : friendlyError(err)); b.disabled = false; }
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
boot().catch(err => { show("viewAuth"); $("authErr").textContent = "เริ่มระบบไม่สำเร็จ: " + friendlyError(err); });
