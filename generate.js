const pug = require('pug');
var fs = require('fs');
const config = require('./config')

const compiledFunction = pug.compileFile('./views/index.pug');

fs.writeFile('index.html', compiledFunction({
    git_root_file: config.repository_name, default_data_folder:config.default_data_folder, config: config.data
    }), function (err) {
    if (err) return console.log(err);
});