import numpy as np
import easy3d_viewer as ev
from scipy.spatial.transform import Rotation as R
import os


def check_pose_valid(pre_rot, cur_rot):
    rel_rot = pre_rot.T@(cur_rot)
    # convert np.array to rotation matrix

    rel_angle_axis = R.from_matrix(rel_rot).as_rotvec()

    if np.linalg.norm(rel_angle_axis) > 0.3:
        print("pose is not valid")
        return False
    else:
        return True


def render_traj(traj_file):
    project_name = "check_sequence"
    # Prepare the context
    context = ev.Context.Instance()
    save_dir = os.path.dirname(__file__)
    context.setDir(os.path.join(save_dir, "../../public/test_data/example", project_name))

    rotation_list = []
    translation_list = []
    with open(traj_file, "r") as f:
        for line in f:
            line = line.strip().split()
            rotation_list.append([float(line[0]), float(line[1]), float(line[2])])
            translation_list.append([float(line[3]), float(line[4]), float(line[5])])

    prev_rot = None
    for i, (rot, trans) in enumerate(zip(rotation_list, translation_list)):
        context.open(i)

        # add a coordinate
        context.addCoord("origin", scale=1.0)

        # add the trajectory
        transform = np.eye(4, dtype=np.float32)
        current_rot = R.from_euler("xyz", rot).as_matrix()
        if prev_rot is not None:
            if not check_pose_valid(prev_rot, current_rot):
                current_rot = prev_rot

        transform[:3, :3] = current_rot
        transform[3, :3] = np.array(trans)
        context.addCoord("trajectory", scale=1.0, coordinate=transform)
        prev_rot = current_rot
        context.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--traj_file", type=str, default="data.txt")
    args = parser.parse_args()

    render_traj(args.traj_file)
