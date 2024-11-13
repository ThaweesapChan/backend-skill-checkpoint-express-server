import express from "express";
import connectionPool from "./utils/db.mjs";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// API ข้อที่ 1 Get Post ID
/*
  
  const updateQuestions = { ...req.body };
  try {
    const result = await connectionPool.query(
      `UPDATE questions
      SET title = $1, description = $2, category = $3
      WHERE id = $4 RETURNING *`,
      [
        updateQuestions.title,
        updateQuestions.description,
        updateQuestions.category,
        questionId,
      ]
    );*/

// API ข้อที่ 1 Get Post ID
app.post("/questions", async (req, res) => {
  const getQuesttions = { ...req.body };

  try {
    const result = await connectionPool.query(
      `INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3) RETURNING id`,
      [getQuesttions.title, getQuesttions.description, getQuesttions.category]
    );
    const questionId = result.rows[0].id;

    res.status(201).json({
      message: `Question id: ${questionId} has been created successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create question", error: error.message });
  }
});

// API ข้อที่ 2 Get questions ID
app.get("/questions/:id", async (req, res) => {
  const questionId = req.params.id;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );
    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read the question due to database connection",
      error: error.message,
    });
  }
});

// API ข้อที่ 3 Get questions ทั้งหมด
app.get("/questions", async (req, res) => {
  try {
    const result = await connectionPool.query(`SELECT * FROM questions`);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read questions due to database connection",
      error: error.message,
    });
  }
});
// API ข้อที่ 4 PUT question by ID
app.delete("/questions/:id", async (req, res) => {
  const questionId = req.params.id;

  try {
    const result = await connectionPool.query(
      `DELETE FROM questions WHERE id = $1 RETURNING *`,
      [questionId]
    );
    return res.status(200).json({
      message: `Question id: ${result.rows[0].id} has been deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not delete the question due to database connection",
      error: error.message,
    });
  }
});

// API ข้อที่ 1 Get Post ID
app.post("/questions", async (req, res) => {
  const getQuesttions = { ...req.body };

  try {
    const result = await connectionPool.query(
      `INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3) RETURNING id`,
      [getQuesttions.title, getQuesttions.description, getQuesttions.category]
    );
    const questionId = result.rows[0].id;

    res.status(201).json({
      message: `Question id: ${questionId} has been created successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create question", error: error.message });
  }
});

// API ข้อที่ 5 Post comments question by ID
app.post("/comments", async (req, res) => {
  const getAnswer = { ...req.body };

  try {
    const result = await connectionPool.query(
      `INSERT INTO answers (question_id, content)
      VALUES ($1, $2) RETURNING id`,
      [getAnswer.question_id, getAnswer.content]
    );
    const answerId = result.rows[0].id;

    res.status(201).json({
      message: `Question id: ${answerId} has been created successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create question", error: error.message });
  }
});

// API ข้อที่ 6 PUT question by ID
app.put("/questions/:id", async (req, res) => {
  const questionId = req.params.id;
  const updateQuestions = { ...req.body };

  try {
    const result = await connectionPool.query(
      `UPDATE questions
      SET title = $1, description = $2, category = $3
      WHERE id = $4 RETURNING *`,
      [
        updateQuestions.title,
        updateQuestions.description,
        updateQuestions.category,
        questionId,
      ]
    );

    return res.status(200).json({
      message: `Question id: ${result.rows[0].id} has been updated successfully`,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not update the question due to database connection",
      error: error.message,
    });
  }
});

// API ข้อที่ 7 Get comment ทั้งหมด
app.get("/comments", async (req, res) => {
  try {
    const result = await connectionPool.query(`SELECT * FROM answers`);
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read questions due to database connection",
      error: error.message,
    });
  }
});

// API ข้อที่ 8 Get comments ID
app.get("/comments/:id", async (req, res) => {
  const questionId = req.params.id;

  try {
    const result = await connectionPool.query(
      `SELECT * FROM answers WHERE id = $1`,
      [questionId]
    );

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read the question due to database connection",
      error: error.message,
    });
  }
});

// API ข้อที่ 9 PUT Comments by ID
app.delete("/comments/:id", async (req, res) => {
  const questionId = req.params.id;

  try {
    const result = await connectionPool.query(
      `DELETE FROM answers WHERE id = $1 RETURNING *`,
      [questionId]
    );
    return res.status(200).json({
      message: `Question id: ${result.rows[0].id} has been deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not delete the question due to database connection",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
