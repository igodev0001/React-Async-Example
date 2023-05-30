require("dotenv").config();
const cors = require("cors");
const bodyParser = require('body-parser')
const express = require("express");
const pool = require("./db");
const multer  = require('multer');
const app = express();

const moment = require('moment');
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(cors())

const corsOptions = {
  origin: "*",
};

//We set upload path to save images.
const storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, "public/upload/");
  },
  filename: function(req, file, cb){
      const time = new Date().valueOf();
      cb(null, time + '_' + file.fieldname);
  }
})

//Multer is used to upload files.
const upload = multer({storage});

app.use(cors(corsOptions));

app.use(express.static('public'))
app.use('/public', express.static('public'));

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log(`server is up and listening on ${port}`);
});



/**
 * @method
 * GET
 * @returns
 * string - "alive"
 * @description
 * We check if server is alive or dead.
 */
app.get("/isAlive", (req, res)=> {
  res.json("alive");
});
/**
 * @method
 * POST
 * @returns
 * string - "submission successful"
 * @description
 * Save user data to database(user table)
 */
app.post("/user/submit", async (req, res) => {
  try {
    // console.log(req.body);
    
    const { data } = req.body
    const user = JSON.parse(data)
    const name = user.name
    const age = user.age

    await pool.query(
        `insert into "user" (name, age, avatar) values ($1, $2, $3)`,
       [name, age, req.body.avatar]
    );
    res.json('submission successful!');
  } catch (err) {
    console.error(err.message);
  }
});

/**
 * @method
 * POST
 * @returns
 * string - "submission successful"
 * @description
 * Save experience data to database(experience table)
 */
app.post("/experience/submit",  async (req, res) => {
  try {
    let { data } = req.body;
    data = JSON.parse(data);
    data.startDate = moment(data.startDate).format("MM/DD/yyyy")
    data.endDate = moment(data.endDate).format("MM/DD/yyyy")
    await pool.query(
        `insert into "experience" ("startDate", "endDate", "jobTitle", "company", "companyLogo", "jobDescription", "user_id") values ($1, $2, $3, $4, $5, $6, $7)`,
       [data.startDate, data.endDate, data.jobTitle,data.company,req.body.companyLogo,data.jobDescription, data.user_id]
    );
    res.json('submission successful!');
  } catch (err) {
    console.error(err.message);
  }
});
/**
 * @method
 * POST
 * @returns
 * string - "submission successful"
 * @description
 * Delete Experience from db
 */
app.post("/experience/remove", async (req, res) => {
  try {
    let {id} = req.body;
    await pool.query("delete from public.experience where id=$1", [id]);
    res.json('submission successful!');
  } catch (err) {
    console.error(err.message);
  }
});


/**
 * @method
 * POST
 * @returns
 * string - uploaded file name
 * @description
 * Upload file
 */

app.post("/uploadFile", upload.single('file'), (req, res) => {
  try {
      
      res.send(req.file.filename);
  } catch (err) {
    res.status(500).send(err);
  }
});
