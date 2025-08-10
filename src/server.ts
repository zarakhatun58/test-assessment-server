import mongoose from 'mongoose';
import app from './app';
import path from 'path';
import fs from 'fs';
import Question from './models/Question';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

//   try {
//     await mongoose.connect(MONGO_URI)
//       .then(() => {
//         console.log('MongoDB connected');
//         app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//       })
//     console.log('Connected to MongoDB');
//     const dataPath = path.join(__dirname, 'data/questions.json');
//     const questions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
//     const result = await Question.insertMany(questions);
//     console.log(`Successfully imported ${result.length} questions.`);
//     process.exit(0);
//   } catch (err) {
//     console.error('Failed to import questions:', err);
//     process.exit(1);
//   }
// }

// importQuestions();