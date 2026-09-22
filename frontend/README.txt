تغییرات اعمال‌شده در این دو فایل:

1) js/admin-login.js
2) js/admin.js

تغییر ۱: همه‌ی credentials: "same-origin" به credentials: "include" تغییر کرد.
دلیل: چون فرانت روی پورت 5500 و بک‌اند روی پورت 8787 اجرا میشه (دو origin متفاوت)،
با "same-origin" مرورگر کوکی سشن رو ارسال نمی‌کنه.

تغییر ۲: مسیرهای ریدایرکت از مطلق (/admin.html و /admin-login.html)
به نسبی (admin.html و admin-login.html) تغییر کردن تا مستقل از زیرپوشه‌ای که
پروژه توش سرو میشه درست کار کنن.

نکته مهم (سمت بک‌اند - باید خودت اضافه/چک کنی):
باید CORS سمت سرور طوری تنظیم بشه که credentials رو قبول کنه، چون با
credentials:"include" دیگه origin:"*" جواب نمیده:

    app.use(cors({
        origin: "http://127.0.0.1:5500",
        credentials: true
    }));

و کوکی سشن موقع ست شدن باید همچین چیزی داشته باشه (بسته به اینکه http هست یا https):

    res.cookie("session", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });
