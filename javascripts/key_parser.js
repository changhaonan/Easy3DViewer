import { loadContext } from "/testghpages/javascripts/load_context.js"

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
            console.log("record starting!");
        }
        else {
            console.log("record stop!");
        }
        
    }
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
    download.download = engine_data.container_id.toString() + "_" + engine_data.p.toString() + ".png";
    download.click();
}