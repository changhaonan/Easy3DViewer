"""
Created by Haonan Chang, 03/28/2022
Draw & Visualize Graph
"""
import numpy as np
import json


def SaveGraph(vertices, edges, file_name):
    return SaveGraph_Generic(
        vertices, 
        np.array([]),
        np.array([]),
        np.array([]),
        np.array([]),
        edges,
        np.array([]),
        file_name
    )


def SaveGraph(vertices, edges, normals, file_name):
    return SaveGraph_Generic(
        vertices, 
        np.array([]),
        np.array([]),
        normals,
        np.array([]),
        edges,
        np.array([]),
        file_name
    ) 


def SaveGraph_Generic(
    vertices,  # (N, 3), np.darray
    vertex_color,  # (N, 3)
    vertex_weight,  # (N, 1)
    normals,  # (N, 3)
    normal_weight,  # (N, 1)
    edges,  # (M, 2)
    edge_weight,  # (M, 1)
    file_name):
    graph_json = dict()


    # Vertex & edge
    graph_json["vertices"] = vertices.tolist()
    graph_json["edges"] = edges.astype(np.int32).tolist()

    # Vertex weight
    if vertex_weight.shape[0] != 0:
        assert(vertex_weight.shape[0] == vertices.shape[0])
        graph_json["weight_v"] = vertex_weight.tolist()

    # Vertex Color;
    if vertex_color.shape[0] != 0:
        assert(vertex_color.shape[0] == vertices.shape[0])
        graph_json["color_v"] = vertex_color.astype(np.int8).tolist()

    # Normals
    if normals.shape[0] != 0:
        assert(normals.shape[0] == vertices.shape[0])
        graph_json["normals"] = normals.tolist()

    # Normal weight
    if normal_weight.shape[0] != 0:
        assert(normal_weight.shape[0] == vertices.shape[0])
        graph_json["weight_n"] = normal_weight.tolist()

    # Edege weight
    if edge_weight.shape[0] != 0:
        assert(edge_weight.shape[0] == edges.shape[0])
        graph_json["weight_e"] = edge_weight.tolist()

    # Write out
    with open(file_name, "w") as f:
        json.dump(graph_json, f)