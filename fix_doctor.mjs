import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    const { data: users, error: userErr } = await supabase.from('users').select('*').eq('email', 'neil.morales0010@gmail.com');
    if (userErr || !users || users.length === 0) {
        console.log('User not found or error:', userErr);
        return;
    }
    const user = users[0];
    console.log('Found user:', user.id);

    const { data: existingDoctor } = await supabase.from('doctors').select('*').eq('user_id', user.id);
    if (existingDoctor && existingDoctor.length > 0) {
        console.log('Doctor profile already exists:', existingDoctor[0].id);
        return;
    }

    const { data: doctor, error: docErr } = await supabase.from('doctors').insert({
        user_id: user.id,
        specialization: 'General Practice',
        license_number: 'MD-' + Math.floor(Math.random() * 100000),
        consultation_fee: 150.00,
        working_hours_start: '09:00:00',
        working_hours_end: '17:00:00',
        slot_duration: 30
    }).select();

    if (docErr) console.error('Error creating doctor:', docErr);
    else console.log('Successfully created doctor profile:', doctor);
}

fix();
