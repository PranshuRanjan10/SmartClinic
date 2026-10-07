const bcrypt = require('bcryptjs');

async function createAdminHash() {
  const password = 'owner123@321';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== Admin User SQL ===\n');
  console.log(`INSERT INTO users (name, email, password, role) VALUES`);
  console.log(`('administration', 'everything_everyone@owner.com', '${hash}', 'admin');`);
  console.log('\n=== Copy the above SQL and run it in Supabase SQL Editor ===\n');
}

createAdminHash();
