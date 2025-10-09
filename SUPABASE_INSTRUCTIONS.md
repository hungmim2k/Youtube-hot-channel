# Supabase Database Setup Instructions

This document provides instructions on how to set up the necessary tables in your Supabase database.

## Prerequisites

- A Supabase account
- A Supabase project with the following environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Steps to Create Tables

1. Log in to your Supabase account and navigate to your project.

2. Click on the "SQL Editor" tab in the left sidebar.

3. Click on "New query" to create a new SQL query.

4. Copy and paste the contents of the `SUPABASE_TABLES.sql` file into the SQL editor.

5. Click "Run" to execute the SQL statements.

6. Verify that the tables have been created by checking the "Table Editor" tab in the left sidebar. You should see two tables:
   - `users`
   - `keywords`

7. Verify that the admin user has been created by running the following SQL query:
   ```sql
   SELECT * FROM users WHERE username = 'admin';
   ```
   You should see one row with the username "admin" and password "0968885430".

8. Alternatively, you can verify the tables and admin user using the provided verification script:
   ```bash
   npm run verify-tables
   ```
   This script will check if both tables exist and if the admin user has been created successfully.

## Next Steps

After creating the tables and the admin user, you can run the application and log in with the following credentials:
- Username: `admin`
- Password: `0968885430`

## Troubleshooting

If you encounter any issues:

1. Make sure your Supabase project is properly set up and the environment variables are correctly configured in `.env.local`.

2. Check the Supabase dashboard for any error messages.

3. Try running the SQL statements one by one to identify any specific issues.

4. If you're still having problems, check the Supabase documentation or contact support.
