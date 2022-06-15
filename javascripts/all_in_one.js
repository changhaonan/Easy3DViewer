//All the .js files were compressed into one using the command line such as:
//Installation: "npm install uglify-js -g"
//Then running the following command: "uglifyjs file1.js file2.js  -o output.js -c -m"

import * as THREE from "https://changhaonan.github.io/Easy3DViewer/external/three.js/build/three.module.js";
import { TrackballControls } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/controls/TrackballControls.js";
import { GUI } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/libs/lil-gui.module.min.js";
import { FontLoader } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/loaders/FontLoader.js";
import { OBJLoader } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/loaders/OBJLoader.js";
import { PCDLoader } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/loaders/PCDLoader.js";
import { Lut } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/math/Lut.js";
import { TextGeometry } from "https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/jsm/geometries/TextGeometry.js";

function createBasicCanvas(e, t = !1) 
{
    const o = {
            renderer: null,
            scene: null,
            camera: null,
            control: null,
            gui: null,
            record: !1
        },
        n = new THREE.WebGLRenderer({
            preserveDrawingBuffer: !0
        }),
        r = new THREE.Scene;
    r.background = new THREE.Color(16777215), n.setSize($(e).width(), $(e).height()), n.outputEncoding = THREE.sRGBEncoding, $(e).append(n.domElement);
    var a = new THREE.AmbientLight(13421772, .4);
    r.add(a);
    const l = new THREE.PerspectiveCamera(75, $(e).width() / $(e).height(), .1, 1e3);
    l.position.set(0, 0, 0), l.up = new THREE.Vector3(0, -1, 0), l.lookAt(new THREE.Vector3(0, 0, 1));
    a = new THREE.PointLight(16777215, .8);
    l.add(a), r.add(l);
    const s = new TrackballControls(l, n.domElement);
    if (s.addEventListener("change", () => {
            render(n, r, l)
        }), s.rotateSpeed = 5, s.panSpeed = 1, s.zoomSpeed = 2, s.target.set(0, 0, 1), s.staticMoving = !0, s.update(), t) {
        const c = new GUI({
            autoPlace: !1
        });
        c.domElement.id = "gui", $(e).append(c.domElement), o.gui = c
    }
    o.renderer = n, o.scene = r, o.camera = l, o.control = s;
    const i = new FontLoader;
    return i.load("https://changhaonan.github.io/Easy3DViewer/external/three.js/examples/fonts/helvetiker_regular.typeface.json", e => {
        o.font = e
    }), o
}

function render(e, t, o) {
    e.render(t, o)
}

function animate(e) {
    requestAnimationFrame(() => {
        animate(e)
    }), e.control.update(), render(e.renderer, e.scene, e.camera)
}

function onKeydown(e, t, o) 
{
    if (o || 0 != $("#" + t.container_id + ":hover").length)
        if ("d" === e.key) ParseNext(t);
        else if ("a" == e.key) ParseLast(t);
    else if ("p" == e.key) try {
        ScreenShot(t)
    } catch (e) {
        console.log(e), console.log("Browser does not support taking screenshot of 3d context.")
    } else "r" == e.key && (t.record = !t.record, t.record ? console.log("record starting!") : console.log("record stop!"))
}

function ParseNext(t) 
{
    let o = !1;
    if ($.each(t.locker, (e, t) => {
            t && (o = !0)
        }), !o) {
        t.record && ScreenShot(t);
        let e = t.p;
        e = t.dir_list.length <= e + 1 ? 0 : e + 1, loadContext(t.data_root + "/" + t.dir_list[e], t), t.p = e
    }
}

function ParseLast(t) 
{
    let o = !1;
    if ($.each(t.locker, (e, t) => {
            t && (o = !0)
        }), !o) {
        t.record && ScreenShot(t);
        let e = t.p;
        e = 0 == e ? t.dir_list.length - 1 : e - 1, loadContext(t.data_root + "/" + t.dir_list[e], t), t.p = e
    }
}

