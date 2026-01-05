
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRankings() {
    console.log('Fetching a user ID...');
    const { data: users } = await supabase.from('reviews').select('user_id').limit(1);
    if (!users || users.length === 0) {
        console.log('No reviews found to test with.');
        return;
    }
    // const userId = users[0].user_id; // Use real user ID
    const userId = '2d8da98b-e6cb-4acb-a6dc-488c4b126aa5'; // From screenshot

    console.log(`Testing rankings for user: ${userId}`);

    const start = Date.now();
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            rating,
            movies (
                id, title, year, poster_url, director, genres, extended_data
            )
        `)
        .eq('user_id', userId)
        .gte('rating', 7);

    const queryTime = Date.now() - start;
    console.log(`Query took ${queryTime}ms. Found ${reviews?.length || 0} reviews.`);

    if (error) {
        console.error('Query Error:', error);
        return;
    }

    if (reviews.length > 0) {
        const sampleMovie = Array.isArray(reviews[0].movies) ? reviews[0].movies[0] : reviews[0].movies;
        console.log('Sample movie title:', sampleMovie?.title);

        // Check size of extended_data
        const jsonSize = JSON.stringify(sampleMovie?.extended_data || {}).length;
        console.log(`Sample extended_data size: ${jsonSize} bytes`);

        const totalSize = JSON.stringify(reviews).length;
        console.log(`Total payload size: ${(totalSize / 1024).toFixed(2)} KB`);
    }

    // Attempt processing (simulate getRanking logic)
    // ...
}

debugRankings();
