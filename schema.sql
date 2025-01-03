-- First terminate all connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'recipe_db'
AND pid <> pg_backend_pid();

-- Now drop database and user
DROP DATABASE IF EXISTS recipe_db;

-- Revoke all privileges first
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM "hunjry-app";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM "hunjry-app";
REVOKE ALL PRIVILEGES ON SCHEMA public FROM "hunjry-app";
REVOKE ALL PRIVILEGES ON DATABASE recipe_db FROM "hunjry-app";

-- Now we can drop the user
DROP USER IF EXISTS "hunjry-app";

-- Create the database first
CREATE DATABASE recipe_db;

-- Create the user
CREATE USER "hunjry-app" WITH PASSWORD '12345678';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE recipe_db TO "hunjry-app";

-- Connect to the database (you'll need to run this manually)
\c recipe_db;

-- Create tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    phone_number VARCHAR(20),
    email VARCHAR(255)
);

CREATE TABLE recipes (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    cooking_time INTEGER,
    servings INTEGER
);

CREATE TABLE ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE recipe_ingredients (
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    ingredient_id INTEGER REFERENCES ingredients(ingredient_id),
    PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE instructions (
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    step_number INTEGER,
    instruction_text TEXT NOT NULL,
    PRIMARY KEY (recipe_id, step_number)
);

CREATE TABLE liked_foods (
    user_id INTEGER REFERENCES users(user_id),
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE planned_foods (
    user_id INTEGER REFERENCES users(user_id),
    recipe_id INTEGER REFERENCES recipes(recipe_id),
    planned_date DATE NOT NULL,
    PRIMARY KEY (user_id, recipe_id, planned_date)
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    post_id INTEGER REFERENCES recipes(recipe_id),
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "hunjry-app";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "hunjry-app";
GRANT ALL PRIVILEGES ON SCHEMA public TO "hunjry-app";

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "hunjry-app";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "hunjry-app"; 