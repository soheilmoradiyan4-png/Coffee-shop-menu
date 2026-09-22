-- =========================================================
-- Cafe QR Ordering
-- Initial Seed Data
-- =========================================================


-- =========================================================
-- Categories
-- =========================================================

insert into categories
    (name, slug, is_active, sort_order)
values
    ('قهوه گرم', 'hot-coffee', true, 1),
    ('قهوه سرد', 'iced-coffee', true, 2),
    ('نوشیدنی', 'drinks', true, 3),
    ('کیک و دسر', 'desserts', true, 4);


-- =========================================================
-- Products
-- =========================================================

insert into products
    (category_id, name, description, price, available, sort_order)
values

(
    (select id from categories where slug = 'hot-coffee'),
    'اسپرسو',
    'اسپرسوی تازه و غلیظ',
    70000,
    true,
    1
),

(
    (select id from categories where slug = 'hot-coffee'),
    'لاته',
    'اسپرسو همراه با شیر بخار داده شده',
    120000,
    true,
    2
),

(
    (select id from categories where slug = 'hot-coffee'),
    'کاپوچینو',
    'اسپرسو، شیر و فوم شیر',
    110000,
    true,
    3
),

(
    (select id from categories where slug = 'iced-coffee'),
    'آیس لاته',
    'لاته خنک همراه با یخ',
    130000,
    true,
    1
),

(
    (select id from categories where slug = 'drinks'),
    'لیموناد',
    'لیموناد تازه و خنک',
    90000,
    true,
    1
),

(
    (select id from categories where slug = 'desserts'),
    'چیزکیک',
    'چیزکیک مخصوص کافه',
    150000,
    true,
    1
);