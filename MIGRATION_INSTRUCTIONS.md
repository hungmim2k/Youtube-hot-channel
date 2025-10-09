# Migration Instructions

This document provides instructions on how to migrate from MongoDB to Supabase and set up the admin account.

## Prerequisites

- Node.js and npm installed
- Supabase project created with the following environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Migration Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the migration script to create the necessary tables in Supabase:
   ```bash
   npm run migrate
   ```

   This script will:
   - Create the `users` table if it doesn't exist
   - Create the `keywords` table if it doesn't exist
   - Create the necessary indexes
   - Create the admin user if it doesn't exist

3. Verify that the admin account exists:
   ```bash
   npm run verify-admin
   ```

   If the admin account exists, you should see a message confirming this. If not, you may need to run the migration script again.

4. Test the admin login functionality:
   ```bash
   npm run test-login
   ```

   This will attempt to log in with the admin credentials and verify that the login is successful.

## Admin Account Details

The default admin account has the following credentials:
- Username: `admin`
- Password: `0968885430`

You can use these credentials to log in to the application with admin privileges.

## Troubleshooting

If you encounter any issues during the migration:

1. Check that your Supabase environment variables are correctly set in `.env.local`
2. Ensure that your Supabase project has the SQL function `execute_sql` enabled
3. Try running the migration script again
4. If problems persist, check the Supabase dashboard for any error messages

## Next Steps

After successfully migrating to Supabase and setting up the admin account, you can:

1. Start the application:
   ```bash
   npm run dev
   ```

2. Log in with the admin account
3. Create additional user accounts as needed
4. Begin using the application with Supabase as the database
