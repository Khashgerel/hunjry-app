const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    user: 'hunjry-app',
    password: '12345678',
    database: 'recipe_db',
    port: 5432
});

const db = {
    async getUser(userId) {
        const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        return rows[0];
    },

    async createUser(username, password, address, phoneNumber, email) {
        const { rows } = await pool.query(
            'INSERT INTO users (username, password, address, phone_number, email) VALUES ($1, $2, $3, $4, $5) RETURNING user_id',
            [username, password, address, phoneNumber, email]
        );
        return rows[0].user_id;
    },

    async getAllRecipes() {
        const { rows } = await pool.query('SELECT * FROM recipes');
        return rows;
    },

    async getRecipe(recipeId) {
        const { rows: [recipe] } = await pool.query('SELECT * FROM recipes WHERE recipe_id = $1', [recipeId]);
        if (recipe) {
            const { rows: ingredients } = await pool.query(
                `SELECT i.name 
                FROM ingredients i 
                JOIN recipe_ingredients ri ON i.ingredient_id = ri.ingredient_id 
                WHERE ri.recipe_id = $1`,
                [recipeId]
            );
            const { rows: instructions } = await pool.query(
                'SELECT instruction_text FROM instructions WHERE recipe_id = $1 ORDER BY step_number',
                [recipeId]
            );
            recipe.ingredients = ingredients.map(i => i.name);
            recipe.instructions = instructions.map(i => i.instruction_text);
            return recipe;
        }
        return null;
    },

    async getAllIngredients() {
        const { rows } = await pool.query('SELECT name FROM ingredients');
        return rows.map(row => row.name);
    },

    async getLikedRecipes(userId) {
        const { rows } = await pool.query(
            `SELECT r.* 
            FROM recipes r 
            JOIN liked_foods lf ON r.recipe_id = lf.recipe_id 
            WHERE lf.user_id = $1`,
            [userId]
        );
        return rows;
    },

    async addLikedRecipe(userId, recipeId) {
        try {
            await pool.query(
                'INSERT INTO liked_foods (user_id, recipe_id) VALUES ($1, $2)',
                [userId, recipeId]
            );
            return true;
        } catch (error) {
            console.error('Error adding liked recipe:', error);
            return false;
        }
    },

    async getPlannedMeals(userId) {
        const { rows } = await pool.query(
            `SELECT r.*, pf.planned_date 
            FROM recipes r 
            JOIN planned_foods pf ON r.recipe_id = pf.recipe_id 
            WHERE pf.user_id = $1
            ORDER BY pf.planned_date`,
            [userId]
        );
        return rows;
    },

    async addPlannedMeal(userId, recipeId, plannedDate) {
        try {
            await pool.query(
                'INSERT INTO planned_foods (user_id, recipe_id, planned_date) VALUES ($1, $2, $3)',
                [userId, recipeId, plannedDate]
            );
            return true;
        } catch (error) {
            console.error('Error adding planned meal:', error);
            return false;
        }
    },

    async getComments(postId) {
        const { rows } = await pool.query(
            `SELECT c.*, u.username, u.email 
            FROM comments c 
            JOIN users u ON c.user_id = u.user_id 
            WHERE c.post_id = $1`,
            [postId]
        );
        return rows;
    },

    async addComment(userId, postId, body) {
        const { rows } = await pool.query(
            'INSERT INTO comments (user_id, post_id, body) VALUES ($1, $2, $3) RETURNING comment_id',
            [userId, postId, body]
        );
        return rows[0].comment_id;
    },

    async importDataFromJson() {
        try {
            const recipesData = require('./json/recipes.json');
            const ingredientsData = require('./json/ingredients.json');
            const userData = require('./json/user.json');

            for (const user of userData.users) {
                await pool.query(
                    'INSERT INTO users (user_id, username, password, address, phone_number, email) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id) DO NOTHING',
                    [user.userId, user.username, user.password, user.address, user.phoneNumber, user.email]
                );
            }

            for (const recipe of recipesData.recipes) {
                await pool.query(
                    'INSERT INTO recipes (recipe_id, title, description, image_url, cooking_time, servings) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (recipe_id) DO NOTHING',
                    [recipe.id, recipe.title, recipe.description, recipe.imageUrl, recipe.cookingTime, recipe.servings]
                );

                for (const ingredient of recipe.ingredients) {
                    const { rows } = await pool.query(
                        'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING ingredient_id',
                        [ingredient]
                    );
                    const ingredientId = rows[0].ingredient_id;

                    await pool.query(
                        'INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [recipe.id, ingredientId]
                    );
                }

                for (let i = 0; i < recipe.instructions.length; i++) {
                    await pool.query(
                        'INSERT INTO instructions (recipe_id, step_number, instruction_text) VALUES ($1, $2, $3) ON CONFLICT (recipe_id, step_number) DO NOTHING',
                        [recipe.id, i + 1, recipe.instructions[i]]
                    );
                }
            }

            for (const user of userData.users) {
                if (user.likedFoods) {
                    for (const recipeId of user.likedFoods) {
                        await pool.query(
                            'INSERT INTO liked_foods (user_id, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                            [user.userId, recipeId]
                        );
                    }
                }
            }

            console.log('Data import completed successfully');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        client.release();
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

testConnection();

module.exports = db; 