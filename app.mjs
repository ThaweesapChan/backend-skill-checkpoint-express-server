import express from "express";
import connectionPool from "./utils/db.mjs";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// API ข้อที่ 1 Create a new question
app.post("/questions", async (req, res) => {
  const questtions = { ...req.body };
  if (!questtions.title || !questtions.description || !questtions.category) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    const result = await connectionPool.query(
      `INSERT INTO questions (title, description, category)
      VALUES ($1, $2, $3) RETURNING id`,
      [questtions.title, questtions.description, questtions.category]
    );
    const questionId = result.rows[0].id;

    return res.status(201).json({
      message: "Question created successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Unable to create question.", error: error.message });
  }
});

// API ข้อที่ 2 Get all questions

app.get("/questions", async (req, res) => {
  try {
    const result = await connectionPool.query(`SELECT * FROM questions`);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch questions.",
      error: error.message,
    });
  }
});

// API ข้อที่ 3 Get a question by ID

app.get("/questions/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  if (!questionId || isNaN(questionId)) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  try {
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid request data." });
    }
    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch questions.",
      error: error.message,
    });
  }
});

// API ข้อที่ 4 PUT question by ID

app.put("/questions/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  const updateQuestions = { ...req.body };

  if (
    !updateQuestions.title ||
    !updateQuestions.description ||
    !updateQuestions.category
  ) {
    return res.status(400).json({ message: "Invalid request data." });
  }

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

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      message: "Question updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch questions.",
      error: error.message,
    });
  }
});

// API ข้อที่ 5 Delete a question by ID

app.delete("/questions/:questionId", async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `DELETE FROM questions WHERE id = $1 RETURNING *`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      message: "Question post has been deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete question.",
      error: error.message,
    });
  }
});
/*
// API ข้อที่ 6 Search questions by title or category
app.get("/questions/search", async (req, res) => {
  const search = { ...req.body };

  if (!search.title && !search.category) {
    return res.status(400).json({ message: "Invalid search parameters." });
  }

  try {
    let query = `SELECT * FROM questions WHERE`;
    const queryParams = [];

    if (search.title) {
      queryParams.push(`%${search.title}%`);
      query += ` title ILIKE $${queryParams.length}`;
    }

    if (search.category) {
      if (search.title) {
        query += ` AND`;
      }
      queryParams.push(`%${category}%`);
      query += ` category ILIKE $${queryParams.length}`;
    }

    const result = await connectionPool.query(query, queryParams);

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch a question.",
      error: error.message,
    });
  }
});
*/

// API ข้อที่ 7 Create an answer for a question

app.post("/questions/:questionId/answers", async (req, res) => {
  const { questionId } = req.params; // รับ questionId จาก URL params
  const { content } = req.body; // รับเนื้อหาคำตอบจาก body

  // ตรวจสอบว่ามีการส่งข้อมูลคำตอบหรือไม่
  if (!content) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    // ตรวจสอบว่า questionId ที่ระบุมีในฐานข้อมูลหรือไม่
    const questionResult = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    // หากคำถามมีอยู่ในฐานข้อมูล ให้สร้างคำตอบใหม่
    const result = await connectionPool.query(
      `INSERT INTO answers (question_id, content) 
       VALUES ($1, $2) RETURNING id`,
      [questionId, content]
    );

    return res.status(201).json({
      message: "Answer created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create answers.",
      error: error.message,
    });
  }
});

// API ข้อที่ 8 Get answers for a question
app.get("/questions/:questionId/answers", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const result = await connectionPool.query(
      `SELECT * FROM answers WHERE question_id = $1`,
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No answers found for this question.",
      });
    }

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch answers.",
      error: error.message,
    });
  }
});

// API ข้อที่ 9 Delete answers for a question
app.delete("/questions/:questionId/answers", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const result = await connectionPool.query(
      `DELETE FROM answers WHERE question_id = $1 RETURNING *`, // ใช้ question_id แทน id ของคำตอบ
      [questionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No answers found for this question.",
      });
    }

    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to delete answers.",
      error: error.message,
    });
  }
});

//API ข้อที่ 10 Vote on a question

app.post("/questions/:questionId/vote", async (req, res) => {
  const questionId = req.params.questionId;
  const { vote } = req.body;

  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({
      message: "Invalid vote value.",
    });
  }

  try {
    const questionResult = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const updateResult = await connectionPool.query(
      `UPDATE question_votes
       SET vote = $1
       WHERE question_id = $2
       RETURNING *`,
      [vote, questionId]
    );

    return res.status(200).json({
      message: "Vote on the question has been recorded successfully.",
      data: updateResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to vote question.",
      error: error.message,
    });
  }
});

//API ข้อที่ 11 Vote on an answer
app.post("/answers/:answerId/vote", async (req, res) => {
  const answerId = req.params.answerId; // แก้ไขตัวแปรจาก answers เป็น answer
  const { vote } = req.body; // ใช้ vote แทน answerVote

  // ตรวจสอบค่าของ vote ว่าเป็น 1 หรือ -1
  if (vote !== 1 && vote !== -1) {
    return res.status(400).json({
      message: "Invalid vote value.",
    });
  }

  try {
    // ตรวจสอบว่า answerId ที่ให้มามีอยู่ในฐานข้อมูลหรือไม่
    const answerResult = await connectionPool.query(
      `SELECT * FROM answers WHERE id = $1`,
      [answerId]
    );

    if (answerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Answer not found.", // เปลี่ยนจาก "Question not found."
      });
    }

    // เพิ่มคะแนนโหวตให้กับคำตอบที่ตรงกับ answerId
    const updateResult = await connectionPool.query(
      `UPDATE answer_votes
       SET vote = $1
       WHERE answer_id = $2
       RETURNING *`, // แก้ไขคำสั่ง SQL ให้ตรงกับ answer_votes
      [vote, answerId]
    );

    return res.status(200).json({
      message: "Vote on the answer has been recorded successfully.",
      data: updateResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to vote answer.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
