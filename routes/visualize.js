"use strict";
var express = require("express");
const router = express.Router({ mergeParams: true });

// Visualization routine
router.get("/", function (req, res) {
    const fs = require("fs");
    // parse args
    var full_dir_path = __dirname + "/../public/test_data/" + req.params.dir;
    fs.readdir(full_dir_path, (err, dires) => {
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            // match the pattern
            dires.sort((dir_a, dir_b) => {
                let pattern = /([1-9]\d*)/;
                let num_a = parseInt(dir_a.match(pattern)[0]);
                let num_b = parseInt(dir_b.match(pattern)[0]);
                if (parseInt(num_a) > parseInt(num_b)) return 1;
                else return -1;
            });  // sort

            const data = {};
            data.list_dir = dires;
            console.log(dires);
            res.send(data);
        }
    });
});

module.exports = router;