""" Example of the usage of Easy3DViewer
"""

import easy3d_viewer as ev
import numpy as np
from easy3d_viewer.graph_visualizer import *


if __name__ == "__main__":
    # Prepare graph data
    vertices = np.array([[1, 1, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]])
    edges = np.array([[0, 1], [0, 2], [0, 3]])
    vertex_color = np.array([[1, 0, 1], [0, 1, 0], [0, 0, 1], [1, 1, 0]])

    # Save graph data to a json file 
    project_name = "python_example"
    context = ev.Context.Instance()
    context.setDir(f"/home/robot-learning/Projects/ws_Haonan/Easy3DViewer/public/test_data/{project_name}")

    # Time sequence
    for i in range(10):
        context.open(i)
        context.addCoord("origin", scale=1.0)
        context.addGraph("color_graph", "color_graph", size=10.0)
        SaveGraph(vertices=vertices, vertex_color=vertex_color, edges=edges, file_name=context.at("color_graph"))
        context.close()