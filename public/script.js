const url = 'https://wpr-quiz-api.herokuapp.com/attempts/';

const urlLocal = 'http://localhost:3000'

// Result Text
const resText = document.getElementById('resText')
const scoreText = document.getElementById('scoreText')
const scorePercent = document.getElementById("scorePercent");
const dialog = document.querySelector("dialog")
const body = document.getElementById("body")

class Question {
    constructor(_id, ques, answer) {
    }
}

let question = {
    _id: "",
    answer: [],
    text: "",
    _v: 0
}

let _data = {
    questions: [],
    completed: false,
    score: 0,
    _id: "",
    startedAt: "",
    __v: 0
}

async function fetchAPI() {
    await fetch("/attempts", {
        method: "POST",
        body: JSON.stringify(_data),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
        .then(res => res.json())
        .then(out => {

            /**
             * Assign _data equal out
             */
            _data = out

            let questions = _data.questions

            for (let i = 0; i < 10; i++) {
                const question = questions[i]

                const questionText = document.getElementById("question" + (i + 1))
                questionText.innerText = question.text

                for (let j = 0; j < question.answers.length; j++) {
                    const quizAnswer = document.getElementById("quiz_ans_" + (i + 1) + "_" + (j + 1))
                    quizAnswer.lastChild.nodeValue = question.answers[j]
                }

                if (question.answers.length < 4) {
                    for (let k = question.answers.length + 1; k <= 4; k++) {
                        const ansDiv = document.getElementById("quiz_ans_" + (i + 1) + "_" + k)
                        ansDiv.style.display = "none";
                    }
                }
            }

            // Show Page 2
            const page2 = document.querySelector("#page2")
            page2.style.display = "block";
        })
        .catch(err => {

        });
}


function onStart(event) {
    fetchAPI();
    event.preventDefault();
    const page1 = document.querySelector("#page1")
    page1.style.display = "none";
}

/**
 * Start
 */
const btnStartQuiz = document.querySelector("#bgBtnStart")
btnStartQuiz.addEventListener('click', onStart)

/**
 * Submit
 */
const btnSubmit = document.querySelector("#bgBtnSubmit")
btnSubmit.addEventListener('click', onSubmit)

/**
 * Try Again
 */
const btnTryAgain = document.querySelector("#btnTry")
btnTryAgain.addEventListener('click', onTry)

/**
 * Submit answer
 * @param _data {question:  }
 */
function onSubmit(event) {
    event.preventDefault()

    // const postURL = url + "/" + data._id +
    dialog.showModal()

    document.querySelector('#btnCancel').onclick = function () {
        event.preventDefault()
        // document.body.style.overflow = 'auto';
        dialog.close()
    }

    document.querySelector('#btnConfirm').onclick = function () {
        event.preventDefault()
        // document.body.style.overflow = 'auto';
        dialog.close()

        // Hide Page 2 
        const page2 = document.querySelector("#page2")
        page2.style.display = "none";

        // Link Post
        const linkPost = "/attempts/" + _data._id + "/submit"

        var x = document.getElementsByName("res1").value;
        let listQuiz = _data.questions

        var answerQ = {
        }

        for (let i = 0; i < 10; i++) {
            var radios = document.getElementsByName("ans" + (i + 1));
            let choiceAns = "";

            for (var j = 0; j < radios.length; j++) {
                if (radios[j].checked)
                    choiceAns = radios[j].value;
            }
            if (choiceAns != "") {
                answerQ[listQuiz[i]._id] = choiceAns
            }
        }

        const answerQuiz = {
            "answers": answerQ
        }

        fetch(linkPost, {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answerQuiz)
        }).then((res) => res.json())
            .then(res => {

                console.log(res)
                /**
                 * Set Questions
                 */
                let questions = _data.questions

                for (let i = 0; i < 10; i++) {
                    const question = questions[i]

                    const questionText = document.getElementById("res_ques_" + (i + 1))
                    questionText.innerText = question.text

                    for (let j = 0; j < question.answers.length; j++) {
                        const quizAnswer = document.getElementById("ans_quiz_" + (i + 1) + "_" + (j + 1))
                        quizAnswer.childNodes[4].nodeValue = question.answers[j]
                    }

                    if (question.answers.length < 4) {
                        for (let k = question.answers.length + 1; k <= 4; k++) {
                            const ansDiv = document.getElementById("ans_quiz_" + (i + 1) + "_" + k)
                            ansDiv.style.display = "none";
                        }
                    }
                }

                let correctAns = res.correctAnswers
                for (let i = 0; i < 10; i++) {
                    const question = questions[i]

                    /**
                    * No answer for this question
                    * */
                    if (answerQ[question._id] === undefined) {
                        // No answer, show the background and text Correct
                        const ansCorrectQuiz = parseInt(correctAns[question._id])

                        const ansDiv = document.getElementById("ans_quiz_" + (i + 1) + "_" + (ansCorrectQuiz + 1))
                        ansDiv.style.paddingBottom = "9px"
                        ansDiv.style.paddingTop = "9px"

                        ansDiv.style.backgroundColor = "#ddd"

                        const tagCorrect = ansDiv.getElementsByClassName("ans_quiz_box_contain_input_ans")[0]
                        tagCorrect.style.display = "block"
                    }
                    else {
                        /** 
                         * Answer is Correct
                         * */
                        if (answerQ[question._id] == correctAns[question._id]) {
                            const ansCorrectQuiz = parseInt(correctAns[question._id])
                            const ansDiv = document.getElementById("ans_quiz_" + (i + 1) + "_" + (ansCorrectQuiz + 1))
                            ansDiv.style.paddingBottom = "9px"
                            ansDiv.style.paddingTop = "9px"

                            ansDiv.style.backgroundColor = "#d4edda"

                            // Show Label
                            const circleInput = ansDiv.getElementsByClassName("ans_quiz_box_contain_input_circle")[0]
                            circleInput.style.backgroundColor = "#000000"

                            // Show Tag Correct
                            const tagCorrect = ansDiv.getElementsByClassName("ans_quiz_box_contain_input_ans")[0]
                            tagCorrect.style.display = "block"
                        }
                        /**
                         * Answer is Wrong
                         * */
                        else {

                            // Change color of my answer
                            const myAnswer = parseInt(answerQ[question._id])
                            const ansDiv = document.getElementById("ans_quiz_" + (i + 1) + "_" + (myAnswer + 1))
                            ansDiv.style.paddingBottom = "9px"
                            ansDiv.style.paddingTop = "9px"

                            ansDiv.style.backgroundColor = "#f8d7da"

                            const tagWrong = ansDiv.getElementsByClassName("ans_quiz_box_contain_input_wrong")[0]
                            tagWrong.style.display = "block"

                            const circleInput = ansDiv.getElementsByClassName("ans_quiz_box_contain_input_circle")[0]
                            circleInput.style.backgroundColor = "#000000"

                            // Change correct Answer
                            const ansCorrectQuiz = parseInt(correctAns[question._id])
                            const ansDivCorrect = document.getElementById("ans_quiz_" + (i + 1) + "_" + (ansCorrectQuiz + 1))
                            ansDivCorrect.style.paddingBottom = "9px"
                            ansDivCorrect.style.paddingTop = "9px"
                            ansDivCorrect.style.backgroundColor = "#ddd"

                            const tagCorrect = ansDivCorrect.getElementsByClassName("ans_quiz_box_contain_input_ans")[0]
                            tagCorrect.style.display = "block"
                        }
                    }
                }

                /**
                 * Set Text Result
                 */
                resText.innerText = res.scoreText
                scoreText.innerText = res.score + "/10"
                scorePercent.innerText = res.score * 10 + "%"

                // Show Page 3
                const page3 = document.querySelector("#page3")
                page3.style.display = "block";
            })
            .catch(err => {
                // Error
            });
    }
}

function onTry() {
    window.location.reload(true)
}

