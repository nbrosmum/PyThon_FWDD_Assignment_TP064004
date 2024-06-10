const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // Display quiz result
    router.get('/', (req, res) => {
        let totalScore = 0; // Initialize total score variable

        db.query(
            'SELECT q.question_text, a.answer_text AS correct_answer, ua.answer_text AS user_answer, (a.id = r.selected_answer_id) AS correct FROM responses r JOIN questions q ON r.question_id = q.id JOIN answers a ON q.id = a.question_id AND a.is_correct = 1 LEFT JOIN answers ua ON r.selected_answer_id = ua.id WHERE r.session_id = ?',
            [req.sessionID],
            (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send('An error occurred');
                }

                // Calculate total score
                results.forEach(result => {
                    if (result.correct === 1) {
                        totalScore++; // Increment score for each correct answer
                    }
                });

                res.render('results', { results, totalScore, title: "Quiz Results", email: req.session.user_email, type: req.session.user_type,user: req.session.user }); // Pass totalScore to the template
            }
        );
    });

    return router;
};
