const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());



const url = "mongodb+srv://missionSCIC:Bg7fwDjsjCj2tIQ4@cluster0.nfj0fog.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db('petsService');
    const petServices = database.collection('services');

    app.post('/services', async (req, res) => {
        const data= req.body;
        const date = new Date();
        data.createdAt = date;
        console.log(data);
        const result = await petServices.insertOne(data);
        res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Assignment 10 is running');
});

app.listen(port, () => {
  console.log(`Assignment 10 is running on port: ${port}`);
});
