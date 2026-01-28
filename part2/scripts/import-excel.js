/**
 * Excel Import Script for KHTMTHA Game
 * Imports questions from Excel files into Supabase
 * 
 * Usage: node scripts/import-excel.js
 */

import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client
const supabaseUrl = 'https://judlqxxkbptuauaexjxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZGxxeHhrYnB0dWF1YWV4anh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTA0MTksImV4cCI6MjA4MDY2NjQxOX0.c-KItvik4vrDfs9w1I-nYjGHJkyuVU3ckawMF_pGMU8';
const supabase = createClient(supabaseUrl, supabaseKey);

const EXCEL_ROOT = path.join(__dirname, '..', 'All files excel');

/**
 * Parse filename to extract chapter and part info
 * E.g., "Biology_Ch1_Part1_Review.xlsx" -> { chapter: 1, part: 1 }
 */
function parseFileName(filename) {
    const chMatch = filename.match(/Ch(\d+)/i);
    const partMatch = filename.match(/Part(\d+)/i);
    return {
        chapter: chMatch ? parseInt(chMatch[1]) : null,
        part: partMatch ? parseInt(partMatch[1]) : 1
    };
}

/**
 * Parse Excel file and extract questions
 */
function parseExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header row
    const questions = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue; // Skip empty rows

        questions.push({
            question_no: row[0] || i,
            question_text: row[1] || '',
            question_type: row[2] || '',
            option_a: row[3] || '',
            option_b: row[4] || '',
            option_c: row[5] || null,
            option_d: row[6] || null,
            correct_answer: row[3] || '' // Assuming first option (A) is correct
        });
    }
    return questions;
}

/**
 * Main import function
 */
async function importAllData() {
    console.log('🚀 Starting Excel import...\n');

    // Get subjects
    const { data: subjects } = await supabase.from('subjects').select('*');
    console.log(`📚 Found ${subjects.length} subjects`);

    // Get categories
    const { data: categories } = await supabase.from('categories').select('*, subjects(name)');
    console.log(`📁 Found ${categories.length} categories\n`);

    let totalQuestions = 0;
    let totalStages = 0;

    for (const subject of subjects) {
        console.log(`\n=== Processing ${subject.name} ===`);
        const subjectPath = path.join(EXCEL_ROOT, subject.name);

        for (const category of categories.filter(c => c.subject_id === subject.id)) {
            const categoryPath = path.join(subjectPath, category.name);
            console.log(`\n📂 ${category.name}:`);

            try {
                const files = await readdir(categoryPath);
                const xlsxFiles = files.filter(f => f.endsWith('.xlsx'));

                for (const file of xlsxFiles) {
                    const filePath = path.join(categoryPath, file);
                    const { chapter, part } = parseFileName(file);

                    // Create stage
                    const stageName = file.replace('.xlsx', '');
                    const { data: stage, error: stageError } = await supabase
                        .from('stages')
                        .insert({
                            category_id: category.id,
                            name: stageName,
                            name_ar: `الجزء ${part}${chapter ? ` - الفصل ${chapter}` : ''}`,
                            chapter_no: chapter,
                            part_no: part,
                            order_index: chapter ? (chapter * 10 + part) : part
                        })
                        .select()
                        .single();

                    if (stageError) {
                        console.error(`  ❌ Error creating stage ${stageName}:`, stageError.message);
                        continue;
                    }

                    // Parse questions
                    const questions = parseExcelFile(filePath);

                    // Insert questions
                    const questionsToInsert = questions.map(q => ({
                        ...q,
                        stage_id: stage.id
                    }));

                    const { error: qError } = await supabase
                        .from('questions')
                        .insert(questionsToInsert);

                    if (qError) {
                        console.error(`  ❌ Error inserting questions:`, qError.message);
                    } else {
                        // Update stage question count
                        await supabase
                            .from('stages')
                            .update({ total_questions: questions.length })
                            .eq('id', stage.id);

                        console.log(`  ✅ ${stageName}: ${questions.length} questions`);
                        totalQuestions += questions.length;
                        totalStages++;
                    }
                }
            } catch (err) {
                console.error(`  ⚠️ Could not read ${categoryPath}:`, err.message);
            }
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Import complete!`);
    console.log(`📊 ${totalStages} stages imported`);
    console.log(`❓ ${totalQuestions} questions imported`);
}

importAllData().catch(console.error);
