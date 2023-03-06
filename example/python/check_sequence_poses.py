import numpy as np
import easy3d_viewer as ev
from scipy.spatial.transform import Rotation as R
import os
import open3d as o3d
import glob
import tqdm


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
    # sort by number order
    traj_files = sorted(traj_files, key=lambda x: int(os.path.basename(x).split(".")[0]))
    frame = 0
    for traj_file in tqdm.tqdm(traj_files):
        cam2world = np.loadtxt(traj_file).astype(np.float32)
        cam2world = np.linalg.inv(cam2world)
        context.open(frame)
        # add a coordinate
        context.addCoord("origin", scale=1.0)
        context.addCoord("trajectory", scale=0.1, coordinate=cam2world)

        # add depth measurement
        context.addPointCloud("depth", "", cam2world, 0.1, normal_mode="shadow")
        depth_image = o3d.io.read_image(os.path.join(data_path, "depth", f"{frame}.png"))
        color_image = o3d.io.read_image(os.path.join(data_path, "color", f"{frame}.png"))
        img_size = np.array(depth_image).shape
        intrinsics = o3d.camera.PinholeCameraIntrinsic(width=img_size[1], height=img_size[0], fx=fx, fy=fy, cx=cx, cy=cy)
        rgbd_image = o3d.geometry.RGBDImage.create_from_color_and_depth(
            o3d.geometry.Image(color_image), o3d.geometry.Image(depth_image), depth_scale=1000.0, depth_trunc=1000.0, convert_rgb_to_intensity=False
        )
        color_pcd = o3d.geometry.PointCloud.create_from_rgbd_image(rgbd_image, intrinsics)

        # depth_pcd.estimate_normals(search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.01, max_nn=30))
        o3d.io.write_point_cloud(context.at("depth"), color_pcd)

        context.close()
        frame += 1


if __name__ == "__main__":
    import argparse

    argparse = argparse.ArgumentParser()
    argparse.add_argument("--traj_path", type=str, default="log/poses")
    argparse.add_argument("--data_path", type=str, default="data/cracker_box_1")
    args = argparse.parse_args()
    render_traj_file(args.data_path, args.traj_path)
