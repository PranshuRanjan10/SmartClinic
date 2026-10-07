// Script to check if database tables exist
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  const tables = [
    'users',
    'doctors',
    'patients',
    'appointments',
    'prescriptions',
    'medicines',
    'prescription_medicines',
    'pharmacy_orders',
    'payments'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table "${table}" - NOT FOUND or ERROR: ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" - EXISTS`);
      }
    } catch (err) {
      console.log(`❌ Table "${table}" - ERROR: ${err.message}`);
    }
  }

  console.log('\n📊 Checking for existing users...');
  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (!error && data) {
      console.log(`✅ Found ${count || 0} users in database`);
      if (data.length > 0) {
        console.log('\nUsers:');
        data.forEach(user => {
          console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Could not fetch users');
  }
}

checkTables().then(() => {
  console.log('\n✨ Database check complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
