# Easy3DViewer

A web-based 3D viewer based on three.js designed for easy-to-use.

## Usage

To use our system, you should first write a config.json to the root of our workspace.

An example of config.json is shown as follows:

```
{
    "repository_name" : "http://localhost:8000",
    "default_data_folder": "/test_data",
    "data": [
        {
            "source_url": "https://changhaonan.github.io/Easy3DViewer", 
            "source_directory": "/test_data", 
            "name":"test",
            "folder_name": "scarf4Cam", 
            "title": "Test",
            "frames": ["frame_000001"]
        }
    ]
}
```

There are two different ways of using this software.

### Running the Node App locally

The node app (in the master branch) consists of the code that you can use to run and test the software locally on your systems and generate the files needed for static hosting (can be used on github with github-pages).

The steps to run the software locally is as follows:

1. clone the repository
2. `npm install`
3. `node app.js`

To add in your own 3D visualizations, you need to add a folder with your animation to `public/test_data`. The folder should contain files that look like [this](https://github.com/changhaonan/Easy3DViewer/tree/master/public/test_data/move_dragon4Cam/frame_000001). Once added, you need to change the `config.json` to add the name of your folder and the frames you want to render.

Now if you run `node app.js`, you should see your visualizations. You can add multiple of these folders as shown in the example `config.json` and `test_data` folder that we have added.

### Generating the static files to host

The steps to generate the static `index.html` file is simple. Now that you have the node app set up from above, make sure that you put in your `repository_name` in the `config.json`. Once that is done, on your terminal, when you run `node generate.js`, you should see a new `index.html` file ready to be hosted.

We make a copy of this `index.html` and the `public/test_data` folder, and switch over to the `gh-pages` branch. Just replace the exisiting `index.html` and `test_data` with the copied (new) ones.

Once this is done, you need to push your code back to github.  You do not need to push the `externals` folder (in the `gh-pages` branch), as the exisiting code will point to this repository only. If you have github-pages enabled (see [this](https://docs.github.com/en/pages/quickstart)), you should see your page at https://username.github.io/repository_name. This may take a while to compile given the size of your repository.

If you do make changes to the `externals` folder in the `gh-pages` branch, in your editor you should search for `changhaonan.github.io/Easy3DViewer` and replace it with your `username.github.io/repository_name`

## Open-box usage

### Locally

First generate visualiazation data into `public/test_data`. Then run the following commands:

```
npm install
python configure.py
node app.js
```

## Issue

- [ ] When I remove "source_directory": "/test_data", the file can not be correctly loaded.

## Todo:

* [ ] Write a script to combine all javascript files into one. Instead of hosting a directory. We can instead only host one file. If people want to use our package, they only need to import from an url.
* [X] Add a python install script to further improve the easy to use ability.
* [X] Add more introduction in the interface.
