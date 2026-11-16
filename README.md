# ProcessLink Ghana: Sign up and Login (PHP + MySQL)

This project is the simplified PHP + MySQL version of ProcessLink Ghana.

## Set up on Windows with XAMPP

1. Install XAMPP.
2. Start Apache and MySQL in the XAMPP Control Panel.
3. Copy this folder into `C:\xampp\htdocs\` and name it `processlink`.
4. Open `http://localhost/phpmyadmin`, click **Import**, choose `database.sql`, then click **Import**.
5. Open `http://localhost/processlink/`.

## Admin login

- Email: `admin@processlink.gh`
- Password: `Admin@12345`

## Where the data is stored

After signing up, open phpMyAdmin, click `processlink`, then `users`, then **Browse**.
Your data is saved in the `users` table.

## Important files

- `database.sql` — creates the database and `users` table
- `db.php` — connects to MySQL and starts the session
- `register.php` — sign up form and user creation
- `login.php` — login logic and session creation
- `logout.php` — logs the user out
- `portal.php` — role-based member dashboard
- `admin.php` — admin-only user list
- `header.php` and `footer.php` — page layout
- `style.css` — styling

## Explanation

Read `CODE_EXPLAINED.md` for a line-by-line explanation of the authentication system.
