-- Insert admin user
-- Password: owner123@321
INSERT INTO users (name, email, password, role)
VALUES (
  'administration',
  'everything_everyone@owner.com',
  '$2a$10$.clPVlLzTxoy8f1nAkyiVOG6Cu6/w1qMK0kNY0fsZ4EEhpw5P6aDC',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
