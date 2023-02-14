import { loadContext } from "/javascripts/load_context.js"

export function onKeydown(event, engine_data, global_keyevent) {
    if (!global_keyevent)
        if ($("#" + engine_data.container_id + ":hover").length == 0) return;  // Earyly stop

    if (event.key === "d") {
        ParseNext(engine_data);
    }
    else if (event.key == "a") {
        ParseLast(engine_data);
    }
    else if (event.key == "p") {
        // Do screen shot
        try {
            ScreenShot(engine_data);
        }
        catch (e) {
            console.log(e);
            console.log("Browser does not support taking screenshot of 3d context.");
        }
    }
    else if (event.key == "r") {
        // Start recording mode
        engine_data.record = !engine_data.record;
        if (engine_data.record) {
            console.log("Record starting!");
        }
        else {
            console.log("Record stop!");
        }
    }
    else if (event.key == " ") {
        // Switching transform control mode
        if (engine_data.t_control.mode == "translate") {
            engine_data.t_control.setMode("rotate");
            console.log("t_control: rotate mode.");
        }
        else if (engine_data.t_control.mode == "rotate") {
            engine_data.t_control.setMode("scale");
            console.log("t_control: scale mode.");
        }
        else if (engine_data.t_control.mode == "scale") {
            engine_data.t_control.setMode("translate");
            console.log("t_control: translate mode.");
        }
    }
    else if (event.key == "Tab") {
        // Save current meta information
        DownloadMetaInfo(engine_data);
        console.log("Meta information saved!");
    }
}

//- /**
//-  * @Author: Kowndinya Boyalakuntla
//-  * @Date:   2022-05-31 13:47:06
//-  * @Last Modified by:   Kowndinya Boyalakuntla 
//-  * @Function Modified:  ParseNow()
//-  * @Last Modified time: 2023-01-28 19:07:45
//-  */
export function ParseNow(engine_data, progress) {
    // Checking locker
    let locker_status = false;
    $.each(engine_data.locker, (key, value) => {
        if (value) locker_status = true;  // One file is locked
    });
    if (locker_status) return;

    // Check record & record
    if (engine_data.record) {
        ScreenShot(engine_data);
    }

    let p = Math.floor((engine_data.dir_list.length * progress) / 100);
    if ((engine_data.dir_list.length * progress) % 100 == 0) {
        if (p >= engine_data.dir_list.length) {
            p = p - 1
        }
    }
    loadContext(engine_data.data_root + "/" + engine_data.dir_list[p], engine_data);
    engine_data.p = p;
}

function ParseNext(engine_data) {
    // Checking locker
    let locker_status = false;
    $.each(engine_data.locker, (key, value) => {
        if (value) locker_status = true;  // One file is locked
    });
    if (locker_status) return;

    // Check record & record
    if (engine_data.record) {
        ScreenShot(engine_data);
    }

    let p = engine_data.p;
    p = (engine_data.dir_list.length <= p + 1) ? 0 : p + 1;
    loadContext(engine_data.data_root + "/" + engine_data.dir_list[p], engine_data);
    engine_data.p = p;
}

function ParseLast(engine_data) {
    // Checking locker
    let locker_status = false;
    $.each(engine_data.locker, (key, value) => {
        if (value) locker_status = true;  // One file is locked
    });
    if (locker_status) return;

    // Check record & record
    if (engine_data.record) {
        ScreenShot(engine_data);
    }

    let p = engine_data.p;
    p = (p == 0) ? engine_data.dir_list.length - 1 : p - 1;
    loadContext(engine_data.data_root + "/" + engine_data.dir_list[p], engine_data);
    engine_data.p = p;
}

function ScreenShot(engine_data) {
    console.log("%s-%d Screen shot.", engine_data.container_id, engine_data.p);
    let dataURL = engine_data.renderer.domElement.toDataURL("image/png");
    // Download
    var download = document.createElement("a");  // href
    download.href = dataURL;
    download.download = engine_data.p.toString().padStart(6, "0") + ".png";
    download.click();
}

function DownloadMetaInfo(engine_data) {
    // Load current meta information
    let meta_info = {};
    
    // Current t_control information
    meta_info.t_control = {};
    meta_info.t_control.mode = engine_data.t_control.mode;
    meta_info.t_control.position = engine_data.t_control.object.position;
    meta_info.t_control.scale = engine_data.t_control.object.scale;
    meta_info.t_control.quaternion = engine_data.t_control.object.quaternion;

    // Save info into a json file and download
    let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(meta_info));
    var download = document.createElement("a");  // href
    download.href = "data:" + data;
    download.download = engine_data.p.toString().padStart(6, "0") + ".json";
    download.click();
}