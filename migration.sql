DROP TABLE IF EXISTS users, emails, users_emails CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name text,
  email text UNIQUE,
  password text
);

INSERT INTO users (name, email, password) VALUES ('admin', 'ad@min.net', '123');
INSERT INTO users (name, email, password) VALUES ('badmin', 'bad@min.net', '456');

CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  subject text,
  body text,
  sender text NOT NULL,
  receiver int NOT NULL,
  FOREIGN KEY(receiver) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO emails (subject, body, sender, receiver) VALUES ('subject', 'body', 'ad@min.net', 2);
INSERT INTO emails (subject, body, sender, receiver) VALUES ('subject', 'body', 'bad@min.net', 1);

CREATE TABLE users_emails (
  sender text NOT NULL,
  receiver int NOT NULL,
    FOREIGN KEY(receiver) REFERENCES users(id) ON DELETE CASCADE,
  email_id int NOT NULL,
    FOREIGN KEY(email_id) REFERENCES emails(id) ON DELETE CASCADE
);

INSERT INTO users_emails (sender, receiver, email_id) VALUES('ad@min.net', 2, 1);
INSERT INTO users_emails (sender, receiver, email_id) VALUES('bad@min.net', 1, 2);