function ScreenShot(e) {
    console.log("%s-%d Screen shot.", e.container_id, e.p);
    var t = e.renderer.domElement.toDataURL("image/png"),
        o = document.createElement("a");
    o.href = t, o.download = e.container_id.toString() + "_" + e.p.toString() + ".png", o.click()
}

function loadModel(e, t, o) 
{
    "obj" == t.file_type ? (loadModelOBJ(e, t.file_name, t.vis, o), infoLog("Obj: " + e + " loaded.")) : "pcd" == t.file_type ? (loadModelPCD(e, t.file_name, t.vis, o), infoLog("Pcd: " + e + " loaded.")) : "json" == t.file_type ? "corr" == t.vis.mode ? (loadModelCorr(e, t.file_name, t.vis, o), infoLog("Corr: " + e + " loaded.")) : "graph" == t.vis.mode && (loadModelGraph(e, t.file_name, t.vis, o), infoLog("Graph: " + e + " loaded.")) : "png" == t.file_type ? loadModelImage(e, t.file_name, t.vis, o) : "geometry" == t.vis.mode ? (loadModelGeometry(e, t.vis, o), infoLog("Geometry: " + e + " loaded")) : infoLog("Format" + data_save.format + " is not supported.")
}

function loadModelOBJ(r, e, a, l) 
{
    l.locker[r] = !0;
    e = l.data_dir + "/" + e;
    const t = new OBJLoader;
    t.load(e, e => {
        let t = e.children[0],
            o = (t.material.side = THREE.DoubleSide, t.material.color.setHex(16777215 * Math.random()), t.name = r, new THREE.Matrix4);
        var n;
        o.elements = a.coordinate, t.applyMatrix4(o), null != (e = l.scene.getObjectByName(r)) && (t.material.color = e.material.color, -1 < (n = l.intersectable.indexOf(e)) && l.intersectable.splice(n, 1), l.scene.remove(e)), t.visible = !0, l.scene.add(t), a.intersectable && l.intersectable.push(t), l.locker[r] = !1
    }, e => {}, e => {
        infoLog("Obj loading failed.")
    })
}

function loadModelPCD(r, e, a, l) 
{
    l.locker[r] = !0;
    e = l.data_dir + "/" + e;
    const t = new PCDLoader;
    t.load(e, e => {
        e.name = r;
        let t = new THREE.Matrix4;
        var o, n;
        t.elements = a.coordinate, e.applyMatrix4(t), null != e.geometry.attributes.normal && null != e.geometry.attributes.color ? (o = new THREE.ShaderMaterial({
            vertexShader: $("#normalcolor-vertexshader")[0].textContent,
            fragmentShader: $("#normalcolor-fragmentshader")[0].textContent
        }), e.material = o) : null != e.geometry.attributes.normal ? (o = {
            color: {
                value: new THREE.Color(16776960)
            }
        }, o = new THREE.ShaderMaterial({
            uniforms: o,
            vertexShader: $("#shadow-vertexshader")[0].textContent,
            fragmentShader: $("#shadow-fragmentshader")[0].textContent
        }), e.material = o) : e.material.size = e.material.size * a.size, null != (o = l.scene.getObjectByName(r)) && (e.material.color = o.material.color, -1 < (n = l.intersectable.indexOf(o)) && l.intersectable.splice(n, 1), l.scene.remove(o)), e.visible = !0, l.scene.add(e), a.intersectable && l.intersectable.push(e), l.locker[r] = !1
    }, e => {}, e => {
        infoLog("Pcd loading failed.")
    })
}

function loadModelCorr(i, e, c, d) 
{
    d.locker[i] = !0;
    e = d.data_dir + "/" + e;
    $.getJSON(e).done(function (e) {
        const t = new THREE.LineBasicMaterial;
        t.color.setHex(16777215 * Math.random());
        var o = e.set.data,
            n = o.length / 6;
        const r = [];
        for (let e = 0; e < n; ++e) r.push(new THREE.Vector3(o[3 * e + 0], o[3 * e + 1], o[3 * e + 2])), r.push(new THREE.Vector3(o[3 * (e + n) + 0], o[3 * (e + n) + 1], o[3 * (e + n) + 2]));
        var a, e = (new THREE.BufferGeometry).setFromPoints(r);
        const l = new THREE.LineSegments(e, t);
        l.name = i;
        let s = new THREE.Matrix4;
        s.elements = c.coordinate, l.applyMatrix4(s), null != (e = d.scene.getObjectByName(i)) && (l.material.color = e.material.color, -1 < (a = d.intersectable.indexOf(e)) && d.intersectable.splice(a, 1), d.scene.remove(e)), l.visible = !0, d.scene.add(l), c.intersectable && d.intersectable.push(l), d.locker[i] = !1
    })
}

