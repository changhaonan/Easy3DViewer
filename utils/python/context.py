"""
Created by Haonan Chang, 03/28/2022
The python interface for Easy3DViewer
"""
import os
import numpy as np
import json
import shutil


class Context:
    def __init__(self):
        self.context_info = dict()
        self.data_root_dir = 0
        self.dir_prefix = ""
        self.dir_suffix = ""
        self.id = 0

    def setDir(self, data_root_dir, dir_prefix="", dir_suffix=""):
        """ Set root workspace
        """
        self.data_root_dir = data_root_dir
        self.dir_prefix = dir_prefix
        self.dir_suffix = dir_suffix
        if not os.path.isdir(self.data_root_dir):
            os.mkdir(self.data_root_dir)
        else:
            self.clearDir(self.data_root_dir)

    def currentDir(self):
        """ Current active directory
        """
        rel_dir = f"{self.dir_prefix}{self.id:06}{self.dir_suffix}"
        return os.path.join(self.data_root_dir, rel_dir)

    def currentFile(self, name):
        """ The full file name corresponding to name
        """
        file_type = self.context_info[name]["file_type"]
        file_name = f"{name}.{file_type}"
        return os.path.join(self.currentDir(), file_name)

    def at(self, name):
        if name in self.context_info.keys():
            return self.currentFile(name)
        else:
            print(f"Warning: {name} is not founded.")

    # Add visualization info
    def addGraph(self, name, control_name="", coordinate=np.eye(4, dtype=np.float32), min_val=0.0, max_val=1.0, size=1.0, 
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
        info_data["vis"]["coordinate"] = coordinate.flatten().tolist()
        info_data["vis"]["size"] = size
        info_data["vis"]["normal_len"] = normal_len * size  # If this one is negative, we do not normalize the length of normal
        info_data["vis"]["min_val"] = min_val
        info_data["vis"]["max_val"] = max_val
        info_data["vis"]["id_visible"] = id_visible

        self.context_info[name] = info_data

    # Save/Load
    def open(self, id):
        self.context_info.clear()  # Clean previous: important
        self.id = id
        if not os.path.isdir(self.currentDir()):
            os.mkdir(self.currentDir())

    def close(self):
        self.save()

    def save(self):
        file_name = os.path.join(self.currentDir(), "context.json")
        with open(file_name, "w") as f:
            json.dump(self.context_info, f)

    def clearDir(self, dir_path):
        for files in os.listdir(dir_path):
            path = os.path.join(dir_path, files)
            try:
                shutil.rmtree(path)
            except OSError:
                os.remove(path)


if __name__ == "__main__":
    context = Context()
    context.setDir("code/data")
    for i in range(5):
        context.open(i)
        context.addGraph("test_graph")
        context.close()