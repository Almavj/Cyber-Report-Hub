import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.SUPABASE_URL;
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorageBucket = envVars.SUPABASE_STORAGE_BUCKET || 'cber-report-hub';

console.log('🔍 Storage Test Configuration:');
console.log(`  Supabase URL: ${supabaseUrl}`);
console.log(`  Bucket: ${supabaseStorageBucket}`);
console.log(`  Service Role Key: ${supabaseServiceRoleKey ? '✓ Present' : '✗ Missing'}`);
console.log('');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required env vars (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

try {
  console.log('📡 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('📂 Listing files in bucket...');
  const { data, error } = await supabase.storage
    .from(supabaseStorageBucket)
    .list('', { limit: 10 });

  if (error) {
    console.error('❌ Error listing files:', error.message);
    process.exit(1);
  }

  console.log('✅ Storage is reachable and accessible!');
  console.log(`   Found ${data.length} items in bucket:`);
  data.forEach(item => {
    console.log(`   - ${item.name} (${item.metadata?.size || '?'} bytes)`);
  });

  // Test upload capability
  console.log('');
  console.log('🧪 Testing upload capability...');
  const testFileName = `test-${Date.now()}.txt`;
  const testContent = new TextEncoder().encode('Storage test successful!');
  
  const { error: uploadError } = await supabase.storage
    .from(supabaseStorageBucket)
    .upload(testFileName, testContent, { upsert: true });

  if (uploadError) {
    console.error('❌ Upload test failed:', uploadError.message);
    process.exit(1);
  }

  console.log(`✅ Upload successful! Test file: ${testFileName}`);

  // Test delete
  console.log('');
  console.log('🧹 Cleaning up test file...');
  const { error: deleteError } = await supabase.storage
    .from(supabaseStorageBucket)
    .remove([testFileName]);

  if (deleteError) {
    console.warn('⚠️  Could not delete test file:', deleteError.message);
  } else {
    console.log('✅ Test file deleted.');
  }

  console.log('');
  console.log('✅ All storage tests passed!');
  process.exit(0);
} catch (err) {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
}