function loadModelGeometry(e, t, o) 
{
    o.locker[e] = !0;
    var n, r, a, l = t.geometry;
    let s, i = ("coord" == l ? (r = t.scale, a = new THREE.SphereGeometry(.001), n = new THREE.MeshBasicMaterial({
        color: 16776960
    }), (s = new THREE.Mesh(a, n)).add(new THREE.AxesHelper(r))) : "box" == l ? (a = t.width, n = t.height, r = t.depth, a = new THREE.BoxGeometry(a, n, r), n = new THREE.MeshBasicMaterial({
        color: 16777215 * Math.random(),
        side: THREE.DoubleSide
    }), s = new THREE.Mesh(a, n)) : "bounding_box" == l ? (r = t.width, a = t.height, n = t.depth, r = new THREE.BoxGeometry(r, a, n), a = new THREE.MeshBasicMaterial, n = new THREE.Mesh(r, a), (s = new THREE.BoxHelper).setFromObject(n)) : "plane" == l && (r = t.width, a = t.height, n = new THREE.PlaneGeometry(r, a), l = new THREE.MeshBasicMaterial({
        color: 16777215 * Math.random(),
        side: THREE.DoubleSide
    }), s = new THREE.Mesh(n, l)), s.name = e, new THREE.Matrix4);
    i.elements = t.coordinate, s.applyMatrix4(i), null != (r = o.scene.getObjectByName(e)) && (s.material.color = r.material.color, -1 < (a = o.intersectable.indexOf(r)) && o.intersectable.splice(a, 1), o.scene.remove(r)), s.visible = !0, o.scene.add(s), t.intersectable && o.intersectable.push(s), o.locker[e] = !1
}

