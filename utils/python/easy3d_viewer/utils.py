import open3d as o3d
import cv2
import numpy as np


def get_masked_pcd(color_image, depth_image, seg_image, intrinsics, kernel_size=8):
    """Get masked point cloud; with a mask fine-tuned by erosion and depth image"""
    depth_cut_scale = 1.5
    # erosion
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    seg_image = cv2.erode(seg_image, kernel, iterations=1)
    # get the depth mask
    masked_depth = np.array(depth_image)
    masked_depth[np.array(seg_image) == 0] = 0
    # filter out outliers
    masked_depth_min = masked_depth[masked_depth > 0].min()
    masked_depth[masked_depth > (depth_cut_scale * masked_depth_min)] = 0
    # masked pcd
    masked_rgbd_image = o3d.geometry.RGBDImage.create_from_color_and_depth(
        o3d.geometry.Image(color_image), o3d.geometry.Image(masked_depth), depth_scale=1000.0, depth_trunc=1000.0, convert_rgb_to_intensity=False
    )
    masked_color_pcd = o3d.geometry.PointCloud.create_from_rgbd_image(masked_rgbd_image, intrinsics)
    return masked_color_pcd