""" 
Created by Haonan Chang, 09/21/2022
Generate a video from a sequence of images
"""
import os
import sys
import shutil

def format_images(images_path, padding_to_end=0):
    # 1. Info
    print(f"Renaming images in {images_path}")

    # 2. Rename
    num_frames = 0
    for i, file_name in enumerate(sorted(os.listdir(images_path))):
        if file_name.endswith(".png"):
            os.rename(os.path.join(images_path, file_name), os.path.join(images_path, f"{i:06d}.png"))
            num_frames += 1

    # 3. Padding, copy the last frame for x times
    if padding_to_end > 0:
        for i in range(padding_to_end):
            shutil.copyfile(os.path.join(images_path, f"{num_frames-1:06d}.png"), os.path.join(images_path, f"{num_frames+i:06d}.png"))

def generate_video_from_images(ffmpeg_path, images_path, output_path, fps=30):
    # 1. Info
    print(f"Generating video from images in {images_path} to {output_path} with fps {fps}")

    # 2. Generate video
    if os.name == "nt":
        if sys.platform == "win32":  # Windows
            ffmpeg_exe = os.path.join(ffmpeg_path, "ffmpeg.exe")
            os.system(f"{ffmpeg_exe} -r {fps} -f image2 -s 640x480 -i {images_path}/%06d.png -vcodec libx264 -crf 25  -pix_fmt yuv420p {output_path}")
            # os.system(f"{ffmpeg_exe} -r {fps} -i {images_path}/%06d.png {output_path}")
    else:
        print("platform is not supported yet.")