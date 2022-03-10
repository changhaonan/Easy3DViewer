"use strict";
console.log('here')
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

var fs = require('fs');

var app = express();


const pug = require('pug');


// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");

// uncomment after placing your favicon in /public
//app.use('/favicon.ico', express.static('boy.ico'));
app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", routes);
// app.use("/users", users);
// app.use("/visualize/:dir", visualize);

// catch 404 and forward to error handler
//app.use(function (req, res, next) {
//    var err = new Error("Not Found");
//    err.status = 404;
//    next(err);
//});

// error handlers

// development error handler
// will print stacktrace
// if (app.get("env") === "development") {
//     app.use(function (err, req, res, next) {
//         res.status(err.status || 500);
//         res.render("error", {
//             message: err.message,
//             error: err
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function (err, req, res, next) {
//     res.status(err.status || 500);
//     res.render("error", {
//         message: err.message,
//         error: {}
//     });
// });

app.set("port", process.env.PORT || 8000);


const compiledFunction = pug.compileFile('./views/index.pug');
// console.log(compiledFunction())

// fs.writeFile('index.html', compiledFunction({
//     git_root_file: '/Easy3DViewer'
//     }), function (err) {
//     if (err) return console.log(err);
//     console.log(`${compiledFunction({
//         git_root_file: '/Easy3DViewer'
//         })}`);
// });

let config = {
    repository_name: '',
    data: [{
    name:"move_dragon",
    folder_name: "move_dragon4Cam", 
    title: "Move Dragon Toy",
    frames: ["frame_000001", "frame_000002", "frame_000003", "frame_000004","frame_000005"]
    },{
        name:"scarf",
        folder_name: "scarf4Cam", 
        title: "Moving Scarf",
        frames: ["frame_000001"]
    }]
}


app.get('/', (req, res) => {
    res.send(compiledFunction({
        git_root_file: config.repository_name, config : config.data
    }))
})

// app.post("/dir_list", function (req, res) {
//     // const fs = require("fs");
//     // parse args
//     var full_data_root = __dirname + "/public" + req.body.data_root;  // Append to full name
//     console.log(full_data_root);
//     fs.readdir(full_data_root, (err, dires) => {
//         if (err) {
//             console.log(err);
//             throw err;
//         }
//         else {
//             // match the pattern
//             dires.sort((dir_a, dir_b) => {
//                 let pattern = /([1-9]\d*)/;
//                 let num_a = parseInt(dir_a.match(pattern)[0]);
//                 let num_b = parseInt(dir_b.match(pattern)[0]);
//                 if (parseInt(num_a) > parseInt(num_b)) return 1;
//                 else return -1;
//             });  // sort
            
//             const data = {};
//             data.dir_list = dires;
//             res.send(data);
//         }
//     });

// })

var server = app.listen(app.get("port"), function () {
    debug("Express server listening on port " + server.address().port);
});
console.log(app.get("port"))


