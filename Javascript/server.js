const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/save-recipe', (req, res) => {
    const { cellLabel, recipe } = req.body;
    const filePath = path.join(__dirname, 'user.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user.json:', err);
            return res.status(500).send('Server error');
        }

        let userData = {};
        try {
            userData = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing user.json:', parseErr);
        }

        if (!userData.mealPlan) userData.mealPlan = {};
        userData.mealPlan[cellLabel] = recipe;

        fs.writeFile(filePath, JSON.stringify(userData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to user.json:', writeErr);
                return res.status(500).send('Server error');
            }

            res.send({ message: 'Recipe saved successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
