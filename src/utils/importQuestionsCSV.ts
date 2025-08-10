import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import Question from '../models/Question';

async function importQuestionsCSV() {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-db-name');
    console.log('Connected to MongoDB');

    const dataPath = path.join(__dirname, 'questions.csv');
    const questions: any[] = [];

    fs.createReadStream(dataPath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        questions.push({
          competency: row.competency,
          level: row.level,
          questionText: row.questionText,
          options: row.options.split('|'),
          correctAnswerIndex: Number(row.correctAnswerIndex),
        });
      })
      .on('end', async () => {
        const result = await Question.insertMany(questions);
        console.log(`Imported ${result.length} questions successfully.`);
        process.exit(0);
      });
  } catch (err) {
    console.error('Error importing questions:', err);
    process.exit(1);
  }
}

importQuestionsCSV();
