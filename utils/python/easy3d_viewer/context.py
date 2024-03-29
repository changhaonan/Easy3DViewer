"""
The python interface for Easy3DViewer
"""
import os
from pydoc import classname
import numpy as np
import json
import shutil


class Context():
    # Use class member to represent static member
    context_info = dict()
    data_root_dir = 0
    dir_prefix = ""
    dir_suffix = ""
    id = 0

    @classmethod
    def Instance(cls):
        """ This method literally do nothing, we have this because we want to pair c++ method
        """
        return cls 

    @classmethod
    def setDir(cls, data_root_dir, dir_prefix="frame_", dir_suffix=""):
        """ Set root workspace
        """
        cls.data_root_dir = data_root_dir
        cls.dir_prefix = dir_prefix
        cls.dir_suffix = dir_suffix
        if not os.path.isdir(cls.data_root_dir):
            os.mkdir(cls.data_root_dir)
        else:
            cls.clearDir(cls.data_root_dir)

    @classmethod
    def currentDir(cls):
        """ Current active directory
        """
        rel_dir = f"{cls.dir_prefix}{cls.id:06}{cls.dir_suffix}"
        return os.path.join(cls.data_root_dir, rel_dir)

    @classmethod
    def currentFile(cls, name):
        """ The full file name corresponding to name
        """
        file_type = cls.context_info[name]["file_type"]
        file_name = f"{name}.{file_type}"
        return os.path.join(cls.currentDir(), file_name)

    @classmethod
    def at(cls, name):
        if name in cls.context_info.keys():
            return cls.currentFile(name)
        else:
            raise Exception("No such key in context!")
            return ""

    # Add visualization info
    @classmethod
    def addGeometry(cls, name, control_name="", geometry_type="coord", coordinate=np.eye(4, dtype=np.float32),
        param_0=0.0, param_1=1.0, param_2=2.0):

        info_data = dict()
        info_data["vis"] = dict()
        info_data["vis"]["section"] = "Geometry"
        info_data["vis"]["control"] = control_name if (control_name) else name
        info_data["vis"]["mode"] = "geometry"
        info_data["vis"]["gui"] = "check_box"
        info_data["vis"]["default"] = False
        info_data["vis"]["intersectable"] = False
        info_data["vis"]["coordinate"] = coordinate.T.flatten().tolist()
        
        # Different according to geometry type
        info_data["vis"]["geometry"] = geometry_type
        if geometry_type == "coord":
            info_data["vis"]["scale"] = param_0
        elif geometry_type == "box":
            info_data["vis"]["width"] = param_0
            info_data["vis"]["height"] = param_1
            info_data["vis"]["depth"] = param_2
        elif geometry_type == "bounding_box":
            info_data["vis"]["width"] = param_0
            info_data["vis"]["height"] = param_1
            info_data["vis"]["depth"] = param_2
        elif geometry_type == "sphere":
            info_data["vis"]["radius"] = param_0
        elif geometry_type == "plane":
            info_data["vis"]["width"] = param_0
            info_data["vis"]["height"] = param_1
        
        cls.context_info[name] = info_data

    @classmethod
    def addCoord(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), scale=0.1):
        cls.addGeometry(name, control_name, "coord", coordinate, scale)

    @classmethod
    def addBox(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), width=1.0, height=1.0, depth=1.0):
        cls.addGeometry(name, control_name, "box", coordinate, width, height, depth)

    @classmethod
    def addBoundingBox(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), width=1.0, height=1.0, depth=1.0):
        cls.addGeometry(name, control_name, "bounding_box", coordinate, width, height, depth)

    @classmethod
    def addSphere(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), radius=1.0):
        cls.addGeometry(name, control_name, "sphere", coordinate, radius)

    @classmethod
    def addCamera(cls, name, control_name, coordinate, intrinsic, image_cols, image_rows, clip_near=0.0, clip_far=0.0, depth_flip=False,
        downsample_scale=1.0
    ):
        info_data = dict()
        
        # Visualization part
        info_data["vis"] = dict()
        info_data["vis"]["section"] = "Camera"
        info_data["vis"]["control"] = control_name if (control_name) else name
        # Use coord visualization for now
        info_data["vis"]["mode"] = "geometry"
        info_data["vis"]["geometry"] = "coord"
        info_data["vis"]["scale"] = 1.0
        # Other remains in camera
        info_data["vis"]["gui"] = "check_box"
        info_data["vis"]["default"] = False
        info_data["vis"]["intersectable"] = False
        info_data["vis"]["coordinate"] = coordinate.T.flatten().tolist()
        info_data["vis"]["intrinsic"] = intrinsic.tolist()
        info_data["vis"]["image_cols"] = image_cols  # If this one is negative, we do not normalize the length of normal
        info_data["vis"]["image_rows"] = image_rows
        info_data["vis"]["clip_near"] = clip_near
        info_data["vis"]["clip_far"] = clip_far

        # Stat part: used for constructing the space 
        info_data["extrinsic"] = coordinate.T.flatten().tolist()
        info_data["intrinsic"] = intrinsic.tolist()
        info_data["image_cols"] = image_cols  # If this one is negative, we do not normalize the length of normal
        info_data["image_rows"] = image_rows
        info_data["clip_near"] = clip_near
        info_data["clip_far"] = clip_far
        info_data["depth_flip"] = depth_flip
        info_data["downsample_scale"] = downsample_scale
        cls.context_info[name] = info_data

    @classmethod
    def addBBox9D(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), width=1.0, height=1.0, depth=1.0):
        # A BBox whose 9D pose can be controlled by the user
        info_data = dict()
        info_data["vis"] = dict()
        info_data["vis"]["section"] = "Transform"
        info_data["vis"]["control"] = control_name if (control_name) else name
        info_data["vis"]["mode"] = "geometry_9d"
        info_data["vis"]["geometry"] = "box"
        info_data["vis"]["gui"] = "check_box"
        info_data["vis"]["default"] = False
        info_data["vis"]["intersectable"] = True
        info_data["vis"]["coordinate"] = coordinate.T.flatten().tolist()
        info_data["vis"]["width"] = width
        info_data["vis"]["height"] = height
        info_data["vis"]["depth"] = depth
        cls.context_info[name] = info_data

    @classmethod
    def addGraph(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), min_val=0.0, max_val=1.0, size=1.0, 
        id_visible=False, normal_len=2.0)->None:
        info_data = dict()
        info_data["file_type"] = "json"
        info_data["file_name"] = name + ".json"

        # Visualization part
        info_data["vis"] = dict()
        info_data["vis"]["section"] = "Graph"
        info_data["vis"]["control"] = control_name if (control_name) else name
        info_data["vis"]["mode"] = "graph"
        info_data["vis"]["gui"] = "check_box"
        info_data["vis"]["default"] = False
        info_data["vis"]["intersectable"] = False
        info_data["vis"]["coordinate"] = coordinate.T.flatten().tolist()
        info_data["vis"]["size"] = size
        info_data["vis"]["normal_len"] = normal_len  # If this one is negative, we do not normalize the length of normal
        info_data["vis"]["min_val"] = min_val
        info_data["vis"]["max_val"] = max_val
        info_data["vis"]["id_visible"] = id_visible

        cls.context_info[name] = info_data

    @classmethod
    def addPointCloud(cls, name, control_name="", coordinate=np.eye(4, dtype=np.float32), size=0.5, normal_mode="none"):
        """ Add point cloud to the context

        Args:
            name (string): data name
            control_name (str, optional): name used for control. Defaults to "".
            coordinate (np.matrix4f, optional): cam2world in col-major. Defaults to np.eye(4, dtype=np.float32).
            size (float, optional): Point size in visualization. Defaults to 0.5.
            normal_mode (str, optional): "none", "shadow", "normal_color", "vector". Defaults to "none".
        """
        info_data = dict()
        info_data["file_type"] = "pcd"
        info_data["file_name"] = name + ".pcd"

        # Visualization part
        info_data["vis"] = dict()
        info_data["vis"]["section"] = "Point-Cloud"
        info_data["vis"]["control"] = control_name if (control_name) else name
        info_data["vis"]["mode"] = "point"
        info_data["vis"]["gui"] = "check_box"
        info_data["vis"]["default"] = False
        info_data["vis"]["intersectable"] = False
        info_data["vis"]["coordinate"] = coordinate.T.flatten().tolist()
        info_data["vis"]["size"] = size
        info_data["vis"]["normal_mode"] = normal_mode

        cls.context_info[name] = info_data

    @classmethod
    def addExtra(cls, name, info):
        cls.context_info[name] = info

    # Save/Load
    @classmethod
    def open(cls, id):
        cls.context_info.clear()  # Clean previous: important
        cls.id = id
        if not os.path.isdir(cls.currentDir()):
            os.mkdir(cls.currentDir())

    @classmethod
    def close(cls, enable_save=True):
        if enable_save:
            cls.save()

    @classmethod
    def save(cls):
        file_name = os.path.join(cls.currentDir(), "context.json")
        with open(file_name, "w") as f:
            json.dump(cls.context_info, f)

    @classmethod
    def clearDir(cls, dir_path):
        for files in os.listdir(dir_path):
            path = os.path.join(dir_path, files)
            try:
                shutil.rmtree(path)
            except OSError:
                os.remove(path)

    @classmethod
    def context(cls):
        """ Generate the context
        """
        return cls.context_info

    @classmethod
    def saveContext(cls, path):
        """ Save the context to a file
        """
        with open(path, "w") as f:
            json.dump(cls.context_info, f)

if __name__ == "__main__":
    context = Context.Instance()
    context.setDir("./data")
    for i in range(5):
        context.open(i)
        context.addGraph("test_graph")
        context.close()