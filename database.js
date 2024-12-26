const mysql = require('mysql2/promise');

// Database configuration
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',  // Your MySQL username
    password: 'your_password_here',  // Your MySQL password
    database: 'recipe_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database helper functions
const db = {
    // User related queries
    async getUser(userId) {
        const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        return rows[0];
    },

    async createUser(username, password, address, phoneNumber, email) {
        const [result] = await pool.query(
            'INSERT INTO users (username, password, address, phone_number, email) VALUES (?, ?, ?, ?, ?)',
            [username, password, address, phoneNumber, email]
        );
        return result.insertId;
    },

    // Recipe related queries
    async getAllRecipes() {
        const [rows] = await pool.query('SELECT * FROM recipes');
        return rows;
    },

    async getRecipe(recipeId) {
        const [recipe] = await pool.query('SELECT * FROM recipes WHERE recipe_id = ?', [recipeId]);
        if (recipe[0]) {
            const [ingredients] = await pool.query(
                `SELECT i.name 
                FROM ingredients i 
                JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id 
                WHERE ri.recipe_id = ?`,
                [recipeId]
            );
            const [instructions] = await pool.query(
                'SELECT instruction_text FROM instructions WHERE recipe_id = ? ORDER BY step_number',
                [recipeId]
            );
            recipe[0].ingredients = ingredients.map(i => i.name);
            recipe[0].instructions = instructions.map(i => i.instruction_text);
            return recipe[0];
        }
        return null;
    },

    // Ingredient related queries
    async getAllIngredients() {
        const [rows] = await pool.query('SELECT name FROM ingredients');
        return rows.map(row => row.name);
    },

    // User's liked recipes
    async getLikedRecipes(userId) {
        const [rows] = await pool.query(
            `SELECT r.* 
            FROM recipes r 
            JOIN liked_foods lf ON r.recipe_id = lf.recipe_id 
            WHERE lf.user_id = ?`,
            [userId]
        );
        return rows;
    },

    async addLikedRecipe(userId, recipeId) {
        try {
            await pool.query(
                'INSERT INTO liked_foods (user_id, recipe_id) VALUES (?, ?)',
                [userId, recipeId]
            );
            return true;
        } catch (error) {
            console.error('Error adding liked recipe:', error);
            return false;
        }
    },

    // User's planned meals
    async getPlannedMeals(userId) {
        const [rows] = await pool.query(
            `SELECT r.*, pf.planned_date 
            FROM recipes r 
            JOIN planned_foods pf ON r.recipe_id = pf.recipe_id 
            WHERE pf.user_id = ?
            ORDER BY pf.planned_date`,
            [userId]
        );
        return rows;
    },

    async addPlannedMeal(userId, recipeId, plannedDate) {
        try {
            await pool.query(
                'INSERT INTO planned_foods (user_id, recipe_id, planned_date) VALUES (?, ?, ?)',
                [userId, recipeId, plannedDate]
            );
            return true;
        } catch (error) {
            console.error('Error adding planned meal:', error);
            return false;
        }
    },

    // Comments related queries
    async getComments(postId) {
        const [rows] = await pool.query(
            `SELECT c.*, u.username, u.email 
            FROM comments c 
            JOIN users u ON c.user_id = u.user_id 
            WHERE c.post_id = ?`,
            [postId]
        );
        return rows;
    },

    async addComment(userId, postId, body) {
        const [result] = await pool.query(
            'INSERT INTO comments (user_id, post_id, body) VALUES (?, ?, ?)',
            [userId, postId, body]
        );
        return result.insertId;
    }
};

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

testConnection();

module.exports = db; 