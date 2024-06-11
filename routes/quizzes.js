const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // Fetch quiz and questions
    router.get('/', (req, res) => {
        const quizId = 1; // Assuming a single quiz for simplicity

        // Fetch quiz
        db.query(
            'SELECT * FROM quizzes WHERE id = ?',
            [quizId],
            (error, quizResults) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('An error occurred');
                }

                const quiz = quizResults[0];

                // Fetch questions
                db.query(
                    'SELECT * FROM questions WHERE quiz_id = ?',
                    [quizId],
                    (error, questionResults) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).send('An error occurred');
                        }

                        const questions = questionResults;

                        // Fetch answers
                        db.query(
                            'SELECT * FROM answers WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)',
                            [quizId],
                            (error, answerResults) => {
                                if (error) {
                                    console.error(error);
                                    return res.status(500).send('An error occurred');
                                }

                                const answers = answerResults;

                                // Map questions with their answers
                                const questionsWithAnswers = questions.map(question => {
                                    return {
                                        ...question,
                                        answers: answers.filter(answer => answer.question_id === question.id)
                                    };
                                });

                                // Render the quiz page with fetched data
                                res.render('quizzes', {quiz: quiz, questions: questionsWithAnswers, title: "Python Quiz", email: req.session.user_email, type: req.session.user_type, user: req.session.user });
                            }
                        );
                    }
                );
            }
        );
    });
 

    // Handle quiz submission
    router.post('/submit', (req, res) => {
        const responses = Object.keys(req.body).map(key => {
            return {
                question_id: parseInt(key.split('-')[1]),
                selected_answer_id: parseInt(req.body[key]),
                session_id: req.sessionID // Using session ID to track user responses
            };
        });

        const sql = 'INSERT INTO responses (question_id, selected_answer_id, session_id) VALUES ?';
        const values = responses.map(response => [response.question_id, response.selected_answer_id, response.session_id]);

        db.query(sql, [values], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('An error occurred');
            }

            res.redirect('/results');
        });
    });

    return router;
};
