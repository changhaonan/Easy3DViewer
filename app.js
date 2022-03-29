"use strict";
var debug = require("debug")("my express app");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var routes = require("./routes/index");
var users = require("./routes/users");
var visualize = require("./routes/visualize");
var fs = require("fs");

// App settings
var app = express();
app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("port", process.env.PORT || 8000);

// WebPage compling
const pug = require("pug");
const compiledFunction = pug.compileFile("./views/index.pug");
// Config
const config = require("./config")
app.get("/", (req, res) => {
    console.log("Config fetched.")
    res.send(compiledFunction({
        git_root_file: config.repository_name, config : config.data
    }))
})

var server = app.listen(app.get("port"), function () {
    debug("Express server listening on port " + server.address().port);
});

console.log(app.get("port"))