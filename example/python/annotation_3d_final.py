import open3d as o3d
import os
import numpy as np
import glob
import json
import pickle
from scipy.spatial.transform import Rotation as R
from xml.etree.ElementTree import Element, SubElement, tostring

def gen_query_and_gt(recon_dir):
    """Generate query and ground truth for other data"""
    # load history (for queries)
    history_file = os.path.join(recon_dir, "history.pkl")
    if not os.path.exists(history_file):
        return
    with open(history_file, "rb") as f:
        history = pickle.load(f)
    # load gt_address (for address)
    gt_address_file = os.path.join(recon_dir, "gt_address.pkl")
    if not os.path.exists(gt_address_file):
        return
    with open(gt_address_file, "rb") as f:
        gt_address = pickle.load(f)
    # merge
    graph_queries = {}
    graph_queries["queries"] = []
    graph_queries["address"] = []
    for i in range(len(history)):
        address = gt_address[i]
        query = history[i]["action"]
        graph_queries["queries"].append(query)
        graph_queries["address"].append(address)
    # save
    with open(os.path.join(recon_dir, "graph_queries.pkl"), "wb") as f:
        pickle.dump(graph_queries, f)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="3D annotation example")
    parser.add_argument("--recon_dir", type=str, default=".", help="The directory to save the annotation data")
    parser.add_argument("--output_dir", type=str, default="", help="The output directory.")
    args = parser.parse_args()

    for scene in glob.glob(os.path.join(args.recon_dir, "*")):
        if not os.path.isdir(scene):
            continue
        print("Processing {}".format(scene))
        gen_query_and_gt(scene)