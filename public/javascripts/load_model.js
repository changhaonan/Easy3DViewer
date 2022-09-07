import * as THREE from "https://changhaonan.github.io/Easy3DViewer/external/three.js/build/three.module.js";
import { OBJLoader } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/loaders/OBJLoader.js";
import { PCDLoader } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/loaders/PCDLoader.js";
import { Lut } from 'https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/math/Lut.js';
import { TextGeometry } from 'https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/geometries/TextGeometry.js';
// To change this to support cloud
import { VertexNormalsHelper } from 'https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/helpers/VertexNormalsHelper.js';

// Model loading
export function loadModel(name, data, engine_data) {
    if (data.file_type == "obj") {
        loadModelOBJ(name, data.file_name, data.vis, engine_data);
        infoLog("Obj: " + name + " loaded.");
    }
    else if (data.file_type == "pcd") {
        loadModelPCD(name, data.file_name, data.vis, engine_data);
        infoLog("Pcd: " + name + " loaded.");
    }
    else if (data.file_type == "json") {
        if (data.vis.mode == "corr") {
            loadModelCorr(name, data.file_name, data.vis, engine_data);
            infoLog("Corr: " + name + " loaded.");
        }
        else if (data.vis.mode == "graph") {
            loadModelGraph(name, data.file_name, data.vis, engine_data);
            infoLog("Graph: " + name + " loaded.");
        }
    }
    else if(data.file_type == "png") {
        loadModelImage(name, data.file_name, data.vis, engine_data);
    }
    else if (data.vis.mode == "geometry") {
        loadModelGeometry(name, data.vis, engine_data);
        infoLog("Geometry: " + name + " loaded");
    }
    else {
        infoLog("Data is not supported:");
        infoLog(data);
    }
}

function loadModelOBJ(name, file_name, data_vis, engine_data) {
    engine_data.locker[name] = true;
    // get full path
    let file_path = engine_data.data_dir + "/" + file_name;
    
    const obj_loader = new OBJLoader();
    obj_loader.load(
        file_path, // URL
        (mesh) => {
            let obj = mesh.children[0];
            obj.material.side = THREE.DoubleSide;
            
            // set color
            obj.material.color.setHex(Math.random() * 0xffffff);
            obj.name = name;
            
            // set relative transform to parent
            let M = new THREE.Matrix4();  // relative transform
            M.elements = data_vis.coordinate;
            obj.applyMatrix4(M);
            
            // existence check
            let obj_to_remove;
            if ((obj_to_remove = engine_data.scene.getObjectByName(name)) != undefined) {
                // color inherit
                obj.material.color = obj_to_remove.material.color;
                const index = engine_data.intersectable.indexOf(obj_to_remove);
                if (index > -1) {
                    engine_data.intersectable.splice(index, 1);
                }
                engine_data.scene.remove(obj_to_remove);
            }
            
            obj.visible = true;  // update visible status
            engine_data.scene.add(obj);

            if (data_vis.intersectable) {
                engine_data.intersectable.push(obj);
            }

            // Release locker
            engine_data.locker[name] = false;
        },
        // called while loading is progressing
        (xhr) => {
            // infoLog("%s " + (xhr.loaded/xhr.total*100) + "% loaded", name);
        },
        // called when loading has errors
        (error) => {
            infoLog("Obj loading failed.");
        }
    );
}

