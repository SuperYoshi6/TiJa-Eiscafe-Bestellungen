import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bkrkztfybcmccwjjufym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcmt6dGZ5YmNtY2N3amp1ZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTk0OTAsImV4cCI6MjA2NTQ5NTQ5MH0.Wrtn346kdT51S7xyr2eN97idN7pkMGFhmAMLzW_-pvU';

export const supabase = createClient(supabaseUrl, supabaseKey);