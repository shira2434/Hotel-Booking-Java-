-- Customers (password = BCrypt of "1234")
INSERT INTO CUSTOMER (ID, FULL_NAME, EMAIL, PHONE, PASSWORD)
SELECT * FROM (VALUES
  (1,  'דוד כהן',       'david@gmail.com',   '050-1111111', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (2,  'שרה לוי',       'sarah@gmail.com',   '052-2222222', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (3,  'משה ישראלי',    'moshe@gmail.com',   '054-3333333', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (4,  'רחל אברהם',     'rachel@gmail.com',  '053-4444444', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (5,  'יוסף מזרחי',    'yosef@gmail.com',   '058-5555555', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (6,  'מרים פרץ',      'miriam@gmail.com',  '050-6666666', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (7,  'אברהם גולן',    'avraham@gmail.com', '052-7777777', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (8,  'לאה שפירא',     'leah@gmail.com',    '054-8888888', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (9,  'נועה ביטון',    'noa@gmail.com',     '053-9999999', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi'),
  (10, 'עמית שלום',     'amit@gmail.com',    '058-0000000', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi')
) AS tmp(ID, FULL_NAME, EMAIL, PHONE, PASSWORD)
WHERE NOT EXISTS (SELECT 1 FROM CUSTOMER WHERE ID = tmp.ID);

-- Rooms
INSERT INTO ROOM (ID, ROOM_NUMBER, TYPE, PRICE_PER_NIGHT, AVAILABLE, FLOOR, MAX_GUESTS, DESCRIPTION, AMENITIES)
SELECT * FROM (VALUES
  (1,  '101', 'SINGLE', 350,  TRUE,  1, 1, 'חדר יחיד נעים עם נוף לגינה',       'WiFi,TV,מזגן,כספת'),
  (2,  '102', 'SINGLE', 350,  TRUE,  1, 1, 'חדר יחיד שקט בקצה המסדרון',        'WiFi,TV,מזגן'),
  (3,  '103', 'SINGLE', 380,  TRUE,  1, 1, 'חדר יחיד משופץ עם מקלחת מודרנית', 'WiFi,TV,מזגן,כספת,מיני-בר'),
  (4,  '201', 'DOUBLE', 580,  TRUE,  2, 2, 'חדר זוגי מרווח עם מיטה זוגית',     'WiFi,TV,מזגן,כספת,מיני-בר'),
  (5,  '202', 'DOUBLE', 580,  TRUE,  2, 2, 'חדר זוגי עם נוף לבריכה',           'WiFi,TV,מזגן,מרפסת,מיני-בר'),
  (6,  '203', 'DOUBLE', 620,  TRUE,  2, 2, 'חדר זוגי דלוקס עם אמבטיה',        'WiFi,TV,מזגן,כספת,מיני-בר,נוף לים'),
  (7,  '204', 'DOUBLE', 600,  TRUE,  2, 3, 'חדר זוגי עם שתי מיטות נפרדות',    'WiFi,TV,מזגן,כספת'),
  (8,  '301', 'SUITE',  1200, TRUE,  3, 4, 'סוויטה יוקרתית עם סלון נפרד',      'WiFi,TV,מזגן,כספת,מיני-בר,ג''קוזי,מרפסת,נוף לים'),
  (9,  '302', 'SUITE',  1400, TRUE,  3, 4, 'סוויטה פנטהאוז עם נוף פנורמי',    'WiFi,TV,מזגן,כספת,מיני-בר,ג''קוזי,מרפסת,נוף לים'),
  (10, '303', 'SUITE',  1100, TRUE,  3, 2, 'סוויטה ג''וניור עם מרפסת גדולה',  'WiFi,TV,מזגן,כספת,מיני-בר,מרפסת')
) AS tmp(ID, ROOM_NUMBER, TYPE, PRICE_PER_NIGHT, AVAILABLE, FLOOR, MAX_GUESTS, DESCRIPTION, AMENITIES)
WHERE NOT EXISTS (SELECT 1 FROM ROOM WHERE ID = tmp.ID);

-- Bookings (תאריכים מפוזרים על פני 2025-2026)
INSERT INTO BOOKING (ID, CUSTOMER_ID, ROOM_ID, CHECK_IN, CHECK_OUT, CANCELLED, GUESTS_COUNT, NOTES, TOTAL_PRICE)
SELECT * FROM (VALUES
  (1,  1, 1, '2025-01-10', '2025-01-14', FALSE, 1, 'בקשה לקומה גבוהה',        1568.0),
  (2,  2, 4, '2025-01-20', '2025-01-25', FALSE, 2, '',                          3625.0),
  (3,  3, 8, '2025-02-05', '2025-02-10', FALSE, 3, 'יום נישואין - הפתעה',      8400.0),
  (4,  4, 2, '2025-02-14', '2025-02-16', FALSE, 1, 'ולנטיין',                  840.0),
  (5,  5, 5, '2025-03-01', '2025-03-05', FALSE, 2, '',                          2552.0),
  (6,  6, 9, '2025-03-15', '2025-03-20', FALSE, 2, 'חגיגת יום הולדת',         9800.0),
  (7,  1, 3, '2025-04-10', '2025-04-13', FALSE, 1, '',                          1254.3),
  (8,  7, 6, '2025-04-20', '2025-04-25', FALSE, 2, 'חופשת פסח',               3410.0),
  (9,  2, 10,'2025-05-01', '2025-05-06', FALSE, 2, '',                          6050.0),
  (10, 8, 1, '2025-05-15', '2025-05-18', FALSE, 1, '',                          1155.0),
  (11, 3, 4, '2025-06-01', '2025-06-07', FALSE, 2, 'כנס עסקי',                4176.0),
  (12, 9, 7, '2025-06-10', '2025-06-14', FALSE, 2, '',                          2808.0),
  (13, 4, 8, '2025-07-01', '2025-07-08', FALSE, 4, 'חופשת קיץ משפחתית',      11760.0),
  (14, 5, 2, '2025-07-15', '2025-07-20', FALSE, 1, '',                          2450.0),
  (15, 10,5, '2025-07-22', '2025-07-27', FALSE, 2, '',                          4060.0),
  (16, 6, 3, '2025-08-05', '2025-08-10', FALSE, 1, '',                          2660.0),
  (17, 1, 9, '2025-08-15', '2025-08-20', FALSE, 2, 'חגיגת יום נישואין',      11200.0),
  (18, 7, 4, '2025-09-01', '2025-09-05', FALSE, 2, '',                          2784.0),
  (19, 2, 6, '2025-09-10', '2025-09-14', FALSE, 2, '',                          2976.0),
  (20, 8, 10,'2025-10-01', '2025-10-06', FALSE, 2, 'חג סוכות',                5500.0),
  (21, 3, 1, '2025-10-15', '2025-10-18', FALSE, 1, '',                          1050.0),
  (22, 9, 8, '2025-11-01', '2025-11-05', FALSE, 3, 'כנס חברה',                5760.0),
  (23, 4, 5, '2025-11-20', '2025-11-24', FALSE, 2, '',                          2320.0),
  (24, 5, 9, '2025-12-10', '2025-12-17', FALSE, 2, 'חנוכה',                   13720.0),
  (25, 10,4, '2025-12-24', '2025-12-28', FALSE, 2, 'חג המולד',                3248.0),
  (26, 6, 2, '2026-01-05', '2026-01-09', FALSE, 1, '',                          1680.0),
  (27, 1, 6, '2026-01-15', '2026-01-20', FALSE, 2, '',                          3720.0),
  (28, 7, 8, '2026-02-01', '2026-02-07', FALSE, 3, '',                          10080.0),
  (29, 2, 3, '2026-02-14', '2026-02-17', FALSE, 1, 'ולנטיין',                  1254.3),
  (30, 8, 9, '2026-03-01', '2026-03-06', FALSE, 2, '',                          7700.0),
  (31, 3, 5, '2025-04-05', '2025-04-08', TRUE,  2, 'בוטל - שינוי תוכניות',    0.0),
  (32, 9, 7, '2025-08-20', '2025-08-23', TRUE,  1, 'בוטל',                     0.0)
) AS tmp(ID, CUSTOMER_ID, ROOM_ID, CHECK_IN, CHECK_OUT, CANCELLED, GUESTS_COUNT, NOTES, TOTAL_PRICE)
WHERE NOT EXISTS (SELECT 1 FROM BOOKING WHERE ID = tmp.ID);
