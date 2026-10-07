-- Run this in your Supabase SQL Editor to map your user account to a Doctor profile
-- Replace 'neil.morales0010@gmail.com' with your actual email if different
INSERT INTO doctors (
        user_id,
        specialization,
        license_number,
        consultation_fee,
        working_hours_start,
        working_hours_end,
        slot_duration
    )
SELECT id,
    'General Practice',
    'MD-' || floor(random() * 100000)::text,
    150.00,
    '09:00:00',
    '17:00:00',
    30
FROM users
WHERE email = 'neil.morales0010@gmail.com'
    AND NOT EXISTS (
        SELECT 1
        FROM doctors
        WHERE doctors.user_id = users.id
    );