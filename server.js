import express from "express";
import postgres from "postgres";

const app = express();
const PORT = 3000;

const sql = postgres(`postgres://localhost:5432/emailserver`);

app.use(express.static("static"));
app.use(express.json());
app.use((req, res, next) => {
  console.log(
    `Path: ${req.path}, Params: ${req.params} Body: ${JSON.stringify(req.body)}, Method: ${req.method}`
  );
  next();
});

function idIsNumber(id) {
  if (Number.isNaN(id)) {
    return false;
  } else {
    return true;
  }
}

app.post(`/api/users`, async (req, res, next) => {
  console.log("post to users received");
  const { email, name, password } = req.body;
  const newUser = await sql`
    INSERT INTO users (name, email, password) 
      VALUES (${name}, ${email}, ${password}) RETURNING name, email`;
  const userID = await sql`
    SELECT id FROM users WHERE email = ${email}`;
  const emailID = await sql`
    INSERT INTO emails (subject, body, sender, receiver)
      VALUES ('Welcome!', 'Welcome to the email world. Try sending an email to your mom, loser.', 'bad@min.net', ${userID[0].id}) RETURNING id`;
  await sql`
  INSERT INTO users_emails (sender, receiver, email_id) 
    VALUES('bad@min.net', ${userID[0].id}, ${emailID[0].id})`;
  res.send(newUser[0]);
});

// \_________________________________________________________________________/ \\
// | Table columns --- subject(text), body(text), SENDER(text), receiver(int)| \\
// | req.body values - subject(text), body(text), EMAIL(text), receiver(text)| \\
// /-------------------------------------------------------------------------\ \\

app.post("/api/emails", async (req, res, next) => {
  console.log("post to emails received");
  const { subject, body, email, receiver } = req.body;
  const recID = await sql`
    SELECT id FROM users WHERE email = ${receiver}`;
  const sentEmail = await sql`
    INSERT INTO emails (subject, body, sender, receiver)
      VALUES (${subject}, ${body}, ${email}, ${recID[0].id})
      RETURNING subject, body, id`;
  await sql`
    INSERT INTO users_emails (sender, receiver, email_id)
      VALUES (${email}, ${recID[0].id}, ${sentEmail[0].id})`;
  res.send(sentEmail[0]);
});

app.get(`/api/emails`, async (req, res, next) => {
  console.log("get to emails received");
  const { email } = req.body;
  const emails = await sql`
  SELECT subject, body, sender FROM emails WHERE receiver = (
    SELECT id FROM users WHERE email = ${email}
  )`;
  res.send(emails);
});

app.get(`/api/emails/:email`, async (req, res, next) => {
  console.log("get to emails/:id received");
  const { email } = req.params;
  const emails = await sql`
  SELECT subject, body, sender FROM emails WHERE receiver = (
    SELECT id FROM users WHERE email = ${email}
  )`;
  console.log("id'd GET result: ", emails[0]);
  res.send(emails);
});

app.patch(`/api/users`, async (req, res, next) => {
  console.log("patch to users received");
  const { name, email, password } = req.body;
  const updatedUser = await sql`
  UPDATE users 
    SET name COALESCE(${name}, name),
        email COALESCE(${email}, email),
        password COALESCE(${password}, password)
    RETURNING *`;
  res.send(updatedUser[0]);
});

app.delete(`/api/emails/:id`, async (req, res, next) => {
  console.log("delete from emails received");
  const { id } = req.params;
  if (idIsNumber(id)) {
    const deleted = await sql`
    DELETE FROM emails WHERE id = ${id} RETURNING *`;
    res.send(deleted[0]);
  } else {
    res.sendStatus(404);
  }
});

// Bad URL
// app.use((req, res, next) => {
//   res.sendStatus(404);
// });

// Server error
app.use((err, req, res, next) => {
  if (err) {
    pool.end();
    console.error(`Internal Server Error`, err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Smooth listening on ${PORT}`);
});
