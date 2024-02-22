const express = require("express");
const app = express();
const cors = require("cors");
const port = 5000;

require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.1lk0tsy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const CarsCollection = client.db("carsDB").collection("cars");

    app.get("/resentcars", async (req, res) => {
      const resentcars = await CarsCollection.find()
        .sort({ _id: -1 })
        .limit(10)
        .toArray();
      res.send(resentcars);
    });

    app.get("/greateprice", async (req, res) => {
      
      const gretePrice = await CarsCollection.aggregate([
        { $sort: { price: -1 } }, 
        { $limit: 10 } 
      ]).toArray()
      
      res.send(gretePrice)
    });

    app.post("/car", async (req, res) => {
      const carInfo = req.body;
      const result = await CarsCollection.insertOne(carInfo);
      res.send(result);
    });

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
  res.send("Hello world");
});
app.listen(port, () => {
  console.log("This server is running with", port);
});
