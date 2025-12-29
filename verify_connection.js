
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env manually since we are running with node
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) return {};
        const envConfig = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        return env;
    } catch (e) {
        console.error("Error loading .env", e);
        return {};
    }
};

const env = loadEnv();
const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

console.log("Checking Supabase Connection...");
console.log(`URL: ${supabaseUrl ? 'Found' : 'MISSING'}`);
console.log(`Key: ${supabaseKey ? 'Found' : 'MISSING'}`);

if (!supabaseUrl || !supabaseKey) {
    console.error("ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("CONNECTION FAILED:", error.message);
            console.error("Details:", error);
        } else {
            console.log("CONNECTION SUCCESSFUL! Supabase is reachable.");
        }
    } catch (err) {
        console.error("UNEXPECTED ERROR:", err);
    }
}

checkConnection();
