import numpy as np
import easy3d_viewer as ev
from scipy.spatial.transform import Rotation as R
import os
import open3d as o3d
import glob


def render_traj_file(data_path, traj_path):
    project_name = "check_sequence"
    # Parse intrinsics
    with open(os.path.join(data_path, "intrinsics.txt")) as f:
        lines = f.readlines()
        fx, fy, cx, cy = [float(line.split(":")[1]) for line in lines]

    # Prepare the context
    context = ev.Context.Instance()
    save_dir = os.path.dirname(__file__)
    context.setDir(os.path.join(save_dir, "../../public/test_data/example", project_name))
    traj_files = glob.glob(os.path.join(traj_path, "*.txt"))
    traj_files.sort()
    frame = 0
    for traj_file in traj_files:
        cam2world = np.loadtxt(traj_file).astype(np.float32)
        cam2world = np.linalg.inv(cam2world)
        context.open(frame)
        # add a coordinate
        context.addCoord("origin", scale=1.0)
        context.addCoord("trajectory", scale=0.1, coordinate=cam2world)

        # add depth measurement
        context.addPointCloud("depth", "", cam2world, 0.1)
        depth_image = o3d.io.read_image(os.path.join(data_path, "depth", f"{frame}.png"))
        img_size = np.array(depth_image).shape
        depth_pcd = o3d.geometry.PointCloud.create_from_depth_image(
            depth_image,
            o3d.camera.PinholeCameraIntrinsic(img_size[1], img_size[0], fx, fy, cx, cy),
            np.eye(4),
            depth_scale=1000.0,
            depth_trunc=1000.0,
            stride=1,
            project_valid_depth_only=False,
        )
        o3d.io.write_point_cloud(context.at("depth"), depth_pcd)

        context.close()
        frame += 1


if __name__ == "__main__":
    import argparse

    argparse = argparse.ArgumentParser()
    argparse.add_argument("--traj_path", type=str, default="log/poses")
    argparse.add_argument("--data_path", type=str, default="data/cracker_box_1")
    args = argparse.parse_args()
    render_traj_file(args.data_path, args.traj_path)
