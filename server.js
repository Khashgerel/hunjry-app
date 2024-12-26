const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
let PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const recipesData = JSON.parse(fs.readFileSync('./json/recipes.json'));
const ingredientsData = JSON.parse(fs.readFileSync('./json/ingredients.json'));
const commentsData = JSON.parse(fs.readFileSync('./json/comments.json'));
const userData = JSON.parse(fs.readFileSync('./json/user.json'));

app.get('/api/recipes', (req, res) => {
  res.json(recipesData);
});

app.get('/api/comments', (req,res) => {
  res.json(commentsData);
});

app.get('/api/ingredients', (req, res) => {
  res.json(ingredientsData);
});

app.get('/api/users', (req, res) => {
    // Send the entire userData object
    res.json(userData);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'htmls', 'login.html'));
});

app.get('/htmls/:file', (req, res) => {
  const file = req.params.file;
  res.sendFile(path.join(__dirname, 'public', 'htmls', file));
});

app.post('/api/like-food', (req, res) => {
    const { userId, recipeId } = req.body;
    
    // Find user in userData
    const user = userData.users.find(u => u.userId === userId);
    
    if (user) {
        // Initialize likedFoods array if it doesn't exist
        if (!user.likedFoods) {
            user.likedFoods = [];
        }
        
        // Add recipe if not already liked
        if (!user.likedFoods.includes(recipeId)) {
            user.likedFoods.push(recipeId);
            
            // Save updated data back to user.json
            fs.writeFileSync('./json/user.json', JSON.stringify(userData, null, 2));
            
            res.json({ success: true, message: 'Food added to favorites' });
        } else {
            // Remove from liked foods if already liked
            user.likedFoods = user.likedFoods.filter(id => id !== recipeId);
            fs.writeFileSync('./json/user.json', JSON.stringify(userData, null, 2));
            
            res.json({ success: true, message: 'Food removed from favorites' });
        }
    } else {
        res.json({ success: false, message: 'User not found' });
    }
});

app.get('/api/user/:userId/liked-recipes', (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = userData.users.find(u => u.userId === userId);
    
    if (user) {
        // Initialize empty array if likedFoods doesn't exist
        if (!user.likedFoods) {
            user.likedFoods = [];
        }
        
        // Get full recipe details for each liked food
        const likedRecipes = user.likedFoods
            .map(recipeId => 
                recipesData.recipes.find(recipe => recipe.id === recipeId)
            )
            .filter(recipe => recipe !== undefined); // Remove any undefined recipes
        
        res.json(likedRecipes);
    } else {
        // Send empty array if user not found
        res.json([]);
    }
});

app.get('*', (req, res) => {
    // This will handle any undefined routes
    res.redirect('/htmls/login.html');
});

const server = app.listen(PORT)
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
      PORT++;
      server.close();
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    }
  })
  .on('listening', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

