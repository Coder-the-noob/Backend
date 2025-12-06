const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());

const url =
  "mongodb+srv://missionSCIC:Bg7fwDjsjCj2tIQ4@cluster0.nfj0fog.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("petsService");
    const petServices = database.collection("services");
    const ordersCollection = database.collection("orders");


    // post services to database
    app.post("/services", async (req, res) => {
      const data = req.body;
      const date = new Date();
      data.createdAt = date;
      console.log(data);
      const result = await petServices.insertOne(data);
      res.send(result);
    });

    // get services from database
    app.get("/services", async (req, res) => {
      const result = await petServices.find().toArray();
      res.send(result);
    });

    // get services by category
    app.get("/services/category/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = { category: categoryName };
      const result = await petServices.find(query).toArray();
      res.send(result);
    });

    // get product delatils by id
    app.get("/services/products-details/:id", async (req, res) => {
      const id = req.params.id;

      console.log("Backend received ID:", id);

      try {
        let query;
        if (id.length === 24) {
          try {
            query = { _id: new ObjectId(id) };
          } catch {
            query = { _id: id };
          }
        } else {
          query = { _id: id };
        }

        const result = await petServices.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Service not found" });
        }

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Server error", error });
      }
    });

    // get listings by user email
    app.get("/my-listings/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const listings = await petServices.find({ email }).toArray();
        res.send(listings);
      } catch (error) {
        res.status(500).send({ message: "Server Error", error });
      }
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const result = await petServices.deleteOne({
          $or: [{ _id: id }, { _id: new ObjectId(id) }],
        });

        console.log("Delete result:", result);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Delete Failed", error });
      }
    });

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        const result = await petServices.updateOne(
          {
            $or: [{ _id: id }, { _id: new ObjectId(id) }],
          },
          { $set: updatedData }
        );

        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Update Failed", error });
      }
    });

    app.get("/recent-listings", async (req, res) => {
      try {
        const listings = await petServices
          .find({})
          .sort({ createdAt: -1 })
          .limit(6)
          .toArray();

        res.send(listings);
      } catch (error) {
        res.status(500).send({ message: "Server Error", error });
      }
    });

    app.get("/my-orders/:email", async (req, res) => {
      const email = req.params.email;

      try {
        const orders = await ordersCollection
          .find({ buyerEmail: email })
          .sort({ createdAt: -1 })
          .toArray();

        res.send(orders);
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Server Error", error });
      }
    });

    app.post("/orders", async(req, res)=>{
        try{
            const order = req.body;
            ordersCollection.createdAt = new Date();

            const result = await ordersCollection.insertOne(order);
            res.send(result);
        }catch(error){
            console.log(error);
            res.status(500).send({message: "Could not place order", error});
        }
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
  res.send("Assignment 10 is running");
});

app.listen(port, () => {
  console.log(`Assignment 10 is running on port: ${port}`);
});
