
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Cargar variables de entorno
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    process.env[key] = value;
                }
            });
            console.log("✅ .env.local cargado");
        } else {
            console.warn("⚠️ No se encontró .env.local, usando process.env");
        }
    } catch (e) {
        console.error("Error cargando .env.local:", e);
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usar Service Role para evitar problemas de Auth en script

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);


async function verifyQuery() {
    console.log("🔍 Iniciando verificación de datos...");

    // 1. Revisar Watchlists GLOBALMENTE (donde el importador guarda los datos)
    const { count: watchlistCount, error: wlError } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })
        .not('user_rating', 'is', null);

    console.log(`📋 Watchlist items con rating (Global): ${watchlistCount}`);

    // 2. Revisar Reviews GLOBALMENTE
    const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

    console.log(`📋 Reviews totales (Global): ${reviewCount}`);

    if (watchlistCount > 0 && reviewCount === 0) {
        console.warn("\n⚠️ ALERTA CRÍTICA: Desconexión de Datos Confirmada");
        console.warn("   Hay ratings en 'watchlists' pero 0 en 'reviews'.");
        console.warn("   El sistema de Ranking lee de 'reviews'. El importador escribe en 'watchlists'.");
        console.warn("   -> ESTA ES LA CAUSA DE QUE LOS RANKINGS NO CARGUEN.");
        return;
    }

    // 3. Buscar un usuario que tenga reseñas (si existen) para prueba de performance
    const { data: validUser, error: userError } = await supabase
        .from('reviews')
        .select('user_id')
        .limit(1)
        .neq('user_id', null)
        .order('created_at', { ascending: false });

    if (userError || !validUser || validUser.length === 0) {
        console.log("\n❌ No hay reseñas para probar la query de performance.");
        return;
    }

    const userId = validUser[0].user_id;

    const minRating = 7;
    console.log(`\n👤 Usuario detectado para pruebas: ${userId}`);


    const start = performance.now();

    // La misma query que pusimos en getDashboardRankings
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            rating,
            movies (
                id,
                title,
                year,
                poster_url,
                director, 
                genres,
                extended_data
            )
        `)
        .eq('user_id', userId)
        .gte('rating', minRating);

    const end = performance.now();

    if (error) {
        console.error('❌ Error en query:', error);
        return;
    }

    const duration = (end - start).toFixed(2);
    console.log(`✅ Query completada en ${duration}ms`);
    console.log(`📊 Total de reseñas encontradas: ${reviews.length}`);

    if (reviews.length > 0) {
        const sample = reviews[0];
        console.log('\n📄 Muestra de datos (primera reseña):');
        console.log(`   - Película: ${sample.movies?.title} (${sample.movies?.year})`);
        console.log(`   - Director: ${sample.movies?.director}`);
        console.log(`   - Extended Data (keys): ${sample.movies?.extended_data ? Object.keys(sample.movies.extended_data).join(', ') : 'N/A'}`);

        // Verificar tamaño aproximado del payload
        const size = JSON.stringify(reviews).length / 1024;
        console.log(`\n📦 Tamaño total del payload: ${size.toFixed(2)} KB`);
    } else {
        console.log('⚠️ No se encontraron reseñas. ¿El usuario tiene datos?');


        // 2. Revisar Watchlists (donde el importador guarda los datos)
        const { count: watchlistCount, error: wlError } = await supabase
            .from('watchlists')
            .select('*', { count: 'exact', head: true })
            .not('user_rating', 'is', null);

        console.log(`\n📋 Watchlist items con rating: ${watchlistCount}`);

        if (watchlistCount > 0 && (!validUser || validUser.length === 0)) {
            console.warn("⚠️ ALERTA: Hay ratings en 'watchlists' pero 0 en 'reviews'.");
            console.warn("   El sistema de Ranking lee de 'reviews'. El importador escribe en 'watchlists'.");
            console.warn("   -> POSIBLE CAUSA DE RANKINGS VACÍOS.");
        }


    }
}

verifyQuery();
