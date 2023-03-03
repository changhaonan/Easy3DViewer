import numpy as np
import easy3d_viewer as ev
from scipy.spatial.transform import Rotation as R
import os
import glob


def render_traj_file(traj_path):
    project_name = "check_sequence"
    # Prepare the context
    context = ev.Context.Instance()
    save_dir = os.path.dirname(__file__)
    context.setDir(os.path.join(save_dir, "../../public/test_data/example", project_name))
    traj_files = glob.glob(os.path.join(traj_path, "*.txt"))
    traj_files.sort()
    frame = 0
    for traj_file in traj_files:
        cam2world = np.loadtxt(traj_file).astype(np.float32)
        print(cam2world)
        context.open(frame)
        # add a coordinate
        context.addCoord("origin", scale=1.0)
        context.addCoord("trajectory", scale=0.1, coordinate=cam2world)
        context.close()
        frame += 1


if __name__ == "__main__":
    import argparse

    argparse = argparse.ArgumentParser()
    argparse.add_argument("--traj_path", type=str, default="log/poses")
    args = argparse.parse_args()
    render_traj_file(args.traj_path)
