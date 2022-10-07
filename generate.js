const pug = require('pug');
var fs = require('fs');

// Change in ./config.json to setting the visualization settings
const config = require('./config')

// Choose your prefered theme in views
const compiledFunction = pug.compileFile('./views/index.pug');

// Generate the output index.html that you can plug anywhere
fs.writeFile('index.html', compiledFunction({
    git_root_file: config.repository_name, default_data_folder: config.default_data_folder, config: config.data
}), function (err) {
    if (err) return console.log(err);
});