function loadModelPCD(name, file_name, data_vis, engine_data) {
    engine_data.locker[name] = true;
    // get full path
    let file_path = engine_data.data_dir + "/" + file_name;
    
    const pcd_loader = new PCDLoader();
    pcd_loader.load(
        file_path,
        (pcd) => {
            const pcd_whole = new THREE.Group();
            pcd_whole.add(pcd);

            // size
            if (pcd.geometry.attributes.normal != undefined && pcd.geometry.attributes.color != undefined) {
                let shaderMaterial = new THREE.ShaderMaterial({
                    vertexShader: $("#normalcolor-vertexshader")[0].textContent,
                    fragmentShader: $("#normalcolor-fragmentshader")[0].textContent,
                });
                pcd.material = shaderMaterial;
            }
            else if (pcd.geometry.attributes.normal != undefined) {  // normal is defined
                let uniforms = {
                    color: { value: new THREE.Color(0xffff00) },
                };
                //let shaderMaterial = new THREE.ShaderMaterial({
                //    uniforms: uniforms,
                //    vertexShader: $("#normal-vertexshader")[0].textContent,
                //    fragmentShader: $("#normal-fragmentshader")[0].textContent,
                //});
                let shaderMaterial = new THREE.ShaderMaterial({
                    uniforms: uniforms,
                    vertexShader: $("#shadow-vertexshader")[0].textContent,
                    fragmentShader: $("#shadow-fragmentshader")[0].textContent,
                });
                pcd.material = shaderMaterial;
                // Draw normal
                // const normal_helper = new VertexNormalsHelper(pcd, 1.0, 0x00ff00, 1.0);  // Green
                const normal_helper = new VertexNormalsHelper(pcd, 1.0, Math.random() * 0xffffff, 1.0);  // Random color
                pcd_whole.add(normal_helper);
            }
            else {
                pcd.material.size = pcd.material.size * data_vis.size;
            }
                        
            let pcd_to_remove;
            if ((pcd_to_remove = engine_data.scene.getObjectByName(name)) != undefined) {
                // color inherit
                pcd.material.color = pcd_to_remove.children[0].material.color;  // Get material from pcd material
                const index = engine_data.intersectable.indexOf(pcd_to_remove);
                if (index > -1) {
                    engine_data.intersectable.splice(index, 1);
                }
                engine_data.scene.remove(pcd_to_remove);
            }
                        
            pcd_whole.name = name;
            let M = new THREE.Matrix4();  // relative transform
            M.elements = data_vis.coordinate;
            pcd_whole.applyMatrix4(M);
            pcd_whole.visible = true;
            engine_data.scene.add(pcd_whole);

            if (data_vis.intersectable) {
                engine_data.intersectable.push(pcd_whole);
            }

            // Release locker
            engine_data.locker[name] = false;
        },
        // called while loading is progressing
        (xhr) => {
            // infoLog("%s " + (xhr.loaded/xhr.total*100) + "% loaded", name);
        },
        // called when loading has errors
        (error) => {
            infoLog("Pcd loading failed.");
        }
    )
}

