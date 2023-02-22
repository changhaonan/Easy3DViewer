""" This is an example of how to use Easy3DViewer to do 3D annotations.
"""

import os
import easy3d_viewer as ev
import numpy as np
import shutil

def prepare_annotation(recon_dir, save_dir):
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    else:
        # Remove everything in the directory
        shutil.rmtree(save_dir)
        
    context = ev.Context.Instance()
    context.setDir(save_dir)
    context.open(0)
    # Add the pointcloud
    context.addPointCloud("recon", "recon", coordinate=np.eye(4, dtype=np.float32))
    # Copy the pointcloud to the current frame
    recon_file = os.path.join(recon_dir, "recon", "recon.pcd")
    os.system("cp {} {}".format(recon_file, context.at("recon")))

    # Add a refrerence coordinate\
    context.addCoord("origin", scale=1.0)
    # Add the unit box
    context.addBBox9D("box", "box", coordinate=np.eye(4, dtype=np.float32), width=1.0, height=1.0, depth=1.0)
    context.close()


if __name__ == "__main__":
    import argparse
    import glob

    parser = argparse.ArgumentParser(description="3D annotation example")
    parser.add_argument("--recon_dir", type=str, default="", help="The reconstruction dir.")
    parser.add_argument("--output_dir", type=str, default="", help="The output directory.")
    args = parser.parse_args()

    for dir in glob.glob(args.recon_dir + "/*"):
        if not os.path.isdir(dir):
            continue
        print("Processing {}".format(dir))
        scene_name = "scene_" + os.path.basename(dir)
        prepare_annotation(dir, os.path.join(args.output_dir, scene_name))
