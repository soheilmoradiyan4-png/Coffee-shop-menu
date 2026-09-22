# بک‌اند Cloffee Shop روی Cloudflare Workers

این پوشه یه نسخه‌ی جایگزین از `backend/` هست که مخصوص اجرا روی
**Cloudflare Workers** نوشته شده (نه یک سرور Node/Express سنتی).
بک‌اند اصلی (`backend/`) دست‌نخورده باقی مونده و هر جایی که بخواید
می‌تونید همونو (روی Render/Railway/VPS و ...) هم اجرا کنید.

## چرا یه نسخه‌ی جدا؟

Cloudflare Workers محیط اجرایی Node.js واقعی نیست. چیزهایی که بک‌اند
اصلی ازشون استفاده می‌کنه مستقیم کار نمی‌کنن:

| نسخه‌ی Express | نسخه‌ی Workers |
|---|---|
| `express` + `app.listen` | `hono` (فریم‌ورک سبک مخصوص edge) |
| `express-session` (حافظه‌ی سرور) | کوکی امضاشده با HMAC (`src/lib/session.js`) |
| `bcrypt` (native/باینری) | `bcryptjs` (خالص JS، همون فرمت هش، سازگار) |
| `express-rate-limit` (حافظه‌ی سرور) | Cloudflare Rate Limiting binding |

خبر خوب: تمام منطق واقعی کسب‌وکار (services) — Supabase، ساخت سفارش،
اعتبارسنجی، ارسال پیام بله و ... — **بدون تغییر** از `backend/services`
کپی شده. فقط لایه‌ی روتینگ/session/rate-limit بازنویسی شده.

## ساختار

```
cloudflare-worker/
  wrangler.toml          # تنظیمات Cloudflare (نام Worker، rate limit، vars)
  package.json
  .dev.vars.example      # نمونه‌ی متغیرهای محرمانه برای تست local
  src/
    index.js             # معادل server.js - همه‌ی route ها اینجا wire میشن
    config/               # env.js و supabase.js (نسخه‌ی سازگار با Workers)
    lib/session.js        # کوکی امضاشده به‌جای express-session
    middleware/            # adminAuth.js و rateLimit.js
    controllers/            # همون کنترلرها، فقط با API هونو (Hono)
    services/                # کپی مستقیم از backend/services (بدون تغییر منطق)
    utils/orderMessage.js     # کپی مستقیم
```

## مرحله ۱: نصب ابزارها

```bash
cd cloudflare-worker
npm install
```

اگه Wrangler (CLI رسمی Cloudflare) نصب نیست، همین `npm install` نصبش
می‌کنه (توی devDependencies هست). بعد لاگین کنید:

```bash
npx wrangler login
```

## مرحله ۲: ساخت namespace های Rate Limit

توی `wrangler.toml` چهار تا `[[ratelimits]]` تعریف شده با `namespace_id`
های `1001` تا `1004`. این عددها فقط باید **در اکانت شما یکتا** باشن؛
اگه از قبل جایی استفاده‌شون کرده بودید، عوضشون کنید. نیازی به ساخت
دستی نیست، خود Wrangler موقع deploy می‌سازتشون.

## مرحله ۳: ست کردن Secret ها

⚠️ **قبل از هر کاری**: چون فایل `.env.example` پروژه‌ی اصلی روی گیت‌هاب
شامل کلیدهای واقعی Supabase و توکن ربات بله بود، این کلیدها رو از پنل
Supabase و بله **ریجنریت (regenerate)** کنید و مقادیر جدید رو اینجا
بذارید — از مقادیر قدیمی که توی گیت‌هاب افشا شده استفاده نکنید.

```bash
npx wrangler secret put SUPABASE_SERVICE_KEY
npx wrangler secret put BALE_BOT_TOKEN
npx wrangler secret put BALE_CHAT_ID
npx wrangler secret put BALE_ADMIN_CHAT_ID
npx wrangler secret put SESSION_SECRET
```

برای `SESSION_SECRET` یه رشته‌ی تصادفی و طولانی (حداقل ۳۲ کاراکتر)
بدید، مثلاً خروجی:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`SUPABASE_URL`، `CAFE_NAME` و `PUBLIC_URL` توی `wrangler.toml` بخش
`[vars]` هست (این‌ها secret نیستن) — قبل از deploy مقدار `PUBLIC_URL`
رو با آدرس واقعی فرانت‌اندتون روی Cloudflare Pages جایگزین کنید.

## مرحله ۴: دیپلوی

```bash
npx wrangler deploy
```

بعد از دیپلوی، آدرسی مثل
`https://coffee-shop-api.<your-subdomain>.workers.dev` بهتون میده.
API روی همین آدرس + `/api/...` در دسترسه (مثلاً `/api/products`).

## مرحله ۵: وصل کردن فرانت‌اند

فایل `frontend/js/api.js` پروژه از یک مسیر نسبی استفاده می‌کنه:

```js
const API_BASE_URL = "/api";
```

یعنی فرانت‌اند انتظار داره API روی همون دامنه‌ی خودش باشه. ساده‌ترین
راه برای اینکه چیزی توی کد فرانت‌اند عوض نشه، استفاده از فایل
`_redirects` هست که کنار فرانت‌اند اضافه کردیم (`frontend/_redirects`)؛
Cloudflare Pages به‌صورت شفاف درخواست‌های `/api/*` رو به این Worker
پروکسی می‌کنه، بدون نیاز به CORS و بدون مشکل کوکی (چون از دید مرورگر
همه‌چیز روی یک دامنه‌ست).

فقط کافیه توی همون فایل، آدرس Worker خودتون رو جایگزین کنید (توضیح
داخل فایل هست).

اگه ترجیح میدید مستقیم به آدرس Worker وصل بشید (بدون پروکسی Pages)،
باید `API_BASE_URL` رو توی `frontend/js/api.js` به آدرس کامل Worker
تغییر بدید و مطمئن بشید `PUBLIC_URL` توی `wrangler.toml` دقیقاً همون
دامنه‌ی فرانت‌انده (برای CORS).

## محدودیت‌ها / نکاتی که باید بدونید

- **Rate limit**: بازه‌ی Cloudflare فقط ۱۰ یا ۶۰ ثانیه پشتیبانی میشه
  (نه ۱۵ دقیقه مثل نسخه‌ی اصلی). مقادیر توی `wrangler.toml` تقریبی و
  محافظه‌کارانه تنظیم شدن؛ هر جا خواستید عوضشون کنید.
- **رمز عبور ادمین**: هش‌های `bcrypt` قدیمی توی دیتابیس با `bcryptjs`
  کاملاً سازگارن (فرمت هش یکیه)، نیازی به ساخت دوباره‌ی رمز نیست.
- این Worker **فقط API** رو سرو می‌کنه؛ فایل‌های استاتیک `frontend/`
  باید جدا روی Cloudflare Pages باشن.
- این کد اینجا نوشته و syntax-check شده ولی روی محیط واقعی Cloudflare
  تست نشده (این محیط دسترسی اینترنت نداره). قبل از اعتماد کامل، حتماً
  `npx wrangler dev` رو لوکال امتحان کنید و مسیرهای اصلی (لاگین ادمین،
  ثبت سفارش، پیگیری سفارش) رو دستی تست کنید.
