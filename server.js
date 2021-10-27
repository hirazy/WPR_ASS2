const express = require('express')
const app = express()
const mongoDB = require('mongodb')
const ObjectId = require('mongodb').ObjectID

const bodyParser = require('body-parser')
app.use(express.static('public'))
app.use(bodyParser.json())

let db = null;
let collection = null;
let allQuestions = {}

app.on('listening', () => {
    console.log("Listening")
})

app.post('/attempts', getQuestions)

async function getQuestions(req, res) {

    let ans = null
    const o = await collection.find({}, {}).toArray((err, result) => {
        if (err) throw err;

        let ans = []

        let tmp = result

        // Create id for each user
        const id1 = new ObjectId();
        const _id = id1.toString()
        console.log("ID: " + _id)

        let questions = []

        // Random 10 questions
        for (let i = 0; i < 10; i++) {
            const length = tmp.length
            const rand = Math.floor(Math.random() * length);

            questions.push({
                "_id": tmp[rand]._id,
                "answers": tmp[rand].answers,
                "text": tmp[rand].text,
                "__v": 0
            })

            // Push to source of array 
            ans.push(tmp[rand])

            // Remove Item which is selected
            tmp.splice(rand, 1)
        }

        const date = new Date()
        const time = date.toISOString()

        const quiz = {
            "questions": questions,
            "completed": false,
            "score": 0,
            "_id": _id,
            "startedAt": time,
            "__v": 0
        }

        /**
         * Save data to global variable of server
         */
        allQuestions[_id] = ans

        res.status(201).json(quiz)
    })
}

app.post('/attempts/:id/submit', (req, res) => {
    const _id = req.params.id

    let answers = null
    // Get answer from user
    if (req.body.answers != undefined) {
        answers = req.body.answers
    }
    else {
        answers = JSON.parse(req.body)
    }

    console.log("answers " + answers)

    if (allQuestions[_id] != null) {
        let score = 0

        const questions = allQuestions[_id]

        console.log("Question: " + answers[questions[0]._id])

        // Check answer of user
        for (let i = 0; i < questions.length; i++) {
            if (answers[questions[i]._id] != null) {
                if (parseInt(answers[questions[i]._id]) === questions[i].correctAnswer) {
                    score += 1
                }
            }
        }

        // Create correct answers for user
        let correctAnswers = {}

        for (let i = 0; i < questions.length; i++) {
            correctAnswers[questions[i]._id] = questions[i].correctAnswer
        }

        let scoreText = "Practice more to improve it :D"

        if (score >= 5 && score < 7) {
            scoreText = "Good, keep up!"
        }
        else if (score >= 7 && score < 9) {
            scoreText = "Well done!"
        }
        else if (score >= 9 && score <= 10) {
            scoreText = "Perfect!!"
        }

        const date = new Date()
        const time = date.toISOString()

        const response = {
            "questions": questions,
            "completed": true,
            "score": score,
            "_id": _id,
            "correctAnswers": correctAnswers,
            "startedAt": time,
            "_v": 0,
            "answers": answers,
            "scoreText": scoreText
        }
        res.status(200).json(response)
    }
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