/**
 * @Author: Haonan Chang
 * @Date:   2022-05-31 13:47:06
 * @Last Modified by:   Haonan Chang
 * @Last Modified time: 2022-07-23 22:35:45
 */
import * as THREE from "https://changhaonan.github.io/Easy3DViewer/external/three.js/build/three.module.js"
import { loadModel } from "/javascripts/load_model.js"

/*
 * \brief we should enable lasy-loading and event-based loop
 */
export function loadFirstContext(root_folder, default_data_folder, data_root, source_url, source_directory, dir_list, engine_data) {
    // Init engine_data
    // engine_data.data_root = ""
    console.log('here' + source_url + " " + source_directory, source_url.length == 0)
    if (source_url.length == 0){
        if (source_directory.length == 0){
            console.log('here', root_folder, default_data_folder, data_root)
            engine_data.data_root = root_folder + default_data_folder + '/' + data_root;
            console.log(engine_data.data_root)

        }
        else{
            engine_data.data_root = root_folder + source_directory + '/' +  data_root
        }
    }
    else{
        if (source_directory.length == 0){
            engine_data.data_root = source_url + default_data_folder + '/' +  data_root;
        }
        else{
            engine_data.data_root = source_url + source_directory + '/' + data_root
        }
    }
    console.log(engine_data.data_root)
    engine_data.data_dir = "";
    engine_data.vis_controls = {};
    engine_data.intersectable = [];
    engine_data.camera_init = false;
    engine_data.data = null;
    engine_data.guis = {};
    engine_data.obj_loaded = [];
    engine_data.gui_data = {};
    engine_data.controls = {};
    engine_data.locker = { "context": true };

    console.log(dir_list)
    engine_data.dir_list = dir_list;
    engine_data.p = 0;
    engine_data.data_dir = engine_data.data_root + "/" + engine_data.dir_list[0];
    let file_path = engine_data.data_dir + "/context.json";  // Parse first one
    parseJson(file_path, engine_data);
    console.log(engine_data)
}

export function loadContext(data_dir, engine_data) {
    if (engine_data.locker.context) return false;
    engine_data.locker = { "context": true };
    // parse file_path first
    engine_data.data_dir = data_dir;
    let file_path = data_dir + "/context.json";
    parseJson(file_path, engine_data);
}

function parseJson(file_path, engine_data) {
    // Add new controllers
    $.getJSON(file_path).done(function (data) {
        infoLog(file_path + " loaded.");
        // Save data
        engine_data.data = data;

        // Update gui
        $.each(data, (name, j) => {
            if (j.vis != undefined) updateGuiVis(name, j.vis, engine_data);  // update gui vis
        });

        // Vis callback
        $.each(engine_data.vis_controls, (key) => {
            engine_data.controls[key].onChange(visibleCallBack(key, engine_data));
        });
        
        // Actively load model
        engine_data.obj_loaded = [];  // Clean active
        $.each(engine_data.vis_controls, (key) => {
            if (engine_data.controls[key].getValue()) {
                $.each(engine_data.vis_controls[key],
                    (_i, name) => {
                        try {
                            loadModel(name, engine_data.data[name], engine_data);
                            engine_data.obj_loaded.push(name);  // Mark it as loaded only as it is loaded
                        }
                        catch(err) {
                            infoLog(name + " loads failed.");
                        }
                    })
            }
        });

        // Release locker
        engine_data.locker.context = false;
    });
}

// Gui-related
function updateGuiControl(data, engine_data) {
    // section
    let gui_section;
    let name_section = data.section;
    if (name_section in engine_data.guis) {
        gui_section = engine_data.guis[name_section];
    }
    else {
        gui_section = engine_data.gui.addFolder(data.section);
        engine_data.guis[name_section] = gui_section;
    }

    // control
    let name_control = data.control;
    let gui_control;
    if (name_control in engine_data.controls) {
        gui_control = engine_data.controls[name_control];
    }
    else {
        if (data.gui == "check_box") {  // Check box is to control visibility
            engine_data.gui_data[name_control] = data.default;
            gui_control = gui_section.add(
                engine_data.gui_data, name_control
            );
            engine_data.controls[name_control] = gui_control;
        }
        else if (data.gui == "button") {  // Check box has a lot of different functions
            if (data.mode == "camera") {
                engine_data.gui_data[name_control] = () => { 
                    // Reset camera control
                    engine_data.camera_control.reset();
                    
                    // Reset camera pose
                    engine_data.camera.matrixAutoUpdate = false;
                    let cam_view = new THREE.Matrix4();
                    // cam_view.elements = engine_data.data[name_control].vis.coordinate;
                    // Add little disturbance to avoid camera pose lock
                    let cam_pose = engine_data.data[name_control].vis.coordinate;
                    if (cam_pose[14] == 0.0) {
                        cam_pose[14] += 0.01;  // Add little shift over z-axis
                    }
                    cam_view.elements = cam_pose;
                    cam_view.decompose(engine_data.camera.position, engine_data.camera.quaternion, engine_data.camera.scale);
                    engine_data.camera.updateMatrix();
                    engine_data.camera.updateMatrixWorld();
                    
                    let cam_ny = new THREE.Vector3(0, -1, 0);
                    let cam_nz = new THREE.Vector3(0, 0, 1);
                    let cam_rot =  new THREE.Matrix3();
                    cam_rot.setFromMatrix4(cam_view);
                    let cam_ny_inworld = cam_ny.applyMatrix3(cam_rot);
                    let cam_nz_inwolrd = cam_nz.applyMatrix4(cam_view);
                    engine_data.camera.lookAt(cam_nz_inwolrd);
                    engine_data.camera.up.set(cam_ny_inworld.x, cam_ny_inworld.y, cam_ny_inworld.z);
                    engine_data.camera.matrixAutoUpdate = true; 
                    
                    console.log("Camera reset.");
                    // FIXME: Still having bugs here: 
                    // 1. After clicking for multiple times, the camera will be missing.
                    // The bug seems to be relevant with trackball control
                    // Still a little bit offset due to trackball control
                    // 2. The camera can not be set at origin. (Not fully understand why)
                };
                gui_control = gui_section.add(
                    engine_data.gui_data, name_control
                );
                engine_data.controls[name_control] = gui_control;
            }
            else {
                console.log(data.mode, "'s button is not implemented.");
            }
        }
    }
    return gui_control;
}

function updateGuiVis(name, data, engine_data) {
    let gui_control = updateGuiControl(data, engine_data);
    let name_control = data.control;
    if (name_control in engine_data.vis_controls) {
        if (!(engine_data.vis_controls[name_control].includes(name))) {
            engine_data.vis_controls[name_control].push(name);
        }
    }
    else {
        engine_data.vis_controls[name_control] = [];
        engine_data.vis_controls[name_control].push(name);
    }
}

function infoLog(msg) {
    console.log(msg);
}

// Call-back function
function visibleCallBack(name_control, engine_data) {
    return function (value) {
        $.each(engine_data.vis_controls[name_control],
            (_i, name) => {
                if (engine_data.obj_loaded.includes(name)) {
                    if (engine_data.scene.getObjectByName(name) != undefined) {  // 3D object
                        engine_data.scene.getObjectByName(name).visible = value;
                    }
                }
                else {
                    // If it doesn't exist. Show it.
                    try {
                        loadModel(name, engine_data.data[name], engine_data);
                        engine_data.obj_loaded.push(name);  // Set it as loaded only if we have it in this scene
                    }
                    catch {
                        infoLog(name + " loads failed.");
                    }
                }
            })
    }
}