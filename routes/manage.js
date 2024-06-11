const express = require('express');
const bodyParser = require('body-parser');

module.exports = (db) => {
    const router = express.Router();

    router.use(bodyParser.urlencoded({ extended: true }));

    router.get('/', (req, res) => {
        const quizId = 1; // Assuming a single quiz for simplicity

        db.query(
            'SELECT q.id AS question_id, q.question_text, a.id AS answer_id, a.answer_text, a.is_correct FROM questions q LEFT JOIN answers a ON q.id = a.question_id WHERE q.quiz_id = ?',
            [quizId],
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('An error occurred');
                }

                const questions = results.reduce((acc, row) => {
                    const question = acc.find(q => q.id === row.question_id);
                    if (question) {
                        question.answers.push({
                            id: row.answer_id,
                            text: row.answer_text,
                            is_correct: row.is_correct,
                        });
                    } else {
                        acc.push({
                            id: row.question_id,
                            text: row.question_text,
                            answers: [{
                                id: row.answer_id,
                                text: row.answer_text,
                                is_correct: row.is_correct,
                            }],
                        });
                    }
                    return acc;
                }, []);

                res.render('manage', { questions, title: 'Manage Quiz', email: req.session.user_email, type: req.session.user_type, user: req.session.user });
            }
        );
    });

    // Display form to add a new question
    router.get('/add', (req, res) => {
        res.render('add_question', { title: 'Add Quiz', email: req.session.user_email, type: req.session.user_type, user: req.session.user });
    });

    // Handle form submission to add a new question
    router.post('/add', (req, res) => {
        const { question_text, ...answerFields } = req.body;
        const quizId = 1; // Assuming a single quiz for simplicity

        console.log('Received form data:', req.body);

        // Transform answerFields into an array of answers
        const answers = [];
        for (let i = 0; i < 4; i++) { // Assuming there are always 4 answers
            if (answerFields[`answers[${i}][text]`]) {
                answers.push({
                    text: answerFields[`answers[${i}][text]`],
                    is_correct: answerFields[`answers[${i}][is_correct]`] === 'true'
                });
            }
        }

        db.query(
            'INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)',
            [quizId, question_text],
            (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('An error occurred');
                }

                const questionId = result.insertId;
                const answerData = answers.map(answer => [questionId, answer.text, answer.is_correct]);

                db.query(
                    'INSERT INTO answers (question_id, answer_text, is_correct) VALUES ?',
                    [answerData],
                    (error) => {
                        if (error) {
                            console.error(error);
                            return res.status(500).send('An error occurred');
                        }

                        res.redirect('/manage');
                    }
                );
            }
        );
    });

    // Display form to edit a question
    router.get('/edit/:id', (req, res) => {
        const questionId = req.params.id;

        db.query(
            'SELECT q.id AS question_id, q.question_text, a.id AS answer_id, a.answer_text, a.is_correct FROM questions q LEFT JOIN answers a ON q.id = a.question_id WHERE q.id = ?',
            [questionId],
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('An error occurred');
                }

                const question = {
                    id: results[0].question_id,
                    text: results[0].question_text,
                    answers: results.map(row => ({
                        id: row.answer_id,
                        text: row.answer_text,
                        is_correct: row.is_correct,
                    }))
                };

                res.render('edit_question', { question, title: 'Edit Quiz', email: req.session.user_email, type: req.session.user_type, user: req.session.user });
            }
        );
    });

    // Handle form submission to edit a question
    router.post('/edit/:id', (req, res) => {
        const questionId = req.params.id;
        const { question_text, ...answerFields } = req.body;

        db.query(
            'UPDATE questions SET question_text = ? WHERE id = ?',
            [question_text, questionId],
            (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('An error occurred');
                }

                // Transform answerFields into an array of answers
                const answers = [];
                for (let i = 0; i < 4; i++) { // Assuming there are always 4 answers
                    if (answerFields[`answers[${i}][text]`]) {
                        answers.push({
                            id: answerFields[`answers[${i}][id]`],
                            text: answerFields[`answers[${i}][text]`],
                            is_correct: answerFields[`answers[${i}][is_correct]`] === 'true'
                        });
                    }
                }

                const updateAnswerPromises = answers.map(answer => {
                    if (answer.id) {
                        return new Promise((resolve, reject) => {
                            db.query(
                                'UPDATE answers SET answer_text = ?, is_correct = ? WHERE id = ?',
                                [answer.text, answer.is_correct, answer.id],
                                (error) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve();
                                    }
                                }
                            );
                        });
                    } else {
                        return new Promise((resolve, reject) => {
                            db.query(
                                'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
                                [questionId, answer.text, answer.is_correct],
                                (error) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve();
                                    }
                                }
                            );
                        });
                    }
                });

                Promise.all(updateAnswerPromises)
                    .then(() => res.redirect('/manage'))
                    .catch(error => {
                        console.error(error);
                        res.status(500).send('An error occurred');
                    });
            }
        );
    });

    router.post('/delete/:id', (req, res) => {
        const questionId = req.params.id;

        // First delete the responses associated with the answers of the question
        db.query(
            'DELETE responses FROM responses INNER JOIN answers ON responses.selected_answer_id = answers.id WHERE answers.question_id = ?',
            [questionId],
            (error) => {
                if (error) {
                    console.error('Error deleting responses:', error);
                    return res.status(500).send('An error occurred while deleting responses');
                }

                // Then delete the answers associated with the question
                db.query(
                    'DELETE FROM answers WHERE question_id = ?',
                    [questionId],
                    (error) => {
                        if (error) {
                            console.error('Error deleting answers:', error);
                            return res.status(500).send('An error occurred while deleting answers');
                        }

                        // Finally, delete the question
                        db.query(
                            'DELETE FROM questions WHERE id = ?',
                            [questionId],
                            (error) => {
                                if (error) {
                                    console.error('Error deleting question:', error);
                                    return res.status(500).send('An error occurred while deleting the question');
                                }

                                res.redirect('/manage');
                            }
                        );
                    }
                );
            }
        );
    });

    return router;
};
