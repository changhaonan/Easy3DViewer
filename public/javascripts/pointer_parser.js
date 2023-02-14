
export function onPointerDown(event, engine_data) {
    engine_data.on_down_position.x = event.clientX;
    engine_data.on_down_position.y = event.clientY;
}

export function onPointerUp(event, engine_data) {
    engine_data.on_up_position.x = event.clientX;
    engine_data.on_up_position.y = event.clientY;

    if (engine_data.on_down_position.distanceTo(engine_data.on_up_position) === 0) {
        engine_data.t_control.detach();
    }
}

export function onPointerMove(event, engine_data) {
    engine_data.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    engine_data.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    engine_data.raycaster.setFromCamera(engine_data.pointer, engine_data.camera);
    const intersects = engine_data.raycaster.intersectObjects(engine_data.intersectable, false);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object !== engine_data.t_control.object) {
            engine_data.t_control.attach(object);
        }
    }
}