const express = require('express');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const apiDocs = require('./api-docs.json');
const db = require('./database.js');

const app = express();
let PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

let recipesData;
try {
    recipesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'recipes.json'), 'utf8'));
} catch (error) {
    console.error('Error reading recipes.json:', error);
    recipesData = { recipes: [] };
}

let ingredientsData;
try {
    ingredientsData = JSON.parse(fs.readFileSync('./json/ingredients.json'));
} catch (error) {
    console.error('Error reading ingredients.json:', error);
    ingredientsData = { ingredients: [] };
}

let userData;
try {
    userData = JSON.parse(fs.readFileSync('./json/user.json'));
} catch (error) {
    console.error('Error reading user.json:', error);
    userData = { users: [] };
}

app.get('/api/recipes', (req, res) => {
    try {
        const recipesData = JSON.parse(fs.readFileSync('json/recipes.json', 'utf8'));
        res.json(recipesData);
    } catch (error) {
        console.error('Error reading recipes:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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
        const recipesPath = path.join(__dirname, 'json', 'recipes.json');
        const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
        
        const recipe = recipesData.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Жор олдсонгүй' });
        }
        
        if (!recipe.comments) {
            recipe.comments = [];
        }
        
        const newComment = {
            id: recipe.comments.length > 0 ? Math.max(...recipe.comments.map(c => c.id)) + 1 : 1,
            body: body,
            userId: userId
        };
        
        recipe.comments.push(newComment);
        
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
    
    const user = userData.users.find(u => u.userId === userId);
    
    if (user) {
        if (!user.likedFoods) {
            user.likedFoods = [];
        }
        
        if (!user.likedFoods.includes(recipeId)) {
            user.likedFoods.push(recipeId);
            
            fs.writeFileSync('./json/user.json', JSON.stringify(userData, null, 2));
            
            res.json({ success: true, message: 'Food added to favorites' });
        } else {
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
        if (!user.likedFoods) {
            user.likedFoods = [];
        }
        
        const likedRecipes = user.likedFoods
            .map(recipeId => 
                recipesData.recipes.find(recipe => recipe.id === recipeId)
            )
            .filter(recipe => recipe !== undefined); 
        
        res.json(likedRecipes);
    } else {
        res.json([]);
    }
});

app.get('/api/add-comment', (req, res) => {
    try {
        const { userId, recipeId, comment, date } = req.body;
        
        const recipesData = JSON.parse(fs.readFileSync('json/recipes.json', 'utf8'));
        const usersData = JSON.parse(fs.readFileSync('json/user.json', 'utf8'));
        
        const user = usersData.users.find(u => u.userId === userId);
        
        const recipe = recipesData.recipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }
        
        if (!recipe.comments) {
            recipe.comments = [];
        }
        
        recipe.comments.push({
            userId,
            userName: user ? user.name : 'Anonymous',
            comment,
            date
        });
        
        fs.writeFileSync('json/recipes.json', JSON.stringify(recipesData, null, 2));
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('*', (req, res) => {
    res.redirect('/htmls/login.html');
});

app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

async function initializeDatabase() {
    try {
        await db.importDataFromJson();
        console.log('Database initialized with JSON data');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase();

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
