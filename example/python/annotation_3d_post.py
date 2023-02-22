import open3d as o3d
import os
import numpy as np
import glob
import json


def post_process_annotation(recon_dir):
    # load the pcd model and the bbox file
    pcd = o3d.io.read_point_cloud(os.path.join(recon_dir, "recon.pcd"))
    bbox_list = []
    for annotation in glob.glob(os.path.join(recon_dir, "*.json")):
        label_name = os.path.basename(annotation).split(".")[0]
        label_annotation = json.load(open(annotation))
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
        bbox_rot = o3d.geometry.get_rotation_matrix_from_quaternion(bbox_quat)
        # create a unit open3d bbox
        bbox = o3d.geometry.OrientedBoundingBox(center=bbox_pos, extent=bbox_scale, R=bbox_rot)
        # send color to bright green
        bbox.color = (0, 1, 0)
        bbox_list.append(bbox)
        pcd_seg = pcd.crop(bbox)
        # save the segmented pcd
        o3d.io.write_point_cloud(os.path.join(recon_dir, f"{label_name}.pcd"), pcd_seg)

    # visualize all
    origin = o3d.geometry.TriangleMesh.create_coordinate_frame(size=1.0, origin=[0, 0, 0])
    o3d.visualization.draw_geometries([pcd, *bbox_list, origin])


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="3D annotation example")
    parser.add_argument(
        "--data_root",
        type=str,
        default=".",
        help="The directory to save the annotation data",
    )
    args = parser.parse_args()

    for scene in glob.glob(os.path.join(args.data_root, "*")):
        if not os.path.isdir(scene):
            continue
        print("Processing {}".format(scene))
        post_process_annotation(os.path.join(scene, "recon"))
