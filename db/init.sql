-- init.sql
-- Creates extensions, types, tables and indexes following ER diagram & OpenAPI

-- Enable UUID generation (pgcrypto preferred for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUM types (used by multiple tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('member', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'copy_status') THEN
    CREATE TYPE copy_status AS ENUM ('available', 'issued', 'lost');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('issued', 'returned', 'overdue', 'lost');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('active', 'expired', 'fulfilled', 'cancelled');
  END IF;
END
$$;

-- Publishers
CREATE TABLE IF NOT EXISTS publishers (
  publisher_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Authors
CREATE TABLE IF NOT EXISTS authors (
  author_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  book_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar NOT NULL,
  isbn varchar UNIQUE,
  description text,
  publish_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  publisher_id uuid REFERENCES publishers(publisher_id) ON DELETE SET NULL
);

-- Many-to-many join: book_authors
CREATE TABLE IF NOT EXISTS book_authors (
  book_id uuid NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES authors(author_id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

-- Many-to-many join: book_categories
CREATE TABLE IF NOT EXISTS book_categories (
  book_id uuid NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

-- Book copies
CREATE TABLE IF NOT EXISTS book_copies (
  copy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar NOT NULL UNIQUE,
  password_hash varchar NOT NULL,
  full_name varchar,
  role user_role NOT NULL DEFAULT 'member',
  blacklist_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  last_login_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

-- Transactions (issue/return)
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id UUID NOT NULL REFERENCES book_copies(copy_id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  issue_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  return_date TIMESTAMPTZ,
  status transaction_status NOT NULL DEFAULT 'issued'
);

-- Fines: one-to-one with transaction
CREATE TABLE IF NOT EXISTS fines (
  fine_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL UNIQUE REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0.00,
  reason text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid boolean NOT NULL DEFAULT false
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
  reserved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  status reservation_status NOT NULL DEFAULT 'active'
);

-- Notifications (simple table to support /notifications)
CREATE TABLE IF NOT EXISTS notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  message text NOT NULL,
  type varchar,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_books_title ON books (lower(title));
CREATE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE INDEX IF NOT EXISTS idx_book_copies_book_id ON book_copies (book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_copy_id ON transactions (copy_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON reservations (book_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_copy ON transactions(copy_id) WHERE status = 'issued';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'transaction_status'
    ) THEN
        CREATE TYPE transaction_status AS ENUM ('issued', 'returned', 'overdue');
    END IF;
END$$;