#!/usr/bin/env tsx
// ========================================
// Apply Database Migration
// Run: npx tsx scripts/apply-migration.ts
// ========================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('\n========================================');
  console.log('Applying Database Migration');
  console.log('========================================\n');

  try {
    // Read migration file
    const migrationPath = resolve(__dirname, '../src/lib/supabase/migration-add-missing-columns.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded\n');
    console.log('SQL to execute:');
    console.log('─'.repeat(50));
    console.log(migrationSQL);
    console.log('─'.repeat(50));
    console.log('');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error);
        console.error('Statement:', statement);

        // If exec_sql doesn't exist, try direct execution (this won't work for DDL, but shows the error)
        console.log('\n⚠️  exec_sql function not available.');
        console.log('Please run the migration manually in Supabase SQL Editor:');
        console.log('\n1. Go to https://supabase.com/dashboard/project/ydgoqzvoigiaaacknsdf/sql/new');
        console.log('2. Copy the SQL from: src/lib/supabase/migration-add-missing-columns.sql');
        console.log('3. Paste and run it\n');
        process.exit(1);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
      }
    }

    console.log('========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n📝 Manual migration required:');
    console.log('1. Go to https://supabase.com/dashboard/project/ydgoqzvoigiaaacknsdf/sql/new');
    console.log('2. Copy the SQL from: src/lib/supabase/migration-add-missing-columns.sql');
    console.log('3. Paste and run it\n');
    process.exit(1);
  }
}

applyMigration();
