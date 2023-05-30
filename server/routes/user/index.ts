// const cors = require("cors");
// const pool = require("./db");

// const express = require("express")

// const app = express();

// app.use(cors());
// app.use(express.json()); 




// app.post("/user/:id", async (req, res) => {
//   try {
//     const { description } = req.body;
//     const newTodo = await pool.query(
//       "INSERT INTO todo (description) VALUES($1) RETURNING *",
//       [description]
//     );

//     res.json(newTodo.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//   }
// });


// app.get("/user/:id", async (req, res) => {
//   try {
//     const allTodos = await pool.query("SELECT * FROM user");
//     res.json(allTodos.rows);
//   } catch (err) {
//     console.error(err.message);
//   }
// });


// app.put("/user/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { description } = req.body;
//     const updateTodo = await pool.query(
//       "UPDATE todo SET description = $1 WHERE todo_id = $2",
//       [description, id]
//     );

//     res.json("Todo was updated!");
//   } catch (err) {
//     console.error(err.message);
//   }
// });

