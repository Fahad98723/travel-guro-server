const express = require ('express')
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId

const app  = express()
app.use(cors());
app.use(express.json());

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rf28w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel_life');
        const blogsCollection = database.collection('blogs');
        const usersCollection = database.collection('users');
        const commentsCollection = database.collection('comments');

        //GET Products API
        app.post('/blogs', async (req, res) => {
            const data = req.body
            const result = await blogsCollection.insertOne(data) 
            console.log(data);
            res.json(result)
        })

        app.post('/users', async (req, res) => {
            const data = req.body
            const result = await usersCollection.insertOne(data) 
            console.log(data);
            res.json(result)
        })

        app.put('/users/admin', async (req, res) => {
            const email = req.body.email 
            const filter = {email : email}
            console.log(email);
            const updateDoc = {
                $set : {
                    role : 'admin'
                }
            }
            const user = await usersCollection.updateOne(filter, updateDoc);
            res.json(user)
        })

        app.get('/users', async (req, res) => {
            const users = await usersCollection.find({}).toArray()
            res.send(users)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query =  {email :  email}
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            else{
                isAdmin = false
            }
            res.send({admin : isAdmin})
        })
        app.put('/users', async (req, res) => {
            const data = req.body
            const filter = {email : data.email}
            const options = { upsert: true };
            const updateDoc = {
                $set: data,
            }
            const user = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(user)
        })

       
        app.get('/blogs', async (req, res) => {
            const cursor = blogsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let blogs;
            const count = await cursor.count();
            console.log(page, size, count);
            if (page) {
                blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                blogs = await cursor.toArray();
            }

            res.send({
                count,
                blogs
            });
        });

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            res.send(blog);
        });

        
        

        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id
            const data = req.body
            const query = {_id : ObjectId(id)}
            const option = {upsert : true}
            const updateDoc = {
                $set : {
                     title : data.title, 
                     category : data.category,
                     image : data.image,
                     cost : data.cost ,
                     details : data.details,
                     address : data.address, 
                     traveler : data.traveler, 
                     rating : data.rating, 
                     status : data.status, 
                     spentDay : data.spentDay ,
                     date : data.date
                }
            }
            const result = await blogsCollection.updateOne(query, updateDoc, option)
            res.json(result)
        })
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = {_id : ObjectId(id)}
            const result = await blogsCollection.deleteOne(query)
            res.json(result)
        });

        app.post('/blog/comments', async(req,res) => {
            const data = req.body
            console.log(data);
            const result = await commentsCollection.insertOne(data)
            res.json(result)
        } )

        app.get('/blog/comments', async (req, res) => {
            const result = await commentsCollection.find({}).toArray()
            res.send(result)
        })
        
        app.put('/blogs/update/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log(data);
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: data
            };
            const result = await blogsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.delete('/blog/comments/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id : ObjectId(id)}
            const result = await commentsCollection.deleteOne(query)
            res.json(result)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Travel Life server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})


