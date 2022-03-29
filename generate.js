const pug = require('pug');
var fs = require('fs');
const config = require('./config')

const compiledFunction = pug.compileFile('./views/index.pug');

// let config = {
//     repository_name: '/Easy3DViewer',
//     data: [{
//     name:"move_dragon",
//     folder_name: "move_dragon4Cam", 
//     title: "Move Dragon Toy",
//     frames: ["frame_000001", "frame_000002", "frame_000003", "frame_000004","frame_000005"]
//     },{
//         name:"scarf",
//         folder_name: "scarf4Cam", 
//         title: "Moving Scarf",
//         frames: ["frame_000001"]
//     }]
// }

fs.writeFile('index.html', compiledFunction({
    git_root_file: config.repository_name, default_data_folder:config.default_data_folder, config: config.data
    }), function (err) {
    if (err) return console.log(err);
});