function loadModelCorr(name, file_name, data_vis, engine_data) {
    engine_data.locker[name] = true;
    // get full path
    let file_path = engine_data.data_dir + "/" + file_name;
    
    $.getJSON(file_path).done(
        function(data) {
            const material = new THREE.LineBasicMaterial();
            material.color.setHex(Math.random() * 0xffffff);
            
            let points_vec = data.set.data;
            let num_pairs = points_vec.length/6;
            
            const points = [];
            for(let i = 0; i < num_pairs; ++i) {
                points.push(new THREE.Vector3(points_vec[3*i+0], points_vec[3*i+1], points_vec[3*i+2]));
                points.push(new THREE.Vector3(points_vec[3*(i+num_pairs)+0], points_vec[3*(i+num_pairs)+1], points_vec[3*(i+num_pairs)+2]));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.LineSegments(geometry, material);
            line.name = name;

            let M = new THREE.Matrix4();  // relative transform
            M.elements = data_vis.coordinate;
            line.applyMatrix4(M);

            let corr_to_remove;
            if ((corr_to_remove = engine_data.scene.getObjectByName(name)) != undefined) {
                // color inherit
                line.material.color = corr_to_remove.material.color;
                const index = engine_data.intersectable.indexOf(corr_to_remove);
                if (index > -1) {
                    engine_data.intersectable.splice(index, 1);
                }
                engine_data.scene.remove(corr_to_remove);
            }

            line.visible = true;
            engine_data.scene.add(line);

            if (data_vis.intersectable) {
                engine_data.intersectable.push(line);
            }

            // Release locker
            engine_data.locker[name] = false;
        }
    );
}

function loadModelGeometry(name, data_vis, engine_data) {
    engine_data.locker[name] = true;
    let geometry_type = data_vis.geometry;
    
    let geo;
    if (geometry_type == "coord") {
        let scale = data_vis["scale"];
        const geometry = new THREE.SphereGeometry(0.001);  // small points
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        geo = new THREE.Mesh(geometry, material);
        geo.add(new THREE.AxesHelper(scale));
    }
    else if (geometry_type == "camera") {
        // Work from here
        let scale = data_vis["scale"];
        const geometry = new THREE.SphereGeometry(0.001);  // small points
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        geo = new THREE.Mesh(geometry, material);
        geo.add(new THREE.AxesHelper(scale));
        // Work end here
    }
    else if (geometry_type == "box") {
        let width = data_vis["width"];
        let height = data_vis["height"];
        let depth = data_vis["depth"];
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, side: THREE.DoubleSide});
        geo = new THREE.Mesh(geometry, material);
    }
    else if (geometry_type == "bounding_box") {
        let width = data_vis["width"];
        let height = data_vis["height"];
        let depth = data_vis["depth"];
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial();
        const box = new THREE.Mesh(geometry, material);
        geo = new THREE.BoxHelper();
        geo.setFromObject(box);
        //geo = new THREE.BoxHelper(geometry);
    }
    else if (geometry_type == "plane") {
        let width = data_vis["width"];
        let height = data_vis["height"];
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, side: THREE.DoubleSide});
        geo = new THREE.Mesh(geometry, material);
    }

    // set name
    geo.name = name;
    
    let M = new THREE.Matrix4();  // relative transform
    M.elements = data_vis.coordinate;
    geo.applyMatrix4(M);

    let geo_to_remove;
    if ((geo_to_remove = engine_data.scene.getObjectByName(name)) != undefined) {
        // color inherit
        geo.material.color = geo_to_remove.material.color;
        const index = engine_data.intersectable.indexOf(geo_to_remove);
        if (index > -1) {
            engine_data.intersectable.splice(index, 1);
        }
        engine_data.scene.remove(geo_to_remove);
    }

    geo.visible = true;
    engine_data.scene.add(geo);

    if (data_vis.intersectable) {
        engine_data.intersectable.push(geo);
    }

    // Release locker
    engine_data.locker[name] = false;
}

