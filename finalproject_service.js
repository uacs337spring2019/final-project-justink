const express = require("express");
const app = express();
const fs = require("fs");

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
               "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(express.static('public'));

/**
 * This adds a new user to the file of users and their highscore
 */
app.post('/', jsonParser, function(req, res) {
	console.log(req.query.mode);
	if (req.query.mode == "adduser") {
		let name = req.body.username;
		let score = req.body.score;
		let output = name + ":::" + score + "\n";
		
		fs.appendFile("usernames.txt", output, function(err) {
			if(err) {
				console.log(err);
				res.status(400);
			}
			console.log("The output was saved");
			res.send("Success!");
		});
	} else if (req.query.mode == "endquiz") {
		let name = req.body.username;
		let score = req.body.score;
		let newScore = req.body.newScore;
		let original = name + ":::" + score;
		let updated = name + ":::" + newScore;
		console.log(original);
		console.log(updated);
		console.log("in endquiz");
		fs.readFile("usernames.txt", 'utf8', function (err, data) {
			if (err) {
				console.log(err);
				res.status(400);
			}
			let result = data.replace(original, updated);

			fs.writeFile("usernames.txt", result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
		});
	}
})
/**
 * This function is called only if the user scored higher than their previous
 * highscore. It then updates that user's highscore with their new one.
 */
 /*
app.post('/endquiz', jsonParser, function(req, res) {
	let name = req.body.username;
	let score = req.body.score;
	let newScore = req.body.newScore;
	let original = name + ":::" + score;
	let updated = name + ":::" + newScore;
	console.log(original);
	console.log(updated);
	console.log("in endquiz");
	fs.readFile("usernames.txt", 'utf8', function (err, data) {
		if (err) {
			console.log(err);
			res.status(400);
		}
		let result = data.replace(original, updated);

		fs.writeFile("usernames.txt", result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
})*/
/**
 * This function makes a list of JSON objects of {"username": username, "score": score}
 */
function getJsonListUsers(lines) {
	let jsonList = [];
	for (let i = 0; i < lines.length; i++) {
		let username = "";
		let score = "";
		let usernameScoreList = lines[i].split(":::");
		let jsonObj = {};
		if (usernameScoreList.length == 2) {
			username = usernameScoreList[0].trim();
			score = usernameScoreList[1].trim();
			jsonObj = {"username" : username,
					"score" : score};
			jsonList.push(jsonObj);
		}
		else {
			console.log("lines not correct format");
			console.log(i);
		}
	}
	return jsonList;
}
/**
 * This function returns a list of JSON objects
 * that are in the format {"question": , "a": , "b": , "c": , "d": , "answer": }
 */
function getJsonListQuestions(lines) {
	let jsonList = [];
	for (let i = 0; i < lines.length; i++) {
		let question = "";
		let a = "";
		let b = "";
		let c = "";
		let d = "";
		let answer = "";
		let questionAnswersList = lines[i].split(":::");
		let jsonObj = {};
		console.log(questionAnswersList);
		if (questionAnswersList.length == 6) {
			question = questionAnswersList[0].trim();
			a = questionAnswersList[1].trim();
			b = questionAnswersList[2].trim();
			c = questionAnswersList[3].trim();
			d = questionAnswersList[4].trim();
			answer = questionAnswersList[5].trim();
			jsonObj = {"question" : question,
					"A" : a,
					"B" : b,
					"C" : c,
					"D" : d,
					"answer" : answer};
			jsonList.push(jsonObj);
		}
		else {
			console.log("lines not correct format");
			console.log(i);
		}
	}
	return jsonList;
}
/**
 * This function opens up a file with a list of users and their highscores
 * then sends it to the requester
 */
app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	console.log(req.query.mode);
	if (req.query.mode == "getuser") {
		let file = fs.readFileSync("usernames.txt", 'utf8');
		let lines = file.split("\n");
		let jsonList = getJsonListUsers(lines);
		let json = {"users" : jsonList};
		res.send(JSON.stringify(json));
	} else if(req.query.mode == "getquestion") {
		console.log("in getquestion get");
		let file = fs.readFileSync("questions.txt", 'utf8');
		let lines = file.split("\n");
		let jsonList = getJsonListQuestions(lines);
		let json = {"questions" : jsonList};
		res.send(JSON.stringify(json));
	}
})
app.listen(process.env.PORT);
