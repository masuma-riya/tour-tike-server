const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.rbwl5qc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
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

    const spotCollection = client.db('spotDB').collection('spot');
    const countriesCollection = client.db('spotDB').collection('countries');

    app.get('/countries', async(req, res) => {
      const cursor = countriesCollection.find();
      const result = await cursor.toArray();
    res.send(result);
    })

  app.post('/addSpot', async(req, res) => {
    const newSpot = req.body;
    console.log(newSpot);
    const result = await spotCollection.insertOne(newSpot);
    res.send(result);
  })

  app.get('/allSpot', async(req, res) => {
    const {cost} = req.query;
    const cursor = spotCollection.find().sort({cost: cost || 'desc'});
    const result = await cursor.toArray();
    res.send(result);
  })

  app.get('/allSpot/countries/:country', async(req, res)=> {
    console.log(req.params.email);
    const result = await spotCollection.find({ country:
      req.params.country }).toArray();
    res.send(result);
  })

  app.put('/allSpot/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updatedSpot = req.body;
    const spot = {
      $set: {
        spotName: updatedSpot.name, 
        location: updatedSpot.location, 
        cost: updatedSpot.cost, 
        description: updatedSpot.description, 
        travelTime: updatedSpot.travelTime, 
        visitors: updatedSpot.visitors, 
        season: updatedSpot.season, 
        img: updatedSpot.img
      }
    }
    const result = await spotCollection.updateOne(filter, spot, options);
    res.send(result);
  })
  
  app.delete('/allSpot/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await spotCollection.deleteOne(query);
    res.send(result);
  })

  app.get('/allSpot/:id', async(req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await spotCollection.findOne(query);
    res.send(result);
  })

  app.get('/myList/:email', async(req, res) => {
    console.log(req.params.email);
    const result = await spotCollection.find({ email:
      req.params.email }).toArray();
    res.send(result);
  })

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
    res.send('Assignment ten server side is run...')
})

app.listen(port, () => {console.log(`Assignment server is running on http://localhost:${5000}`)});

// app.listen(port, () => {
//   console.log(`Assignment ten is running on port: ${port}`)
// })