""" Generate default config.json based on 
"""
import json
import os

if __name__ == "__main__":
    config_json = dict()
    data_dir = "test_data"
    repository_name = "http://localhost:8000"

    config_json["repository_name"] = repository_name
    config_json["default_data_folder"] = f"/{data_dir}"
    config_json["data"] = list()

    for dir_name in os.listdir(os.path.join("public", data_dir)):
        canvas_json = dict()
        canvas_json["source_directory"] = f"/{data_dir}"
        canvas_json["name"] = dir_name
        canvas_json["title"] = dir_name   
        canvas_json["folder_name"] = dir_name   
        canvas_json["frames"] = os.listdir(os.path.join("public", data_dir, dir_name))
        config_json["data"].append(canvas_json)

    with open("config.json", "w") as f:
        json.dump(config_json, f)