require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xxdywuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// const logger = (req, res, next) => {
//   console.log("I'm form middleware");
//   next();
// };

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log("Inside the middleware", token);

  if (!token) res.status(401).send({ message: "unauthorized access" });

  // verify token
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) res.status(401).send({ message: "unauthorized access" });
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db("careerCode").collection("jobs");
    const applicationCollection = client
      .db("careerCode")
      .collection("applications");

    // jwt token related APIs

    app.post("/jwt", async (req, res) => {
      const { email } = req.body;
      const user = { email };
      const token = jwt.sign(user, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "1h",
      });

      // set token cookies
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
      });

      res.send({ message: true });
    });

    // jobs related APIs
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // applications related APIs

    app.get("/application", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { applicant: email };

      // console.log("inside application api", req.cookies.token);
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const result = await applicationCollection.find(query).toArray();

      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobsCollection.findOne(jobQuery);
        application.company = job.company;
        application.title = job.title;
        application.location = job.location;
        application.company_logo = job.company_logo;
      }

      res.send(result);
    });

    app.post("/application", async (req, res) => {
      const application = req.body;
      const result = await applicationCollection.insertOne(application);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Career Code Server..");
});

app.listen(port, () => {
  console.log(`Career code server is running on port : ${port}`);
});
