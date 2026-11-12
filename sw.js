/* สมุดบ้าน — Service Worker
   เปิดแอปเร็ว: ไฟล์ของแอปเก็บไว้ในเครื่อง แล้วอัปเดตเบื้องหลัง
   ข้อมูลจาก Supabase ไม่เก็บ (ดึงสดทุกครั้ง)
   ** ทุกครั้งที่อัปโหลดไฟล์ใหม่ ให้เปลี่ยนเลขเวอร์ชันด้านล่าง ** */
const VERSION = "samudbaan-v10";
const APP_SHELL = ["./", "index.html", "style.css", "config.js", "app.js", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const CDN = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.hostname.endsWith("supabase.co")) return; // ข้อมูลจริง: ดึงสดเสมอ
  if (CDN.includes(url.hostname)) { // ไลบรารีและฟอนต์: ใช้ของในเครื่องก่อน
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })));
    return;
  }
  if (url.origin !== location.origin) return;
  // ไฟล์ของแอป: เปิดจากเครื่องทันที แล้วโหลดตัวใหม่เก็บไว้รอบหน้า
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(req, { ignoreSearch: true }) || (req.mode === "navigate" ? await c.match("index.html") : null);
    const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});