// Quick check if Supabase migration is needed
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMigration() {
  console.log('\n🔍 Checking Supabase schema...\n');

  // Try to query with the new columns
  const { data, error } = await supabase
    .from('stories')
    .select('id, tier, teaser_url, deluxe_video_url, duration_seconds')
    .limit(1);

  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('❌ Migration NOT applied');
      console.log('Missing columns detected:', error.message);
      console.log('\n📝 Please run this SQL in Supabase dashboard:');
      console.log('https://supabase.com/dashboard/project/ydgoqzvoigiaaacknsdf/sql/new\n');
      console.log('ALTER TABLE public.stories');
      console.log('ADD COLUMN IF NOT EXISTS teaser_url TEXT,');
      console.log('ADD COLUMN IF NOT EXISTS deluxe_video_url TEXT,');
      console.log('ADD COLUMN IF NOT EXISTS tier TEXT,');
      console.log('ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 90;\n');
      process.exit(1);
    } else {
      console.log('⚠️  Query error:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Migration applied successfully!');
    console.log('All required columns exist in the database.\n');
    process.exit(0);
  }
}

checkMigration();
