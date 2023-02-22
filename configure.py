""" Generate default config.json based on 
"""
from genericpath import isdir
import json
import os
import argparse

if __name__ == "__main__":
    # 1. Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--data_dir", type=str, default="test_data", help="data directory")
    parser.add_argument("-r", "--repository_name", type=str, default="http://localhost:8800", help="directory to publish")
    args = parser.parse_args()

    # 2. Generate config.json
    config_json = dict()
    data_dir = args.data_dir
    repository_name = args.repository_name

    config_json["repository_name"] = repository_name
    config_json["default_data_folder"] = f"/{data_dir}"
    config_json["data"] = list()

    for dir_name in sorted(os.listdir(os.path.join("public", data_dir))):
        if os.path.isdir(os.path.join("public", data_dir, dir_name)):
            canvas_json = dict()
            canvas_json["source_directory"] = f"/{data_dir}"
            canvas_json["name"] = dir_name
            canvas_json["title"] = dir_name   
            canvas_json["folder_name"] = dir_name
            frame_list = list()
            for file_name in os.listdir(os.path.join("public", data_dir, dir_name)):
                if file_name.startswith("frame"):
                    frame_list.append(file_name)
            canvas_json["frames"] = sorted(frame_list)
            config_json["data"].append(canvas_json)

    with open("config.json", "w") as f:
        json.dump(config_json, f)