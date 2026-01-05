
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Manual env parser
const env = {};
try {
    const data = fs.readFileSync('.env.local', 'utf8');
    data.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
} catch (e) {
    console.log('No .env.local found');
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

async function clean() {
    console.log('Counting pending items...');
    const { count, error } = await supabase
        .from('import_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    if (error) {
        console.error('Error counting:', error);
        return;
    }

    console.log(`Found ${count} pending items.`);

    if (count > 0) {
        console.log('Deleting pending items...');
        const { error: delError } = await supabase
            .from('import_queue')
            .delete()
            .eq('status', 'pending');

        if (delError) console.error('Delete error:', delError);
        else console.log('Deleted successfully.');
    }
}

clean();
