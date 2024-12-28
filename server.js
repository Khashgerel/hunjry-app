const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const apiDocs = require('./api-docs.json');

const app = express();
let PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Swagger documentation route - Move this BEFORE other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

// Read recipes data
let recipesData;
try {
    recipesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'recipes.json'), 'utf8'));
} catch (error) {
    console.error('Error reading recipes.json:', error);
    recipesData = { recipes: [] };
}

// Read ingredients data
let ingredientsData;
try {
    ingredientsData = JSON.parse(fs.readFileSync('./json/ingredients.json'));
} catch (error) {
    console.error('Error reading ingredients.json:', error);
    ingredientsData = { ingredients: [] };
}

// Read user data
let userData;
try {
    userData = JSON.parse(fs.readFileSync('./json/user.json'));
} catch (error) {
    console.error('Error reading user.json:', error);
    userData = { users: [] };
}

app.get('/api/recipes', (req, res) => {
    try {
        const updatedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'recipes.json'), 'utf8'));
        res.json(updatedData);
    } catch (error) {
        console.error('Error serving recipes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/ingredients', (req, res) => {
    res.json(ingredientsData);
});

app.get('/api/users', (req, res) => {
    res.json(userData);
});

app.post('/api/comments', (req, res) => {
    const { recipeId, userId, body } = req.body;
    
    try {
        // Read the current recipes
        const recipesPath = path.join(__dirname, 'json', 'recipes.json');
        const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
        
        // Find the recipe
        const recipe = recipesData.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Жор олдсонгүй' });
        }
        
        // Initialize comments array if it doesn't exist
        if (!recipe.comments) {
            recipe.comments = [];
        }
        
        // Add new comment
        const newComment = {
            id: recipe.comments.length > 0 ? Math.max(...recipe.comments.map(c => c.id)) + 1 : 1,
            body: body,
            userId: userId
        };
        
        recipe.comments.push(newComment);
        
        // Save updated recipes back to file
        fs.writeFileSync(recipesPath, JSON.stringify(recipesData, null, 2));
        
        res.json({ success: true, comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Сэтгэгдэл нэмэх үед алдаа гарлаа' });
    }
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