function loadModelGraph(x, e, T, R) 
{
    R.locker[x] = !0;
    e = R.data_dir + "/" + e;
    $.getJSON(e).done(function (r) {
        const a = new THREE.Group,
            l = new Lut("rainbow", 512);
        l.setMax(T.max_val), l.setMin(T.min_val);
        let s = []; {
            let n = r.vertices.length;
            $.each(r.edges, (e, t) => {
                var o = t[0],
                    t = t[1];
                o >= n || t >= n || 0 != o && 0 != t || (s.includes(o) || s.push(o), s.includes(t) || s.push(t))
            })
        }
        const o = [],
            n = [],
            e = ($.each(r.vertices, (e, t) => {
                o.push(new THREE.Vector3(t[0], t[1], t[2])), s.includes(e) ? n.push(1, 1, 1) : null != r.color_v ? n.push(r.color_v[e][0], r.color_v[e][1], r.color_v[e][2]) : null != r.weight_v ? (t = l.getColor(r.weight_v[e]), n.push(t.r, t.g, t.b)) : n.push(1, 1, 1)
            }), (new THREE.BufferGeometry).setFromPoints(o)),
            t = (e.setAttribute("color", new THREE.Float32BufferAttribute(n, 3)), new THREE.PointsMaterial({
                vertexColors: THREE.VertexColors
            }));
        t.size = .005 * T.size;
        var i = new THREE.Points(e, t);
        a.add(i);
        const c = [],
            d = [];
        if (null != r.normals) {
            let n;
            n = null != T.normal_len ? .005 * T.normal_len : .015, $.each(r.normals, (e, t) => {
                c.push(new THREE.Vector3(r.vertices[e][0], r.vertices[e][1], r.vertices[e][2])), c.push(new THREE.Vector3(r.vertices[e][0] + t[0] * n, r.vertices[e][1] + t[1] * n, r.vertices[e][2] + t[2] * n));
                let o;
                o = null != r.weight_n ? l.getColor(r.weight_n[e]) : {
                    r: 1,
                    g: 1,
                    b: 1
                }, d.push(o.r, o.g, o.b), d.push(o.r, o.g, o.b)
            });
            const w = (new THREE.BufferGeometry).setFromPoints(c);
            w.setAttribute("color", new THREE.Float32BufferAttribute(d, 3));
            i = new THREE.PointsMaterial({
                vertexColors: THREE.VertexColors
            }), i = new THREE.LineSegments(w, i);
            a.add(i)
        }
        const h = [],
            u = [],
            m = r.vertices.length,
            E = ($.each(r.edges, (t, o) => {
                var n = o[0],
                    o = o[1];
                if (!(n >= m || o >= m) && 0 != n && 0 != o && 1 != n && 1 != o) {
                    h.push(new THREE.Vector3(r.vertices[n][0], r.vertices[n][1], r.vertices[n][2])), h.push(new THREE.Vector3(r.vertices[o][0], r.vertices[o][1], r.vertices[o][2]));
                    let e;
                    e = null != r.weight_e ? l.getColor(r.weight_e[t]) : {
                        r: 0,
                        g: 0,
                        b: 0
                    }, u.push(e.r, e.g, e.b), u.push(e.r, e.g, e.b)
                }
            }), (new THREE.BufferGeometry).setFromPoints(h));
        E.setAttribute("color", new THREE.Float32BufferAttribute(u, 3));
        i = new THREE.PointsMaterial({
            vertexColors: THREE.VertexColors
        }), i = new THREE.LineSegments(E, i);
        if (a.add(i), T.id_visible) {
            const v = R.font,
                b = [new THREE.MeshPhongMaterial({
                    color: 16777215,
                    flatShading: !0
                }), new THREE.MeshPhongMaterial({
                    color: 16777215
                })];
            $.each(o, (e, t) => {
                e = new TextGeometry(e.toString(), {
                    font: v,
                    size: .005,
                    height: .001,
                    curveSegments: 4,
                    bevelEnabled: !1
                });
                const o = new THREE.Mesh(e, b);
                o.position.x = t.x, o.position.y = t.y, o.position.z = t.z, o.rotation.x = Math.PI, a.add(o)
            })
        }
        const g = [];
        g.push(new THREE.Vector3(r.vertices[0][0], r.vertices[0][1], r.vertices[0][2]));
        var i = (new THREE.BufferGeometry).setFromPoints(g),
            p = new THREE.PointsMaterial({
                size: .01 * T.size
            }),
            i = new THREE.Points(i, p);
        a.add(i), a.name = x;
        let f = new THREE.Matrix4;
        f.elements = T.coordinate, a.applyMatrix4(f), null != (p = R.scene.getObjectByName(x)) && (-1 < (i = R.intersectable.indexOf(p)) && R.intersectable.splice(i, 1), R.scene.remove(p)), a.visible = !0, R.scene.add(a), T.intersectable && R.intersectable.push(a), R.locker[x] = !1
    })
}

function loadModelImage(e, t, o, n) 
{
    n.locker[e] = !0, n.locker[e] = !1
}

function infoLog(e) 
{
    console.log(e)
}

var saveData = function () 
{
    var o = document.createElement("a");
    return document.body.appendChild(o), o.style = "display: none",
        function (e, t) {
            e = JSON.stringify(e), e = new Blob([e], {
                type: "octet/stream"
            }), e = window.URL.createObjectURL(e);
            o.href = e, o.download = t, o.click(), window.URL.revokeObjectURL(e)
        }
}();

function loadFirstContext(e, t, o, n, r, a, l, s) 
{
    console.log("here" + n + " " + r, 0 == n.length), 0 == n.length ? 0 == r.length ? (console.log("here", e, t, o), l.data_root = e + t + "/" + o, console.log(l.data_root)) : l.data_root = e + r + "/" + o : 0 == r.length ? l.data_root = n + t + "/" + o : l.data_root = n + r + "/" + o, console.log(l.data_root), l.data_dir = "", l.controlls = {}, l.vis_controls = {}, l.intersectable = [], l.camera_init = !1, l.data = null, l.guis = {}, l.obj_loaded = [], l.defaults = {}, l.controls = {}, l.locker = {
        context: !0
    }, console.log(a), l.dir_list = a, l.p = 0, l.data_dir = l.data_root + "/" + l.dir_list[0], parseJson(l.data_dir + "/context.json", l, s), console.log(l)
}

