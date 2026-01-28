/**
 * Import questions from Markdown files into Supabase
 * Handles both English and Biology formats correctly
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://judlqxxkbptuauaexjxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZGxxeHhrYnB0dWF1YWV4anh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTA0MTksImV4cCI6MjA4MDY2NjQxOX0.c-KItvik4vrDfs9w1I-nYjGHJkyuVU3ckawMF_pGMU8';

const supabase = createClient(supabaseUrl, supabaseKey);

const MARKDOWN_DIR = './all files markdown';

// Get category ID from database
async function getCategoryId(subjectName, categoryName) {
    const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .single();

    if (!subject) {
        console.error(`Subject not found: ${subjectName}`);
        return null;
    }

    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('subject_id', subject.id)
        .eq('name', categoryName)
        .single();

    return category?.id;
}

// Parse markdown table rows
function parseMarkdownTable(content) {
    const lines = content.split('\n');
    const rows = [];

    for (const line of lines) {
        // Skip empty lines and header/separator rows
        if (!line.trim() || !line.startsWith('|')) continue;
        if (line.includes('---')) continue;
        if (line.includes('# |') || line.includes('Question') || line.includes('السؤال')) continue;

        // Parse table row
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 6) {
            rows.push(cells);
        }
    }

    return rows;
}

// Parse English markdown file
// Format: | # | 1 | 1 | ch1-st1-b1 | She ... to school | (Complete with) | goes | go | going |
function parseEnglishFile(content) {
    const rows = parseMarkdownTable(content);
    const questions = [];

    for (const cells of rows) {
        // English format: cells[4] is question, cells[5] is type hint, cells[6-8] are options
        if (cells.length >= 8) {
            const questionNo = parseInt(cells[0]) || questions.length + 1;
            const question = cells[4]; // The actual question text
            const questionType = cells[5]; // Type hint like "(Complete with goes/go)"
            const optionA = cells[6];
            const optionB = cells[7];
            const optionC = cells[8] || null;
            const optionD = cells[9] || null;

            // For English, the correct answer is typically option A
            const correctAnswer = optionA;

            if (question && question.length > 5 && !question.includes('ch1-') && !question.includes('ch2-')) {
                questions.push({
                    question_no: questionNo,
                    question_text: question,
                    question_type: questionType,
                    option_a: optionA,
                    option_b: optionB,
                    option_c: optionC,
                    option_d: optionD,
                    correct_answer: correctAnswer
                });
            }
        }
    }

    return questions;
}

// Parse Biology markdown file
// Format: | # | السؤال | النوع | أ | ب | ج | د | الصحيح | الشرح |
function parseBiologyFile(content) {
    const rows = parseMarkdownTable(content);
    const questions = [];

    for (const cells of rows) {
        if (cells.length >= 7) {
            const questionNo = parseInt(cells[0]) || questions.length + 1;
            const question = cells[1];
            const questionType = cells[2];
            const optionA = cells[3];
            const optionB = cells[4];
            const optionC = cells[5];
            const optionD = cells[6];
            const answerLetter = cells[7]?.toLowerCase() || 'a';

            // Map letter to actual option
            const answerMap = { 'a': optionA, 'b': optionB, 'c': optionC, 'd': optionD };
            const correctAnswer = answerMap[answerLetter] || optionA;

            if (question && question.length > 5) {
                questions.push({
                    question_no: questionNo,
                    question_text: question,
                    question_type: questionType,
                    option_a: optionA,
                    option_b: optionB,
                    option_c: optionC,
                    option_d: optionD,
                    correct_answer: correctAnswer
                });
            }
        }
    }

    return questions;
}

// Extract stage info from filename - handles all formats
function parseFilename(filename) {
    // Format 1: Biology_Ch1_Part1_Review.md or English_Ch1_Part1_Review.md
    let match = filename.match(/(?:Biology|English)_Ch(\d+)_Part(\d+)_Review\.md/);
    if (match) {
        return {
            chapter: parseInt(match[1]),
            part: parseInt(match[2]),
            type: 'Review'
        };
    }

    // Format 2: English_FullYear_Part01.md or Biology_FullYear_Part01.md
    match = filename.match(/(?:Biology|English)_FullYear_Part(\d+)\.md/);
    if (match) {
        return {
            chapter: null,
            part: parseInt(match[1]),
            type: 'FullYear'
        };
    }

    // Format 3: English_HalfYear_Part01.md or Biology_HalfYear_Part01.md
    match = filename.match(/(?:Biology|English)_HalfYear_Part(\d+)\.md/);
    if (match) {
        return {
            chapter: null,
            part: parseInt(match[1]),
            type: 'HalfYear'
        };
    }

    return null;
}

// Process all markdown files in a directory
async function processDirectory(subjectName, categoryName, dirPath) {
    const categoryId = await getCategoryId(subjectName, categoryName);
    if (!categoryId) {
        console.error(`Category not found: ${subjectName}/${categoryName}`);
        return { stages: 0, questions: 0 };
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    let totalStages = 0;
    let totalQuestions = 0;

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileInfo = parseFilename(file);

        if (!fileInfo) {
            console.warn(`Could not parse filename: ${file}`);
            continue;
        }

        // Parse questions based on subject
        const questions = subjectName === 'English'
            ? parseEnglishFile(content)
            : parseBiologyFile(content);

        if (questions.length === 0) {
            console.warn(`No questions parsed from: ${file}`);
            continue;
        }

        // Generate stage name
        const stageName = fileInfo.chapter
            ? `الفصل ${fileInfo.chapter} - الجزء ${fileInfo.part}`
            : `المرحلة ${fileInfo.part}`;

        // Create stage (using correct column name: total_questions)
        const { data: stage, error: stageError } = await supabase
            .from('stages')
            .insert({
                category_id: categoryId,
                name: stageName,
                name_ar: stageName,
                chapter_no: fileInfo.chapter,
                part_no: fileInfo.part,
                total_questions: questions.length,
                order_index: fileInfo.chapter ? (fileInfo.chapter * 10 + fileInfo.part) : fileInfo.part
            })
            .select()
            .single();

        if (stageError) {
            console.error(`Error creating stage ${stageName}:`, stageError.message);
            continue;
        }

        totalStages++;

        // Insert questions
        const questionsToInsert = questions.map(q => ({
            stage_id: stage.id,
            question_no: q.question_no,
            question_text: q.question_text,
            question_type: q.question_type,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_answer: q.correct_answer
        }));

        const { error: qError } = await supabase
            .from('questions')
            .insert(questionsToInsert);

        if (qError) {
            console.error(`Error inserting questions for ${stageName}:`, qError.message);
        } else {
            totalQuestions += questions.length;
            console.log(`✅ ${subjectName}/${categoryName}: ${stageName} - ${questions.length} questions`);
        }
    }

    return { stages: totalStages, questions: totalQuestions };
}

// Main import function
async function main() {
    console.log('🚀 Starting markdown import...\n');

    const subjects = ['Biology', 'English'];
    const categories = ['Chapters_Review', 'FullYear', 'HalfYear'];

    let grandTotalStages = 0;
    let grandTotalQuestions = 0;

    for (const subject of subjects) {
        for (const category of categories) {
            const dirPath = path.join(MARKDOWN_DIR, subject, category);

            if (!fs.existsSync(dirPath)) {
                console.warn(`Directory not found: ${dirPath}`);
                continue;
            }

            console.log(`\n📁 Processing ${subject}/${category}...`);
            const { stages, questions } = await processDirectory(subject, category, dirPath);
            grandTotalStages += stages;
            grandTotalQuestions += questions;
        }
    }

    console.log('\n========================================');
    console.log(`✅ IMPORT COMPLETE!`);
    console.log(`   Total stages: ${grandTotalStages}`);
    console.log(`   Total questions: ${grandTotalQuestions}`);
    console.log('========================================');
}

main().catch(console.error);
