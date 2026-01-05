
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
