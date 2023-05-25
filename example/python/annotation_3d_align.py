import open3d as o3d
import os
import numpy as np
import glob
import json
from scipy.spatial.transform import Rotation as R


def parse_annotation(annotation_file):
    """Parse the annotation file and return the bbox param"""
    label_annotation = json.load(open(annotation_file))
    bbox_pos = np.array(
        [
            label_annotation["t_control"]["position"]["x"],
            label_annotation["t_control"]["position"]["y"],
            label_annotation["t_control"]["position"]["z"],
        ]
    )
    # get scale matrix
    scale_x = label_annotation["t_control"]["scale"]["x"]
    scale_y = label_annotation["t_control"]["scale"]["y"]
    scale_z = label_annotation["t_control"]["scale"]["z"]
    # bbox_scale_list = [[scale_x, 0, 0], [0, scale_y, 0], [0, 0, scale_z]]
    bbox_scale = np.array([scale_x, scale_y, scale_z], dtype=np.float64)
    # get rotation matrix
    quat_x = label_annotation["t_control"]["quaternion"]["_x"]
    quat_y = label_annotation["t_control"]["quaternion"]["_y"]
    quat_z = label_annotation["t_control"]["quaternion"]["_z"]
    quat_w = label_annotation["t_control"]["quaternion"]["_w"]
    bbox_quat = np.array([quat_w, quat_x, quat_y, quat_z])
    return bbox_pos, bbox_scale, bbox_quat


def align_pcd(recon_dir):
    """Add the annotation to the reconstruction"""
    # load axis-alignment
    axis_alignment = np.loadtxt(os.path.join(recon_dir, "rough_axis_alignment.txt"))
    # load the pcd model and the bbox file
    pcd = o3d.io.read_point_cloud(os.path.join(recon_dir, "recon.pcd"))
    bbox_list = []
    bbox_pos, bbox_scale, bbox_quat = parse_annotation(os.path.join(recon_dir, "WCoordinates.json"))
    # parse world coord
    transform_t = np.eye(4)
    transform_t[:3, 3] = bbox_pos
    transform_r = np.eye(4)
    bbox_quat_scipy = np.array([bbox_quat[1], bbox_quat[2], bbox_quat[3], bbox_quat[0]])
    transform_r[:3, :3] = R.from_quat(bbox_quat_scipy).as_matrix()
    transform = transform_t @ transform_r
    transform = np.linalg.inv(transform)
    # final axis alignment
    final_axis_alignment = transform @ axis_alignment
    np.savetxt(os.path.join(recon_dir, "axis_alignment.txt"), final_axis_alignment)

    # align the pcd and also crop the pcd
    pcd.transform(final_axis_alignment)
    # crop the pcd
    # create a bbox
    bbox = o3d.geometry.AxisAlignedBoundingBox()
    bbox.min_bound = np.array([-bbox_scale[0]/2.0, -bbox_scale[1]/2.0, -bbox_scale[2]/2.0])
    bbox.max_bound = np.array([bbox_scale[0]/2.0, bbox_scale[1]/2.0, bbox_scale[2]/2.0])
    bbox.color = (1, 0, 0)
    pcd = pcd.crop(bbox)

    # origin
    origin = o3d.geometry.TriangleMesh.create_coordinate_frame(size=1.0, origin=[0, 0, 0])
    o3d.visualization.draw_geometries([pcd, origin, bbox])
    pass


def check_annotation(recon_dir):
    """Check if the annotation is correct"""
    # load axis-alignment
    if not os.path.exists(os.path.join(recon_dir, "axis_alignment.txt")):
        return
    axis_alignment = np.loadtxt(os.path.join(recon_dir, "axis_alignment.txt"))
    # axis_alignment = np.linalg.inv(axis_alignment)
    # load the pcd model and the bbox file
    pcd = o3d.io.read_point_cloud(os.path.join(recon_dir, "recon.pcd"))
    pcd.transform(axis_alignment)
    origin = o3d.geometry.TriangleMesh.create_coordinate_frame(size=1.0, origin=[0, 0, 0])
    o3d.visualization.draw_geometries([pcd, origin])

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="3D annotation example")
    parser.add_argument("--recon_dir", type=str, default=".", help="The directory to save the annotation data")
    args = parser.parse_args()

    for scene in glob.glob(os.path.join(args.recon_dir, "*")):
        if not os.path.isdir(scene):
            continue
        align_pcd(scene)
        print("Processing {}".format(scene))
        check_annotation(scene)