function loadContext(e, t) 
{
    if (t.locker.context) return !1;
    t.locker = {
        context: !0
    }, parseJson((t.data_dir = e) + "/context.json", t)
}

function parseJson(t, o, n) 
{
    $.getJSON(t).done(function (e) {
        infoLog(t + " loaded."), o.data = e, $.each(e, (e, t) => {
            null != t.vis && updateGuiVis(e, t.vis, o)
        }), $.each(o.vis_controls, e => {
            o.controls[e].onChange(visibleCallBack(e, o, n))
        }), o.obj_loaded = [], $.each(o.vis_controls, e => {
            o.controls[e].getValue() && $.each(o.vis_controls[e], (e, t) => {
                loadModel(t, o.data[t], o), o.obj_loaded.push(t)
            })
        }), o.locker.context = !1
    })
}

function updateGuiControl(e, t) 
{
    let o;
    var n = e.section,
        n = (n in t.guis ? o = t.guis[n] : (o = t.gui.addFolder(e.section), t.guis[n] = o), e.control);
    let r;
    return n in t.controls ? r = t.controls[n] : "check_box" == e.gui && (t.defaults[n] = e.default, r = o.add(t.defaults, n), t.controls[n] = r), r
}

function updateGuiVis(e, t, o) 
{
    updateGuiControl(t, o);
    t = t.control;
    t in o.vis_controls ? o.vis_controls[t].includes(e) || o.vis_controls[t].push(e) : (o.vis_controls[t] = [], o.vis_controls[t].push(e))
}

//function infoLog(e) 
//{
//    console.log(e)
//}

function visibleCallBack(e, n, r) 
{
    return function (o) {
        $.each(n.vis_controls[e], (e, t) => {
            n.obj_loaded.includes(t) ? null != n.scene.getObjectByName(t) && (n.scene.getObjectByName(t).visible = o) : (loadModel(t, n.data[t], n), n.obj_loaded.push(t))
        })
    }
}

class MarkdownToc 
{
   constructor(e, t, o) 
    {
        jQuery.ajaxSetup({
            async: !1
        }), this.levelsToShow = e, this.menus = [];
        var n = t.split(",");
        for (let e = 0; e < n.length; ++e) {
            var r = "/Easy3DViewer/markdown/" + o + "/" + n[e] + ".md";
            $.get(r, e => {
                this.process(e)
            })
        }
        jQuery.ajaxSetup({
            async: !0
        })
    }

    getToc() 
    {
        return this.menus.join("\n")
    }

    process(e) 
    {
        const t = e;
        let o = !1;
        var n, r;
        let a = null;
        for (n of t.split("\n")) {
            const l = n.trim();
            if (!(o = l.startsWith("```") ? !o : o)) {
                let e = NaN,
                    t = null;
                if (l.startsWith("#")) {
                    const s = l.match(/(#+)\s*(.*?)#*\s*$/);
                    e = s[1].length, t = s[2].trim()
                } else null != a && 0 < a.length && 0 < l.length && (null == l.match(/[^=]/g) ? (e = 1, t = a) : null == l.match(/[^-]/g) && null != a.match(/[^-]/g) && (e = 2, t = a));
                isNaN(e) || null == t ? a = l : e - 1 >= this.levelsToShow || (r = t.toLocaleLowerCase().replace(/\s/g, "-").replace(/[^A-Za-z0-9-_]/g, ""), r = `${"  ".repeat(e-1)}- [${t}](#${r})`, this.menus.push(r), a = null)
            }
        }
    }
}

export {
    createBasicCanvas,
    render,
    animate,
    onKeydown,
    loadModel,
    loadFirstContext,
    loadContext,
    MarkdownToc
};
