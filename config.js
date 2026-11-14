// สมุดบ้าน: ใช้โปรเจกต์ Supabase เดียวกับ DarkChat
// บัญชีผู้ใช้ (อีเมล + รหัสผ่าน) จึงใช้ร่วมกันได้ทั้งสองแอป
const CONFIG = {
  // URL ของโปรเจกต์ DarkChat Project
  SUPABASE_URL: "https://ealxfgjuiwoewwxxyppu.supabase.co",

  // วางค่าเดียวกับ SUPABASE_ANON_KEY ใน app.js ของ DarkChat (ขึ้นต้นด้วย sb_publishable_)
  // หรือคัดลอกจาก Supabase > Project Settings > API Keys > Publishable key
  SUPABASE_ANON_KEY: "sb_publishable_E3FljLn7ipcoNzfXds3T9A_o4pj4d7z",
};