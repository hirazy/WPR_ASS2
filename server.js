const express = require('express')
const app = express()
const mongoDB = require('mongodb')

const bodyParser = require('body-parser')
app.use(express.static('public'))
app.use(bodyParser.json())

let db = null;
let collection = null;
let allQuestions = []

app.post('/attempts', getQuestions)

async function getQuestions(req, res) {

    let ans = null
    const o = await collection.find({}, {}).toArray((err, result) => {
        if (err) throw err;
        ans = result
        allQuestions = ans

        let questions = []

        for (let i = 0; i < 10; i++) {
            questions.push(ans[i])
        }

        const quiz = {
            "questions": questions,
            "completed": false,
            "score": 0,
            "_id": "5f6d6ca8f460e14320ad56f9",
            "startedAt": "2020-09-25T04:06:01.242Z"
        }

        res.status(201).json(quiz)
    })
    console.log("ID: " + o.id)
}

app.post('/attempts/:id/submit', (req, res) => {
    const _id = req.params.id

    const answers = req.body.answers



    res.status(200).json({

    })
})

async function startServer() {
    const client = mongoDB.MongoClient.connect("mongodb://localhost:27017/wpr-quiz")
    db = (await client).db()
    collection = db.collection('questions')
}

app.listen(3000, () => {
    console.log("Start")
})

startServer()