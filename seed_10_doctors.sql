-- Run this in your Supabase SQL Editor to instantly generate 10 Mock Doctors for testing
DO $$
DECLARE first_names TEXT [] := ARRAY ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
last_names TEXT [] := ARRAY ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
specializations TEXT [] := ARRAY ['Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedic Surgeon', 'Psychiatrist', 'General Practice', 'Oncologist', 'Endocrinologist', 'Gastroenterologist'];
first_name TEXT;
last_name TEXT;
new_email TEXT;
spec TEXT;
new_user_id UUID;
BEGIN FOR i IN 1..10 LOOP first_name := first_names [i];
last_name := last_names [i];
new_email := 'doctor' || i || '_' || lower(last_name) || '@smartclinic.com';
spec := specializations [i];
-- Check if user exists
SELECT id INTO new_user_id
FROM public.users
WHERE email = new_email;
-- Create User if missing
IF NOT FOUND THEN
INSERT INTO public.users (name, email, password, role)
VALUES (
        'Dr. ' || first_name || ' ' || last_name,
        new_email,
        'mock_hashed_pass',
        'doctor'
    )
RETURNING id INTO new_user_id;
END IF;
-- Create Doctor Profile if missing
IF NOT EXISTS (
    SELECT 1
    FROM public.doctors
    WHERE user_id = new_user_id
) THEN
INSERT INTO public.doctors (
        user_id,
        specialization,
        license_number,
        consultation_fee,
        working_hours_start,
        working_hours_end,
        slot_duration
    )
VALUES (
        new_user_id,
        spec,
        'MED-' || floor(random() * 899999 + 100000)::text,
        floor(random() * 200 + 100),
        '09:00:00',
        '17:00:00',
        30
    );
END IF;
END LOOP;
END $$;