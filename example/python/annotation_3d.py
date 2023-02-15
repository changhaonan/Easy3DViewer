""" This is an example of how to use Easy3DViewer to do 3D annotations.
"""

import os
import easy3d_viewer as ev
import numpy as np


def prepare_annotation(recon_file, save_dir):
    context = ev.Context.Instance()
    context.setDir(save_dir)
    context.open(0)
    # Add the pointcloud
    context.addPointCloud("recon", "recon", coordinate=np.eye(4, dtype=np.float32))
    # Copy the pointcloud to the current frame
    os.system("cp {} {}".format(recon_file, context.at("recon")))

    # Add a refrerence coordinate\
    context.addCoord("origin", scale=1.0)
    # Add the unit box
    context.addBBox9D(
        "box",
        "box",
        coordinate=np.eye(4, dtype=np.float32),
        width=1.0,
        height=1.0,
        depth=1.0,
    )
    context.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="3D annotation example")
    parser.add_argument(
        "--save_dir",
        type=str,
        default=".",
        help="The directory to save the annotation data",
    )
    parser.add_argument(
        "--recon_file", type=str, default="", help="The reconstruction file."
    )
    args = parser.parse_args()

    prepare_annotation(args.recon_file, args.save_dir)
