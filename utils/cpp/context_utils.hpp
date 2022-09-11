// Created by Haonan Chang, 1/11/2022
// A lot of (A few) different format models are provided here
#pragma once
#include <boost/filesystem.hpp>
#include <Eigen/Eigen>
// Json related
#include <nlohmann/json.hpp>
using json = nlohmann::json;
// Yaml related
#include <yaml-cpp/yaml.h>


namespace Easy3DViewer {

    // Name related
    enum FileType {
        color_img_file,
        depth_img_file,
        point_cloud_file
    };

    boost::filesystem::path FileNameVolumeDeform(
        const boost::filesystem::path& dir_path,
        size_t cam_idx, size_t frame_idx, FileType file_type) {
        //Construct the file_name
        char frame_idx_str[20];
        sprintf(frame_idx_str, "%06d", static_cast<int>(frame_idx));
        char cam_idx_str[20];
        sprintf(cam_idx_str, "%02d", static_cast<int>(cam_idx));
        std::string file_name = "cam-" + std::string(cam_idx_str);
        file_name += "/frame-" + std::string(frame_idx_str);
        switch (file_type)
        {
        case color_img_file:
            file_name += ".color.png";
            break;
        case depth_img_file:
            file_name += ".depth.png";
            break;
        case point_cloud_file:
            file_name += ".pcd";
            break;
        default:
            printf("File type is not supported.\n");
            assert(false);
            break;
        }

        //Construct the path
        boost::filesystem::path file_path = dir_path / boost::filesystem::path(file_name);
        return file_path;
    }

    boost::filesystem::path FileNameVolumeDeform(
        const std::string& dir_path_str,
        size_t cam_idx, size_t frame_idx, FileType file_type) {
        return FileNameVolumeDeform(
            boost::filesystem::path(dir_path_str),
            cam_idx, frame_idx, file_type
        );
    }

    
    // Matrix related
    template<typename T, unsigned m, unsigned n>
    Eigen::Matrix<T, m, n> ParseMatrix(const YAML::Node& matrix_node) {
        Eigen::Matrix<T, m, n> output_matrix;
        for (auto i = 0; i < m; ++i) {
            for (auto j = 0;  j < n; ++j) {
                output_matrix[i][j] = matrix_node[i][j].as<T>();
            }
        }
        return output_matrix;
    }

    template<typename T, unsigned m, unsigned n>
    Eigen::Matrix<T, m, n> ParseMatrix(const json& matrix_json) {
        Eigen::Matrix<T, m, n> output_matrix;
        for (auto i = 0; i < m; ++i) {
            for (auto j = 0;  j < n; ++j) {
                output_matrix[i][j] = matrix_json[i][j].get<T>();
            }
        }
        return output_matrix;
    }

    template<typename T, unsigned m, unsigned n>
    void WriteMatrix(const Eigen::Matrix<T, m, n>& matrix, YAML::Node& matrix_node) {
        for (auto i = 0; i < m; ++i) {
            for (auto j = 0;  j < n; ++j) {
                matrix_node[i][j] = matrix(i, j);
            }
        }
    }

    template<typename T, unsigned m, unsigned n>
    void WriteMatrix(const Eigen::Matrix<T, m, n>& matrix, json& matrix_json) {
        for (auto i = 0; i < m; ++i) {
            for (auto j = 0;  j < n; ++j) {
                matrix_json[i][j] = matrix(i, j);
            }
        }
    }

    // Camera-related
    struct RGBDCamera {
        std::vector<double> intrinsic;     // (fx, fy, cx, cy)
        Eigen::Matrix4d extrinsic;
        std::vector<unsigned> resolution;        // width, height
        std::vector<double> clip;           // near, far
        double downsample_scale = 1.0;
        bool depth_flip = false;
    };

}