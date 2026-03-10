# Run Dolt

**Initialize**

```bash
# initialize docker
docker-compose up -d

# connect to a mysql client
mysql --host 0.0.0.0 -P 3307 -u root --password=secret2
```

**Add first data**

```sql
-- Create a database
CREATE DATABASE myapp;
USE myapp;

-- Checkout main branch
CALL dolt_checkout('main');

-- Create tables (standard SQL)
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));
INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');

-- Query
SELECT * FROM users;
/*
+----+-------+
| id | name  |
+----+-------+
|  1 | Alice |
|  2 | Bob   |
+----+-------+
*/

-- Commit changes
SELECT * FROM dolt_status;
CALL dolt_add('-A');
CALL dolt_commit('-m', 'Create users table');

-- Create new branch
CALL dolt_branch('add-email-field');
CALL dolt_checkout('add-email-field');

-- Make changes
ALTER TABLE users ADD email VARCHAR(255);
UPDATE users SET email = 'alice@test.com' WHERE id = 1;

-- Commit your changes
CALL dolt_add('-A');
CALL dolt_commit('-m', 'Add email column with data');

-- Query
SELECT * FROM users;
/*
+----+-------+----------------+
| id | name  | email          |
+----+-------+----------------+
|  1 | Alice | alice@test.com |
|  2 | Bob   | NULL           |
+----+-------+----------------+
*/

```