function loadModelGraph(name, file_name, data_vis, engine_data) {
    engine_data.locker[name] = true;
    const isolated_invisible = true;  // Make those isolated node (all neighbor are 0) invisible (aka. change it to white)
    // get full path
    let file_path = engine_data.data_dir + "/" + file_name;
    $.getJSON(file_path).done(
        function (data) {
            // group
            const graph = new THREE.Group();

            // Look up table
            // const lut = new Lut('rainbow', 512);
            const lut = new Lut("grayscale", 512);
            lut.setMax(data_vis.max_val);
            lut.setMin(data_vis.min_val);

            // Check isolated node
            let isolated_list = [];
            if (isolated_invisible) {
                let num_vertices = data.vertices.length;
                $.each(data.edges, (i, edge) => {
                    let id_e0 = edge[0];
                    let id_e1 = edge[1];

                    // check sanity first
                    if ((id_e0 >= num_vertices) || (id_e1 >= num_vertices)) return;

                    // Recheck 0-connection next (Zero conection is idle connection by default.)
                    // if ((id_e0 == 0) || (id_e1 == 0)) {
                    //     // Check if in isolated_list
                    //     if (!isolated_list.includes(id_e0)) {
                    //         isolated_list.push(id_e0);
                    //     }
                    //     if (!isolated_list.includes(id_e1)) {
                    //         isolated_list.push(id_e1);
                    //     }
                    //     return;
                    // }
                });
            }

            // vertices 
            const vertices = [];
            const color_v = [];
            $.each(data.vertices, (i, vertex) => {
                vertices.push(
                    new THREE.Vector3(
                        vertex[0], vertex[1], vertex[2]));
                if (isolated_invisible && isolated_list.includes(i))
                    color_v.push(1.0, 1.0, 1.0);  // Make it white (invisible)
                else if (data.color_v != undefined) 
                    color_v.push(data.color_v[i][0], data.color_v[i][1], data.color_v[i][2]);
                else if (data.weight_v != undefined) {
                    let color = lut.getColor(data.weight_v[i]);
                    color_v.push(color.r, color.g, color.b);
                }
                else 
                    color_v.push(0.0, 0.0, 1.0);  // Blue is the default color
            });

            const geometry_v = new THREE.BufferGeometry().setFromPoints(vertices);
            geometry_v.setAttribute("color", new THREE.Float32BufferAttribute(color_v, 3));
            
            const material_v = new THREE.PointsMaterial({vertexColors: THREE.VertexColors});
            material_v.size = 0.005 * data_vis.size;  // relative size
            const points = new THREE.Points(geometry_v, material_v);
            graph.add(points);

            // normals
            const normals = [];
            const color_n = [];
            let line_normal = null;
            if (data.normals != undefined) {
                let normal_len;
                if (data_vis.normal_len != undefined) {
                    normal_len = data_vis.normal_len;  // Scale times to normal
                }
                else {
                    normal_len = 0.015;  // [meter]
                }
                
                let normal_color;
                if (data_vis.color_code != "") {
                    if (data_vis.color_code == "red")
                        normal_color = { "r" : 1.0, "g" : 0.0, "b" : 0.0 };
                    else if (data_vis.color_code == "green")
                        normal_color = { "r" : 0.0, "g" : 1.0, "b" : 0.0 };
                    else if (data_vis.color_code == "blue")
                        normal_color = { "r" : 0.0, "g" : 0.0, "b" : 1.0 };
                    else
                        normal_color = { "r" : 0.0, "g" : 0.0, "b" : 0.0 };
                }
                else {
                    normal_color = { "r" : Math.random() * 0.5, "g" : Math.random() * 0.5, "b" : Math.random() * 0.5 };
                }
                
                $.each(data.normals, (i, normal) => {
                    normals.push(
                        new THREE.Vector3(
                            data.vertices[i][0],
                            data.vertices[i][1],
                            data.vertices[i][2]));

                    normals.push(
                        new THREE.Vector3(
                            data.vertices[i][0] + normal[0] * normal_len,
                            data.vertices[i][1] + normal[1] * normal_len,
                            data.vertices[i][2] + normal[2] * normal_len));
                    let color;
                    if (data.weight_n != undefined)
                        color = lut.getColor(data.weight_n[i]);
                    else
                        // color = { "r": 0.0, "g": 1.0, "b": 0.0 };  // Green is the default color
                        color = normal_color;

                    color_n.push(color.r, color.g, color.b);
                    color_n.push(color.r, color.g, color.b);
                })

                const geometry_n = new THREE.BufferGeometry().setFromPoints(normals);
                geometry_n.setAttribute("color", new THREE.Float32BufferAttribute(color_n, 3));

                const material_n = new THREE.PointsMaterial({ vertexColors: THREE.VertexColors });
                line_normal = new THREE.LineSegments(geometry_n, material_n);
                graph.add(line_normal);
            }

            // edges
            const edges = [];
            const color_e = [];
            const num_vertices = data.vertices.length;

            $.each(data.edges, (i, edge) => {
                let id_e0 = edge[0];
                let id_e1 = edge[1];

                // check sanity first
                if ((id_e0 >= num_vertices) || (id_e1 >= num_vertices) ||
                    (id_e0 < 0) || (id_e1 < 0)) return;

                // // Recheck 0-connection next (Zero conection is idle connection by default.)
                // if ((id_e0 == 0) || (id_e1 == 0)) return;
                // if ((id_e0 == 1) || (id_e1 == 1)) return;  // 1 is also forbidden for connection

                edges.push(
                    new THREE.Vector3(
                        data.vertices[id_e0][0],
                        data.vertices[id_e0][1],
                        data.vertices[id_e0][2]));
                edges.push(
                    new THREE.Vector3(
                        data.vertices[id_e1][0],
                        data.vertices[id_e1][1],
                        data.vertices[id_e1][2]));
                
                let color;
                if (data.weight_e != undefined) {
                    const reverse = true;  // Flip the order of color map to suit the background better
                    if (reverse) {
                        color = lut.getColor(data_vis.max_val - data.weight_e[i]);
                    }
                    else {
                        color = lut.getColor(data.weight_e[i]);
                    }
                }
                else 
                    color = {"r": 0.0, "g": 0.0, "b": 0.0};
                
                color_e.push(color.r, color.g, color.b);
                color_e.push(color.r, color.g, color.b);
            });

            const geometry_e = new THREE.BufferGeometry().setFromPoints(edges);
            geometry_e.setAttribute("color", new THREE.Float32BufferAttribute(color_e, 3));
            
            const material_e = new THREE.PointsMaterial({vertexColors: THREE.VertexColors});
            const lines = new THREE.LineSegments(geometry_e, material_e);
            graph.add(lines);

            // id geometry
            if (data_vis.id_visible) {
                const font = engine_data.font;
                const size = 0.005;
                const height = 0.001;
                const curveSegments = 4;
                const bevelEnabled = false;

                const text_materials = [
                    new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
                    new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
                ];

                $.each(vertices, (i, vertex) => {
                    const text_geo = new TextGeometry(i.toString(), {
                        font: font,
                        size: size,
                        height: height,
                        curveSegments: curveSegments,
                        bevelEnabled: bevelEnabled
                    });
                    const text_mesh = new THREE.Mesh(text_geo, text_materials);
                    text_mesh.position.x = vertex.x;
                    text_mesh.position.y = vertex.y;
                    text_mesh.position.z = vertex.z;
                    // Debug for simplisity
                    text_mesh.rotation.x = Math.PI;
                    //text_mesh.rotation.z = Math.PI;

                    graph.add(text_mesh);
                });
            }

            // add a big 0-index point
            const point_0 = [];
            point_0.push(new THREE.Vector3(data.vertices[0][0], data.vertices[0][1], data.vertices[0][2]));
            const dotGeometry = new THREE.BufferGeometry().setFromPoints(point_0);
            const dotMaterial = new THREE.PointsMaterial({size: 0.01*data_vis.size});
            const dot = new THREE.Points(dotGeometry, dotMaterial);
            graph.add(dot);

            graph.name = name;
            
            let M = new THREE.Matrix4();  // relative transform
            M.elements = data_vis.coordinate;
            graph.applyMatrix4(M);

            let graph_to_remove;
            if ((graph_to_remove = engine_data.scene.getObjectByName(name)) != undefined) {
                const index = engine_data.intersectable.indexOf(graph_to_remove);
                if (index > -1) {
                    engine_data.intersectable.splice(index, 1);
                }
                engine_data.scene.remove(graph_to_remove);
            }

            graph.visible = true;
            engine_data.scene.add(graph);

            if (data_vis.intersectable) {
                engine_data.intersectable.push(graph);
            }

            // Release locker
            engine_data.locker[name] = false;
        }
    );
}

function loadModelImage(name, file_name, data_vis, engine_data) {  //TODO: update to new version later on
    engine_data.locker[name] = true;
    //let file_path = engine_data.data_dir + "/" + file_name;
    
    //// fetch modal
    //let modal = document.getElementById("modal");
    //let modal_img = document.getElementById("modal-image");

    //// insert img 
    //if($("#" + name).length == 0) {  // add a new one
    //    $("#plots").append(
    //        $("<img>", {id: name, src: file_path, alt: file_name})
    //    );
    //    // bind call-back
    //    $("#" + name).click(
    //        function() {
    //            modal.style.display = "block";
    //            modal_img.src = this.src;
    //        }
    //    );
    //    // bind close
    //    $("#modal-close").click(
    //        function() {
    //            modal.style.display = "none";
    //        }
    //    );
    //}
    //else {  // update existing one
    //    $("#" + name).attr("src", file_path);  // update thumbnail
    //    $("#" + name).css("display", "initial");
    //    modal_img.src = file_path;  // update modal
    //}
    // Release locker
    engine_data.locker[name] = false;
}


function infoLog(msg) {
    console.log(msg);
}