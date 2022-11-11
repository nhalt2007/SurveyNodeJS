let express = require("express");
let bodyParser = require("body-parser");
let session = require("express-session");
let inmemorydbadapter = require("./inmemorydbadapter");
let apiBaseAddress = "/api";
require("dotenv").config();
const port = process.env.PORT;

let app = express();
app.use(
  session({
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let getDBAdapter = (req) => {
  let db = new inmemorydbadapter(req.session);
  return db;
};

function sendJsonResult(res, obj) {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(obj));
}

app.get(apiBaseAddress + "/getActive", function (req, res) {
  let db = getDBAdapter(req);
  db.getSurveys(function (result) {
    sendJsonResult(res, result);
  });
});

app.get(apiBaseAddress + "/getSurvey", function (req, res) {
  let db = getDBAdapter(req);
  let surveyId = req.query["surveyId"];
  db.getSurvey(surveyId, function (result) {
    sendJsonResult(res, result);
  });
});

app.get(apiBaseAddress + "/changeName", function (req, res) {
  let db = getDBAdapter(req);
  let id = req.query["id"];
  let name = req.query["name"];
  db.changeName(id, name, function (result) {
    sendJsonResult(res, result);
  });
});

app.get(apiBaseAddress + "/create", function (req, res) {
  let db = getDBAdapter(req);
  let name = req.query["name"];
  console.log("name", name);
  db.addSurvey(name, function (survey) {
    sendJsonResult(res, survey);
  });
});

app.post(apiBaseAddress + "/changeJson", function (req, res) {
  let db = getDBAdapter(req);
  let id = req.body.id;
  let json = req.body.json;
  db.storeSurvey(id, null, json, function (survey) {
    sendJsonResult(res, survey);
  });
});

app.post(apiBaseAddress + "/post", function (req, res) {
  let db = getDBAdapter(req);
  let postId = req.body.postId;
  let surveyResult = req.body.surveyResult;
  console.log("3333");

  db.postResults(postId, surveyResult, function (result) {
    sendJsonResult(res, result.json);
  });
});

app.get(apiBaseAddress + "/delete", function (req, res) {
  let db = getDBAdapter(req);
  let id = req.query["id"];
  db.deleteSurvey(id, function (result) {
    sendJsonResult(res, { id: id });
  });
});

app.get(apiBaseAddress + "/results", function (req, res) {
  let db = getDBAdapter(req);
  let postId = req.query["postId"];
  db.getResults(postId, function (result) {
    sendJsonResult(res, result);
  });
});

app.get(
  ["/", "/about", "/run/*", "/edit/*", "/results/*"],
  function (req, res, next) {
    res.sendFile("index.html", { root: __dirname + "/public" });
  }
);

app.use(express.static(__dirname + "/public"));

app.listen(port || 3001, function () {
  console.log(`Listening in port ${port || 3001}!`);
});
