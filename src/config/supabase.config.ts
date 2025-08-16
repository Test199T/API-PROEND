export const supabaseConfig = {
  url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
};

// Check if environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Warning: Using default Supabase configuration');
  console.warn('   Please add the following to your .env file for production:');
  console.warn('   SUPABASE_URL=your_actual_supabase_url');
  console.warn('   SUPABASE_ANON_KEY=your_actual_supabase_anon_key');
  console.warn('');
  console.warn('   Current values:');
  console.warn(
    `   SUPABASE_URL: ${process.env.SUPABASE_URL || 'Using default'}`,
  );
  console.warn(
    `   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'SET' : 'Using default'}`,
  );
}
