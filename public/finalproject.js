/*
 * Justin Kim
 * CSC 337
 * Final Project
 * This is the .js file for index.html
 * It creates a quiz game and keeps track of the player's username
 * and their highscores
 */
(function() {
	"use strict";
	let numberCorrect = 0; // to keep track of number of correct answers
	let highscore = 0; // the user's previous high score
	let randomNumbersArray = []; // the numbers pick the index in the questionsJSONObj
								// to decide which question to load
	let correctAnswer; // holds the currect question's correct answer 
	let questionsJSONObj; // holds all the questions
	window.onload = function() {
		document.getElementById("startButton").onclick = startQuiz;
		document.getElementById("restart").onclick = restartQuiz;
		setRandomNumbersArray();
		getQuestions();
		processAnswer();
	};
	/**
	 * This function runs once the use
	 */
	function startQuiz() {
		let name = document.getElementById("usernameInput").value;
		name = name.toLowerCase();
		document.getElementById("loginPage").style.display = "none";
		document.getElementById("quizDone").style.display = "none";
		document.getElementById("container").style.display = "block";
		checkUsername(name);
		loadQuestion();
	}
	/**
	 * Takes the user back to the login page
	 */
	function restartQuiz() {
		setRandomNumbersArray();
		document.getElementById("loginPage").style.display = "block";
		document.getElementById("quizDone").style.display = "none";
		document.getElementById("container").style.display = "none";
		numberCorrect = 0;
		highscore = 0;
	}
	/**
	 * This function checks to see if the username has been used
	 * if it is a new username, then it adds that username to the file with
	 * an initial score of 0. name is the user's inputted name.
	 */
	function checkUsername(name) {
		let foundUser = false;
		let url = "https://fp460663.herokuapp.com?mode=getuser";
		fetch(url)
		.then(checkStatus)
		.then(function(responseText) {
			let json = JSON.parse(responseText);
			for (let i = 0; i < json["users"].length; i++) {
				if (name == json["users"][i]["username"]) {
					foundUser = true;
					highscore = json["users"][i]["score"];
					break;
				}
			}
			if (!foundUser) {
				console.log("User not found");
				addUser(name);
			}
		});
	}
	/**
	 * Adds a user to the usernames file
	 */
	function addUser(name) {
		const output = {username : name,
							score : 0};
		const fetchOptions = {
			method: 'POST',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			},
			body : JSON.stringify(output)
		};
		console.log(output);
		
		let url = "https://fp460663.herokuapp.com?mode=adduser";
		fetch(url, fetchOptions)
			.then(checkStatus)
			.then(function(responseText) {
				console.log("Success");
			})
			.catch(function(error) {
				console.log(error);
			});
	}
	
	/**
	 * This function gets called once the page loads and
	 * creates a JSON object that contains all the questions
	 */
	function getQuestions() {
		let url = "https://fp460663.herokuapp.com?mode=getquestion";
		console.log("in getQuestion in finalproject.js");
		fetch(url)
		.then(checkStatus)
		.then(function(responseText) {
			let json = JSON.parse(responseText);
			questionsJSONObj = json;
		})
		.catch(function(error) {
			console.log(error);
		});
	}
	/**
	 * This function is called when the quiz starts and every time
	 * a question is answered. It loads the question # in the file
	 * of the first element of the array of randomly generated numbers,
	 * randomNumbersArray, then removes that element
	 */
	function loadQuestion() {
		if (randomNumbersArray.length > 0) {
			let question = questionsJSONObj["questions"][randomNumbersArray[0]];
			console.log("This is the question obj");
			console.log(question);
			document.getElementById("question").innerHTML = question["question"];
			document.getElementById("qA").innerHTML = question["A"];
			document.getElementById("qB").innerHTML = question["B"];
			document.getElementById("qC").innerHTML = question["C"];
			document.getElementById("qD").innerHTML = question["D"];
			correctAnswer = question["answer"];
			randomNumbersArray.shift(); // remove the first element of the list
		} else {
			console.log("end of game");
			console.log(numberCorrect);
			quizEnd();
		}
	}
	/**
	 * This is run when the user finishes all the questions
	 * It will then make it so that it displays the correct page
	 * for the end of the quiz and update the user's highscore
	 * if warranted.
	 */
	function quizEnd() {
		document.getElementById("container").style.display = "none";
		document.getElementById("yourScore").innerHTML = numberCorrect;
		document.getElementById("bestScore").innerHTML = highscore;
		document.getElementById("quizDone").style.display = "block";
		if (numberCorrect > highscore) {
			const output = {username : name,
								score : highscore,
								newScore : numberCorrect};
			const fetchOptions = {
				method: 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'
				},
				body : JSON.stringify(output)
			};
			console.log(output);
			
			let url = "https://fp460663.herokuapp.com?mode=endquiz";
			fetch(url, fetchOptions)
				.then(checkStatus)
				.then(function(responseText) {
					console.log("Success");
				})
				.catch(function(error) {
					console.log(error);
				});
		}
	}
	/**
	 * This function is called once, every time a quiz is started
	 * It adds random ints in the range of 0 to the number of
	 * total questions that was created for this game
	 */
	function setRandomNumbersArray() {
		while (randomNumbersArray.length < 8) { // sets # of ?s in the quiz
			let number = Math.floor(Math.random() * 20); // generate random number
			if (!randomNumbersArray.includes(number)) {
				randomNumbersArray.push(number);
			}
		}
	}
	/**
	 * This function makes it so that all the buttons on the page 
	 * that answer the question call on the function checkAnswer
	 * if they are clicked. checkAnswer checks the response and loads
	 * the next question if necessary
	 */
	function processAnswer() {
		let answers = document.querySelectorAll(".questionsButton");
		console.log(answers);
		for (let i = 0; i < answers.length; i++) {
			answers[i].onclick = checkAnswer;
		}
	}
	/**
	 * This function checks to see if the chosen answer is correct.
	 * If it is correct then it will increase numberCorrect by 1
	 * then it will call the loadQuestion() function
	 */
	function checkAnswer() {
		if (this.value == correctAnswer) {
			numberCorrect++;
		}
		loadQuestion();
	}
	/**
	 * This is a function just to check if there is
	 * a valid connection with the localhost
	 */
	function checkStatus(response) {
		if (response.status >= 200 && response.status < 300) {  
			return response.text();
		} else if (response.status == 404) {
			// sends back a different error when we have a 404 than when we have
			// a different error
			return Promise.reject(new Error("Sorry, we couldn't find that page")); 
		} else {  
			return Promise.reject(new Error(response.status+": "+response.statusText)); 
		}
	}
})();
