const express = require('express')
const app = express()
const mongoDB = require('mongodb')
const ObjectId = require('mongodb').ObjectID

const bodyParser = require('body-parser')
app.use(express.static('public'))
app.use(bodyParser.json())

let db = null;
let collectionQuestions = null;
let collectionAttempts = null;

app.on('listening', () => {
    console.log("Listening")
})

app.post('/attempts', getQuestions)

async function getQuestions(req, res) {

    let ans = null
    const o = await collectionQuestions.find({}, {}).toArray(async(err, result) => {
        if (err) throw err;

        let ans = []
        let tmp = result
        let questions = []
        let correctAnswers = {}

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

            // Push to correct Answers
            correctAnswers[tmp[rand]._id] = tmp[rand].correctAnswer

            // Remove Item which is selected
            tmp.splice(rand, 1)
        }

        const date = new Date()
        const time = date.toISOString()

        let attempts = {
            "questions": questions,
            "correctAnswers": correctAnswers,
            "completed": false,
            "startedAt": time,
            "answers": {},
            "score": 0
        }

        let createAttempts = await collectionAttempts.insertOne(attempts)

        if (createAttempts) {

            const quiz = {
                "questions": questions,
                "completed": false,
                "score": 0,
                "_id": createAttempts.insertedId,
                "startedAt": time,
                "__v": 0
            }

            res.status(201).json(quiz)
        }
    })
}

app.post('/attempts/:id/submit', async(req, res) => {

    const _id = req.params.id

    console.log("ID: " + _id)

    let attemptsAns = await collectionAttempts.findOne({ _id: ObjectId(_id) })
        .then((attempt) => {

            console.log("ID: " + attempt._id)

            let answers = null
                // Get answer from user
            if (req.body.answers != undefined) {
                answers = req.body.answers
            } else {
                answers = JSON.parse(req.body)
            }

            console.log("Attempt " + attempt.completed)

            // Completed
            if (attempt.completed === true) {

                console.log("Completed")

                const response = {
                    "questions": attempt.questions,
                    "completed": true,
                    "score": attempt.score,
                    "_id": _id,
                    "correctAnswers": attempt.correctAnswers,
                    "startedAt": attempt.startedAt,
                    "_v": 0,
                    "answers": attempt.answers,
                    "scoreText": convertScoreText(attempt.score)
                }
                res.status(200).json(response)

            } else {

                console.log("Not Completed")

                let score = 0

                const questions = attempt.questions

                console.log(questions.length)

                //Init CorrectAttempts
                let correctAttempts = attempt.correctAnswers;

                // Check answer of user
                for (let i = 0; i < questions.length; i++) {
                    if (answers[questions[i]._id] != null) {
                        if (parseInt(answers[questions[i]._id]) === correctAttempts[questions[i]._id]) {
                            score += 1
                        }
                    }
                }

                console.log("scoreText " + correctAttempts)

                // Create correct answers for user
                let correctAnswers = {}

                for (let i = 0; i < questions.length; i++) {
                    correctAnswers[questions[i]._id] = correctAttempts[questions[i]._id]
                }

                let scoreText = convertScoreText(score)

                const response = {
                    "questions": questions,
                    "completed": true,
                    "score": score,
                    "_id": _id,
                    "correctAnswers": correctAnswers,
                    "startedAt": attempt.startedAt,
                    "_v": 0,
                    "answers": answers,
                    "scoreText": scoreText
                }

                res.status(200).json(response)

                // Update attempts
                let updateAttempt = collectionAttempts.updateOne({ _id: attempt._id }, {
                    $set: {
                        "completed": true,
                        "score": score,
                        "answers": answers
                    }
                })
            }
        })
        .catch((err) => {
            res.status(400).json()
        })
})

function convertScoreText(score) {
    let scoreText = "Practice more to improve it :D"

    if (score >= 5 && score < 7) {
        scoreText = "Good, keep up!"
    } else if (score >= 7 && score < 9) {
        scoreText = "Well done!"
    } else if (score >= 9 && score <= 10) {
        scoreText = "Perfect!!"
    }

    return scoreText
}

async function startServer() {
    const client = mongoDB.MongoClient.connect("mongodb://localhost:27017/wpr-quiz")
    db = (await client).db()
    collectionQuestions = db.collection('questions')
    collectionAttempts = db.collection('attempts')
}

app.listen(3000, () => {
    console.log("Start")
})

startServer()
