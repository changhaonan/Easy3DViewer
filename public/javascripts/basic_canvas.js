/**
 * @Author: Haonan Chang
 * @Date:   2022-05-31 13:47:06
 * @Last Modified by:   Haonan Chang
 * @Last Modified time: 2022-07-23 22:37:05
 */
import * as THREE from "https://changhaonan.github.io/Easy3DViewer/external/three.js/build/three.module.js";
import { TrackballControls } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/controls/TrackballControls.js";
import { GUI } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/libs/lil-gui.module.min.js";
import { FontLoader } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/loaders/FontLoader.js";
import { TransformControls } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/controls/TransformControls.js";

export function createBasicCanvas(container_id, gui_enable = false) {
    const engine_data = {
        "renderer": null,
        "scene": null,
        "camera": null,
        "camera_control": null,
        "t_control": null,
        "gui": null,
        "record": false
    };

    const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });  // Enable screen shot
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);  // Scene background color (white)

    renderer.setSize($(container_id).width(), $(container_id).height());
    renderer.outputEncoding = THREE.sRGBEncoding;
    $(container_id).append(renderer.domElement);

    // Light
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, $(container_id).width() / $(container_id).height(), 0.1, 1000);
    camera.position.set(0.0, 0.0, 0.0);  // manually set start position
    camera.up = new THREE.Vector3(0.0, -1.0, 0.0);
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 1.0));

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);

    // Trackball Control
    // FIXME: Trackball Control may need to be tuned?
    const trackBall_control = new TrackballControls(camera, renderer.domElement);
    trackBall_control.addEventListener("change", () => {
        render(renderer, scene, camera);
    }); // use if there is no animation loop
    trackBall_control.rotateSpeed = 5.0;
    trackBall_control.panSpeed = 3.0;
    trackBall_control.zoomSpeed = 2.0;
    trackBall_control.target.set(0.0, 0.0, 1.0);  // look at z-axis
    trackBall_control.staticMoving = true;
    trackBall_control.update();

    // Transform Control
    const transform_control = new TransformControls(camera, renderer.domElement);
    transform_control.addEventListener("change", () => {
        render(renderer, scene, camera);
    });
    transform_control.addEventListener("dragging-changed", function (event) {
        // Disable trackball control when transform control is active
        trackBall_control.enabled = !event.value;
    });
    scene.add(transform_control);
    // Pointer info
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const on_up_position = new THREE.Vector2();
    const on_down_position = new THREE.Vector2();
    engine_data.raycaster = raycaster;
    engine_data.pointer = pointer;
    engine_data.on_up_position = on_up_position;
    engine_data.on_down_position = on_down_position;

    // GUI
    if (gui_enable) {
        const gui = new GUI({ autoPlace: false });
        gui.domElement.id = "gui";
        $(container_id).append(gui.domElement);
        engine_data.gui = gui;
    }
    // Add scene into global
    engine_data.renderer = renderer;
    engine_data.scene = scene;
    engine_data.camera = camera;
    engine_data.camera_control = trackBall_control;
    engine_data.t_control = transform_control;

    // Load font to engine_data
    const loader = new FontLoader();
    loader.load("https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/fonts/helvetiker_regular.typeface.json",
        (response) => {
            engine_data.font = response;
        });
    return engine_data;
}

// Render function
export function render(renderer, scene, camera) {
    // update world matrix
    //$.each(engine_data.t_controllers, (key, controller) => {
    //    controller.updateMatrixWorld(true);
    //})
    renderer.render(scene, camera);
}

export function animate(engine_data) {
    requestAnimationFrame(() => { animate(engine_data); });
    engine_data.camera_control.update();
    render(engine_data.renderer, engine_data.scene, engine_data.camera);
}