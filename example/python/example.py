""" Example of the usage of Easy3DViewer
"""
import os
import easy3d_viewer as ev
import numpy as np
from easy3d_viewer.graph_visualizer import *

if __name__ == "__main__":
    # Prepare graph data
    vertices = np.array([[1, 1, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]])
    edges = np.array([[1, 1], [1, 2], [1, 3]])
    vertex_color = np.array([[1, 0, 1], [0, 1, 0], [0, 0, 1], [1, 1, 0]])

    # Save graph data to a json file 
    project_name = "python_example"
    context = ev.Context.Instance()
    save_dir = os.path.dirname(__file__)
    context.setDir(os.path.join(save_dir, "../../public/test_data", project_name))

    # Time sequence
    for i in range(10):
        context.open(i)
        context.addCoord("origin", scale=1.0)
        # add a coordinate
        context.addGraph("color_graph", "color_graph", size=10.0)
        SaveGraph(vertices=vertices, vertex_color=vertex_color, edges=edges, file_name=context.at("color_graph"))
        # add a sphere
        sphere_coordinate = np.eye(4, dtype=np.float32)
        sphere_coordinate[3, 2] = 0.5
        context.addGeometry("sphere", "sphere", geometry_type="sphere", coordinate=sphere_coordinate, param_0=0.2)
        
        # add unit box
        context.addBBox9D("box", "box", coordinate=np.eye(4, dtype=np.float32), width=1.0, height=1.0, depth=1.0)
        context.close()