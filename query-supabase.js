const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching profiles from Supabase...");
  
  const { data: profiles, error: profileError } = await supabase
    .from('Profile') // Assuming the table is named 'Profile' in Prisma
    .select('*');

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
  } else {
    console.log("=== PROFILES ===");
    console.log(JSON.stringify(profiles, null, 2));
  }
  
  console.log("\nFetching users from Supabase...");
  const { data: users, error: userError } = await supabase
    .from('User') // Assuming the table is named 'User' in Prisma
    .select('id, name, email, role, isActive');

  if (userError) {
    console.error("Error fetching users:", userError);
  } else {
    console.log("=== USERS ===");
    console.log(JSON.stringify(users, null, 2));
  }
}

main().catch(console.error);
