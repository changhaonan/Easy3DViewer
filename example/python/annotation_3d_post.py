import open3d as o3d
import os
import numpy as np
import glob
import json
import pickle
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


def post_process_annotation(recon_dir, output_dir):
    """Add the annotation to the reconstruction"""
    # load axis-alignment
    axis_alignment = np.loadtxt(os.path.join(recon_dir, "rough_axis_alignment.txt"))
    # load the pcd model and the bbox file
    pcd = o3d.io.read_point_cloud(os.path.join(recon_dir, "recon.pcd"))
    pcd.transform(axis_alignment)
    bbox_list = []
    annotation_info_list = []
    for annotation in glob.glob(os.path.join(recon_dir, "*.json")):
        label_name = os.path.basename(annotation).split(".")[0]
        bbox_pos, bbox_scale, bbox_quat = parse_annotation(annotation)
        # parse world coord
        if label_name == "WCoordinates":
            transform_t = np.eye(4)
            transform_t[:3, 3] = bbox_pos
            transform_r = np.eye(4)
            bbox_quat_scipy = np.array([bbox_quat[1], bbox_quat[2], bbox_quat[3], bbox_quat[0]])
            transform_r[:3, :3] = R.from_quat(bbox_quat_scipy).as_matrix()
            transform = transform_t @ transform_r
            # final axis alignment
            final_axis_alignment = transform @ axis_alignment
            np.savetxt(os.path.join(recon_dir, "axis_alignment.txt"), final_axis_alignment)
            continue
        annotation_info = {}
        # compute bbox in raw pcd coord
        bbox_rot = o3d.geometry.get_rotation_matrix_from_quaternion(bbox_quat)
        # create a unit open3d bbox
        bbox = o3d.geometry.OrientedBoundingBox(center=bbox_pos, extent=bbox_scale, R=bbox_rot)
        # send color to bright green
        bbox.color = (0, 1, 0)
        bbox_list.append(bbox)
        # get pt indices in the bbox
        bbox_pt_indices = bbox.get_point_indices_within_bounding_box(pcd.points)
        annotation_info["top5_vocabs"] = [label_name]
        annotation_info["pt_indices"] = bbox_pt_indices
        annotation_info["feature"] = None
        annotation_info_list.append(annotation_info)
        # copy all json file
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        os.system(f"cp {annotation} {output_dir}")
    
    # save the annotation info
    with open(os.path.join(recon_dir, "annotation_info.pkl"), "wb") as f:
        pickle.dump(annotation_info_list, f)

    # visualize all
    origin = o3d.geometry.TriangleMesh.create_coordinate_frame(size=1.0, origin=[0, 0, 0])
    o3d.visualization.draw_geometries([pcd, *bbox_list, origin])


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
    # load annotation info
    with open(os.path.join(recon_dir, "annotation_info.pkl"), "rb") as f:
        annotation_info_list = pickle.load(f)
    # color random color to different annotation
    pcd_colors = np.asarray(pcd.colors)
    for annotation_info in annotation_info_list:
        indices_3d = annotation_info["pt_indices"]
        color = np.random.rand(3)
        pcd_colors[indices_3d] = color
    origin = o3d.geometry.TriangleMesh.create_coordinate_frame(size=1.0, origin=[0, 0, 0])
    o3d.visualization.draw_geometries([pcd, origin])

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
        post_process_annotation(scene, os.path.join(args.output_dir, os.path.basename(scene)))
        check_annotation(scene)
