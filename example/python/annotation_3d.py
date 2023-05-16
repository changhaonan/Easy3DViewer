""" This is an example of how to use Easy3DViewer to do 3D annotations.
"""

import os
import easy3d_viewer as ev
import numpy as np
import shutil
import open3d as o3d


def estimate_floor(recon_dir):
    """Estimate the floor plane of the scene using RANSAC."""
    recon_file = os.path.join(recon_dir, "recon.pcd")
    # Load Point cloud data
    pcd = o3d.io.read_point_cloud(recon_file)
    origin = o3d.geometry.TriangleMesh.create_coordinate_frame(size=0.5)

    # Segment the largest plane using RANSAC
    plane_model, inliers = pcd.segment_plane(distance_threshold=0.01,
                                            ransac_n=3,
                                            num_iterations=1000)
    [a, b, c, d] = plane_model
    print(f"Plane equation: {a:.2f}x + {b:.2f}y + {c:.2f}z + {d:.2f} = 0")

    # Create a point cloud for inliers (points that belong to the plane)
    inlier_cloud = pcd.select_by_index(inliers)
    inlier_cloud.paint_uniform_color([1.0, 0, 0]) # Paint the inliers in red

    # Create a point cloud for outliers (points that don't belong to the plane)
    outlier_cloud = pcd.select_by_index(inliers, invert=True)
    # Compute the centroid of the inlier points
    centroid = np.mean(np.asarray(inlier_cloud.points), axis=0)

    # Visualize inliers and outliers
    # o3d.visualization.draw_geometries([outlier_cloud, origin, inlier_cloud])

    # Compute the normal of the plane
    # The plane equation is ax + by + cz + d = 0
    # So, the normal of the plane is the vector [a, b, c]
    normal = np.array(plane_model[:3])
    # Make sure the normal is pointing downwards. If not, reverse it
    if normal[2] > 0:
        normal *= -1

    # Compute the rotation matrix using the plane normal
    z_axis = normal
    x_axis = np.array([1, 0, 0]) if np.allclose(normal, [0, 1, 0]) else np.cross([0, 1, 0], z_axis)
    x_axis = x_axis / np.linalg.norm(x_axis)
    y_axis = np.cross(z_axis, x_axis)
    rotation_matrix = np.column_stack([x_axis, y_axis, z_axis])

    # Transform the point cloud
    # pcd.translate(-centroid)
    # pcd.rotate(np.linalg.inv(rotation_matrix), center=(0, 0, 0))

    transform_t = np.eye(4, dtype=np.float32)
    transform_t[:3, 3] = -centroid
    transform_r = np.eye(4, dtype=np.float32)
    transform_r[:3, :3] = np.linalg.inv(rotation_matrix)
    transform = np.matmul(transform_r, transform_t)
    pcd.transform(transform)

    # Visualize the transformed point cloud and origin
    # o3d.visualization.draw_geometries([pcd, origin])
    return transform, pcd


def prepare_annotation(cam2world, pcd, save_dir):
    """Prepare the easy3d_viewer context for annotation."""
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
    o3d.io.write_point_cloud(context.at("recon"), pcd)

    # Add a refrerence coordinate
    context.addCoord("origin", scale=1.0)
    # Add the camera
    context.addCoord("camera", "camera", coordinate=cam2world)
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
        # Check plane
        cam2floor, pcd = estimate_floor(dir)
        print("Processing {}".format(dir))
        scene_name = "scene_" + os.path.basename(dir)
        prepare_annotation(cam2floor, pcd, os.path.join(args.output_dir, scene_name))
