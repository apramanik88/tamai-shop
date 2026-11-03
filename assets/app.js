/* ===== CONFIG – edit these ===== */
var CONFIG = {
  product: "প্রিমিয়াম ট্রাউজার",
  sku: "TAMAI-TRS-001",
  price: 1290,
  currency: "BDT",
  sizes: ["২৮", "৩০", "৩২", "৩৪"],
  maxQty: 5,
  delivery: { inside: 60, outside: 120 },
  phone: "01XXXXXXXXX",          // TODO
  whatsapp: "8801XXXXXXXXX",     // TODO (country code, no +)
  endpoint: "",                  // TODO: Google Apps Script web app URL
  gtmId: ""                      // TODO: e.g. "GTM-XXXXXXX"
};
/* ================================ */
var dl = window.dataLayer = window.dataLayer || [];
var $ = function (id) { return document.getElementById(id); };
var bn = "০১২৩৪৫৬৭৮৯", qty = 1, size = null, started = false;
function B(n) { return String(n).replace(/\d/g, function (d) { return bn[d]; }); }
function M(n) { return "৳" + B(n.toLocaleString("en-US")); }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function store(k, v) { try { if (v !== undefined) sessionStorage.setItem(k, v); return sessionStorage.getItem(k); } catch (e) { return v || null; } }

/* GTM (loads only if gtmId is set) */
if (CONFIG.gtmId) {
  dl.push({ "gtm.start": Date.now(), event: "gtm.js" });
  var s = document.createElement("script"); s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + CONFIG.gtmId;
  document.head.appendChild(s);
}

/* Contact links */
document.querySelectorAll("[data-tel]").forEach(function (a) { a.href = "tel:" + CONFIG.phone; });
document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = "https://wa.me/" + CONFIG.whatsapp; });

/* Attribution capture */
var P = new URLSearchParams(location.search), attr = {};
["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(function (k) {
  var v = P.get(k) || store("a_" + k); if (v) { store("a_" + k, v); attr[k] = v; }
});

function item() { return [{ item_id: CONFIG.sku, item_name: CONFIG.product, price: CONFIG.price, quantity: qty }]; }
dl.push({ event: "view_item", ecommerce: { currency: CONFIG.currency, value: CONFIG.price, items: item() } });

/* UI */
var area = function () { return document.querySelector("input[name=area]:checked").value; };
function calc() {
  var d = CONFIG.delivery[area()], sub = CONFIG.price * qty;
  $("q").textContent = $("sq").textContent = B(qty);
  $("sp").textContent = M(sub); $("sd").textContent = M(d); $("st").textContent = M(sub + d);
  $("go").textContent = "অর্ডার কনফার্ম করুন " + M(sub + d);
  $("di").textContent = M(CONFIG.delivery.inside); $("do").textContent = M(CONFIG.delivery.outside);
}
CONFIG.sizes.forEach(function (z) {
  var b = document.createElement("button"); b.type = "button"; b.textContent = z;
  b.onclick = function () { document.querySelectorAll("#sz button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); size = z; start(); };
  $("sz").appendChild(b);
});
$("mn").onclick = function () { qty = Math.max(1, qty - 1); calc(); };
$("pl").onclick = function () { qty = Math.min(CONFIG.maxQty, qty + 1); calc(); };
document.querySelectorAll("input[name=area]").forEach(function (r) { r.onchange = calc; });
function start() {
  if (started) return; started = true;
  dl.push({ event: "begin_checkout", ecommerce: { currency: CONFIG.currency, value: CONFIG.price * qty, items: item() } });
}
$("f").addEventListener("focusin", start);

/* Hide sticky bar while the form is visible */
if ("IntersectionObserver" in window) {
  new IntersectionObserver(function (e) { $("sticky").classList.toggle("off", e[0].isIntersecting); }).observe($("order"));
}

/* Phone normalisation + SHA-256 for enhanced conversions */
function normPhone(v) { v = v.replace(/\D/g, ""); if (v.indexOf("880") === 0) v = v.slice(2); if (v[0] !== "0") v = "0" + v; return v; }
function sha256(t) {
  if (!window.crypto || !crypto.subtle) return Promise.resolve("");
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function (b) {
    return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  });
}

/* Submit */
$("f").onsubmit = function (e) {
  e.preventDefault();
  var ph = normPhone($("p").value), m = "";
  if ($("hp").value) return;
  if ($("n").value.trim().length < 2) m = "আপনার নাম লিখুন।";
  else if (!/^01[3-9]\d{8}$/.test(ph)) m = "সঠিক মোবাইল নাম্বার দিন (১১ ডিজিট)।";
  else if ($("a").value.trim().length < 10) m = "সম্পূর্ণ ঠিকানা লিখুন।";
  else if (!size) m = "সাইজ সিলেক্ট করুন।";
  else if (store("last_" + ph) && Date.now() - +store("last_" + ph) < 600000) m = "এই নাম্বার থেকে একটু আগেই অর্ডার করা হয়েছে। প্রয়োজনে আমাদের কল করুন।";
  $("er").textContent = m; if (m) return;

  var go = $("go"); go.disabled = true; go.textContent = "অর্ডার হচ্ছে…";
  var d = CONFIG.delivery[area()], total = CONFIG.price * qty + d, id = "TM" + Date.now().toString(36).toUpperCase(), eid = uid();
  var order = Object.assign({
    order_id: id, event_id: eid, name: $("n").value.trim(), phone: ph, address: $("a").value.trim(),
    size: size, qty: qty, unit_price: CONFIG.price, delivery_area: area(), delivery_charge: d, total: total,
    note: $("o").value.trim(), product: CONFIG.product, sku: CONFIG.sku, page: location.href.split("?")[0], ua: navigator.userAgent
  }, attr);

  var send = CONFIG.endpoint
    ? fetch(CONFIG.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(order) })
    : (console.warn("CONFIG.endpoint is empty – order NOT saved:", order), Promise.resolve());

  send.then(function () { return sha256("+88" + ph); }).then(function (h) {
    store("last_" + ph, String(Date.now()));
    dl.push({ event: "purchase", event_id: eid, user_data: { sha256_phone_number: h },
      ecommerce: { transaction_id: id, currency: CONFIG.currency, value: total, shipping: d, items: item() } });
    $("f").hidden = true; $("oid").textContent = id; $("thanks").hidden = false;
    history.replaceState(null, "", "#thank-you"); $("thanks").scrollIntoView({ behavior: "smooth" });
  }).catch(function () {
    go.disabled = false; calc(); $("er").textContent = "দুঃখিত, অর্ডার জমা হয়নি। আবার চেষ্টা করুন বা আমাদের কল করুন।";
  });
};
calc();
