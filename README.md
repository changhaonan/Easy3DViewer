# Easy3DViewer

A web-based 3D viewer based on three.js designed for easy-to-use.

## Usage
***

Go the webpage by typing this in your browser "https://changhaonan.github.io/Easy3DViewer/" to view the website.

Use the controls side-bar to load different files.
Use these key presses when the cursor inside the frame of the loaded file.
* P : Screenshot of the loaded file
* D : Next Frame 
* A : Previous Frame
* R : To take individual screenshots while going through different frames by using above key presses.

## Website Structure
***

```
Website
   |
   |----> Stylesheets
   |       |-----> main.css
   |
   |----> JavaScripts
   |       |-----> markdown_toc.js
   |       |-----> all_in_one.js <------- Unification of all these .js files
   |                                                    |
   |                                                    |---> basic_canvas.js 
   |                                                    |---> file_saver.js
   |                                                    |---> key_parser.js
   |                                                    |---> load_context.js
   |                                                    |---> load_model.js
   |       
   |----> test_data directory
   |----> markdown/star/ directory
   |----> external/three.js directory
   |----> images/slogan.svg
   |----> index.html
```

## How to do the .js files compression/unification
***

**Installation:** Run the command in cmd `npm install uglify-js -g` to install globally.

**To Use:** `cd` into the directory where all the .js file you want to unify are located at. 
        Upon doing that now run the command `uglifyjs file1.js file2.js  -o output.js -c -m`

The uglifyjs toolkit should have generated the output.js file in that same directory which is a unification of all the .js files you provided in the above command such as file1.js and file2.js

**Documentation:** https://github.com/mishoo/UglifyJS

**Alternatives:** You can also try to use Google Closure Compiler or JUnify or others for this purpose.
