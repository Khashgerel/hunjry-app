const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '12345678',
    database: 'recipe_db',
    port: 5432
});

const db = {
    async getUser(userId) {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM users WHERE user_id = $1',
                [userId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },
    async getUserByUsername(username) {
        try {
            const { rows } = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user by username:', error);
            return null;
        }
    },
    async createUser(username, password, address, phoneNumber, email) {
        try {
            const { rows } = await pool.query(
                `INSERT INTO users 
                (username, password, address, phone_number, email) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING user_id`,
                [username, password, address, phoneNumber, email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    },

    async updateUser(userId, userData) {
        try {
            const { rows } = await pool.query(
                `UPDATE users 
                SET username = $1, 
                    address = $2, 
                    phone_number = $3, 
                    email = $4 
                WHERE user_id = $5 
                RETURNING *`,
                [userData.username, userData.address, userData.phoneNumber, userData.email, userId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error updating user:', error);
            return null;
        }
    },

    async importUsersFromJson() {
        try {
            const usersData = JSON.parse(fs.readFileSync('json/user.json', 'utf8'));
            
            for (const user of usersData) {
                // Validate required fields
                if (!user.userId || !user.username) {
                    console.warn(`Skipping invalid user:`, user);
                    continue;
                }

                // Check if user already exists
                const existingUser = await pool.query(
                    'SELECT user_id FROM users WHERE user_id = $1',
                    [user.userId]
                );

                if (existingUser.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO users (
                            user_id,
                            username,
                            email,
                            password_hash,
                            created_at,
                            updated_at
                        ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                        [
                            user.userId,
                            user.username,
                            user.email || null,
                            user.password_hash || null
                        ]
                    );
                }
            }
            console.log('Users imported successfully');
        } catch (error) {
            console.error('Error importing users:', error);
            throw error;
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