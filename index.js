const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT | 5000;

app.use(cors());
app.use(express.json());

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
    const CarsCollection = client.db("carsDB").collection("cars");
    const CarcartCollection = client.db("carcartDB").collection("carcart");

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
        { $limit: 10 },
      ]).toArray();

      res.send(gretePrice);
    });

    app.get("/car/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await CarsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      const query = req.query.email;
      const result = await CarcartCollection.find({ email: query }).toArray();
      res.send(result);
    });

    app.delete("/carts", async (req, res) => {
      const cartId = req.query.id;
      const result = await CarcartCollection.deleteOne({
        _id: new ObjectId(cartId),
      });
      res.send(result);
    });

    app.put("/car/:id", async (req, res) => {
      const ids = req.params.id;
      const updatedata = req.body;
      const query = { _id: new ObjectId(ids) };
      const option = { upsert: true };
      const update = {
        $set: {
          brand: updatedata.brand,
          car_name: updatedata.car_name,
          category: updatedata.category,
          classes: updatedata.classes,
          description: updatedata.description,
          fuel: updatedata.fuel,
          img: updatedata.img,
          price: updatedata.price,
          speed: updatedata.speed,
        },
      };
      const result = await CarsCollection.updateOne(query, update, option);
      res.send(result);
    });

    app.post("/car", async (req, res) => {
      const carInfo = req.body;
      const result = await CarsCollection.insertOne(carInfo);
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const query = req.body;
      const result = await CarcartCollection.insertOne(query);
      res.send(result);
    });
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
