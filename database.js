const { Pool } = require('pg');

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
            const userData = require('./json/user.json');
            
            for (const user of userData.users) {
                console.log(`Importing user: ${user.username}`);
                try {
                    await pool.query(
                        `INSERT INTO users 
                        (user_id, username, password, address, phone_number, email) 
                        VALUES ($1, $2, $3, $4, $5, $6) 
                        ON CONFLICT (user_id) DO NOTHING`,
                        [user.userId, user.username, user.password, user.address, user.phoneNumber, user.email]
                    );
                } catch (error) {
                    console.error(`Error importing user ${user.username}:`, error);
                }
            }
            return true;
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