/**
 * @file context.hpp
 * @author Haonan Chang (chnme40cs@gmail.com)
 * @brief
 * @version 0.1
 * @date 2021-06-30
 *
 * @copyright Copyright (c) 2021
 *
 */
#pragma once

#include <memory>
#include <string>
#include <iomanip> 
#include <stdexcept>
#include <fstream>
#include <iostream>
#include <boost/filesystem.hpp>
#include <Eigen/Eigen>

#include <nlohmann/json.hpp>
using json = nlohmann::json;

namespace Easy3DViewer {
    namespace utils {
        template<typename ... Args>
        std::string stringFormat(const std::string& format, Args ... args) {
            int size_s = std::snprintf(nullptr, 0, format.c_str(), args ...) + 1; // Extra space for '\0'
            if (size_s <= 0) { throw std::runtime_error("Error during formatting."); }
            auto size = static_cast<size_t>(size_s);
            auto buf = std::make_unique<char[]>(size);
            std::snprintf(buf.get(), size, format.c_str(), args ...);
            return std::string(buf.get(), buf.get() + size - 1); // We don't want the '\0' inside
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


    class Context {
    public:
        explicit Context() {};
        void setDir(
            const std::string& data_root_dir,
            const std::string& dir_prefix="",
            const std::string& dir_suffix="") {
            m_data_root_dir = data_root_dir;
            m_dir_prefix = dir_prefix;
            m_dir_suffix = dir_suffix;

            if (boost::filesystem::exists(m_data_root_dir)) {
                clearDir();
            }
            else {
                boost::filesystem::create_directories(m_data_root_dir);
            }
        }

    private:
        boost::filesystem::path m_data_root_dir;
        std::string m_dir_prefix;
        std::string m_dir_suffix;

    public:
        // Generate file path
        std::string at(const std::string& name) {
            if (m_context_info.contains(name)) {
                return currentFile(name).string();
            }
            else {
                std::cout << "Warning: " << name << " is not founded." << std::endl;
                return "";
            }
        }

        // Adding function
        void addPointCloud(const std::string& name, const std::string& control_name="",
            const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity(), const float size=0.5f, const std::string& normal_mode="vector") {
            json info_data;
            info_data["file_type"] = "pcd";
            info_data["file_name"] = (name + ".pcd");

            // Visualization part
            info_data["vis"]["section"] = "Point-Cloud";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "point";
            info_data["vis"]["gui"] = "check_box";
            info_data["vis"]["default"] = false;
            info_data["vis"]["intersectable"] = false;
            info_data["vis"]["coordinate"] = std::vector<float>(coordinate.data(), coordinate.data() + 16);
            info_data["vis"]["size"] = size;
            info_data["vis"]["normal_mode"] = normal_mode;
            addData(name, info_data);
        }

        void addPoly(const std::string& name, const std::string& control_name="",
            const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity()) {
            json info_data;
            info_data["file_type"] = "obj";
            info_data["file_name"] = (name + ".obj");

            // Visualization part
            info_data["vis"]["section"] = "Polygon";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "polygon";
            info_data["vis"]["gui"] = "check_box";
            info_data["vis"]["default"] = false;
            info_data["vis"]["intersectable"] = false;
            info_data["vis"]["coordinate"] = std::vector<float>(coordinate.data(), coordinate.data() + 16);
            addData(name, info_data);
        }

        void addGraph(const std::string& name, const std::string& control_name="",
            const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity(), const float size = 1.f, 
            const float min_val=0.f, const float max_val=1.f,  const bool id_visible=false,
            const float normal_len = 1.f, const std::string& color_code="") {
            json info_data;
            info_data["file_type"] = "json";
            info_data["file_name"] = (name + ".json");

            // Visualization part
            info_data["vis"]["section"] = "Graph";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "graph";
            info_data["vis"]["gui"] = "check_box";
            info_data["vis"]["default"] = false;
            info_data["vis"]["intersectable"] = false;
            info_data["vis"]["coordinate"] = std::vector<float>(coordinate.data(), coordinate.data() + 16);
            info_data["vis"]["size"] = size;
            info_data["vis"]["normal_len"] = normal_len;
            info_data["vis"]["min_val"] = min_val;
            info_data["vis"]["max_val"] = max_val;
            info_data["vis"]["id_visible"] = id_visible;
            info_data["vis"]["color_code"] = color_code;
            addData(name, info_data);
        }

        void addImage(const std::string& name, const std::string& control_name="") {
            json info_data;
            info_data["file_type"] = "png";
            info_data["file_name"] = (name + ".png");

            // Visualization part
            info_data["vis"]["section"] = "Figure";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "figure";
            info_data["vis"]["gui"] = "check_box";
            info_data["vis"]["default"] = false;
            addData(name, info_data);
        }

        void addCamera(const std::string& name, const std::string& control_name = "", 
            const Eigen::Matrix4f& coordinate = Eigen::Matrix4f::Identity()) {
            json info_data;
            // Visualization part
            info_data["vis"]["section"] = "Camera";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "camera";
            info_data["vis"]["gui"] = "button";
            info_data["vis"]["coordinate"] = std::vector<float>(coordinate.data(), coordinate.data() + 16);
            info_data["vis"]["default"] = false;
            addData(name, info_data);
        }

        void addRGBDCamera(const std::string& name, const std::string& control_name, const RGBDCamera& camera) {
            json info_data;
            // Data part (camera needs higher accuracy)
            info_data["extrinsic"] = std::vector<double>{ camera.extrinsic.data(), camera.extrinsic.data() + 16 };
            info_data["intrinsic"] = camera.intrinsic;
            info_data["image_cols"] = camera.resolution[0];
            info_data["image_rows"] = camera.resolution[1];
            info_data["clip_near"] = camera.clip[0];
            info_data["clip_far"] = camera.clip[1];
            info_data["depth_flip"] = camera.depth_flip;
            info_data["downsample_scale"] = camera.downsample_scale;

            // Visualization part
            info_data["vis"]["section"] = "Camera";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "camera";
            info_data["vis"]["gui"] = "button";
            info_data["vis"]["coordinate"] = std::vector<double>{ camera.extrinsic.data(), camera.extrinsic.data() + 16 };
            info_data["vis"]["default"] = false;
            addData(name, info_data);
        }

        void addStats(const std::string& name, const float val) {
            if (m_context_info.contains(name)) {  // add to end 
                m_context_info[name]["data"].push_back(val);
            }
            else {
                json info_data;
                info_data["file_type"] = "json";
                info_data["file_name"] = (name + ".json");
                info_data["data"] = std::vector<float>{ val };

                // Visualization part : powered by d3 [not avaliable now]
                addData(name, info_data);
            }
        }

        void addGeometry(const std::string& name, const std::string& control_name="", 
            const std::string& geometry_type="coord", const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity(),
            const float param_0=0.f, const float param_1=0.f, const float param_2=0.f) {

            json info_data;
            // Visulaization part
            info_data["vis"]["section"] = "Geometry";
            info_data["vis"]["control"] = (control_name.empty()) ? name : control_name;
            info_data["vis"]["mode"] = "geometry";
            info_data["vis"]["gui"] = "check_box";
            info_data["vis"]["default"] = false;
            info_data["vis"]["intersectable"] = false;
            info_data["vis"]["coordinate"] = std::vector<float>(coordinate.data(), coordinate.data() + 16);
            
            // Different according to geometry type
            info_data["vis"]["geometry"] = geometry_type;
            if (geometry_type == "coord") {
                info_data["vis"]["scale"] = param_0;
            }
            else if (geometry_type == "box") {
                info_data["vis"]["width"] = param_0;
                info_data["vis"]["height"] = param_1;
                info_data["vis"]["depth"] = param_2;
            }
            else if (geometry_type == "bounding_box") {
                info_data["vis"]["width"] = param_0;
                info_data["vis"]["height"] = param_1;
                info_data["vis"]["depth"] = param_2;
            }
            else if (geometry_type == "plane") {
                info_data["vis"]["width"] = param_0;
                info_data["vis"]["height"] = param_1;
            }

            addData(name, info_data);
        }

        void addCoord(const std::string& name, const std::string& control_name="",
            const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity(), const float scale=0.1f) {
            addGeometry(name, control_name, "coord", coordinate, scale);
        }

        // Box is centered at (0, 0, 0) of the coordinate
        void addBox(const std::string& name, const std::string& control_name="",
            const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity(), const float width=1.f,
            const float height=1.f, const float depth=1.f) {
            addGeometry(name, control_name, "box", coordinate, width, height, depth);
        }

        // Bounding Box is centered at (0, 0, 0) of the coordinate
        void addBoundingBox(const std::string& name, const std::string& control_name="",
            const Eigen::Matrix4f& coordinate=Eigen::Matrix4f::Identity(), const float width=1.f,
            const float height=1.f, const float depth=1.f) {
            addGeometry(name, control_name, "bounding_box", coordinate, width, height, depth);
        }
        
    private:
        void addData(const std::string& name, const json& info) {
            m_context_info[name] = info;
        }

        boost::filesystem::path currentFile(const std::string& name) {
            boost::filesystem::path data_dir = currentDir();
            std::string file_name;
            std::string file_type = m_context_info[name]["file_type"];
            file_name = name + "." + file_type;
            boost::filesystem::path file_path = data_dir / file_name;
            return file_path;
        }

        boost::filesystem::path currentDir() {
            std::string dir_name;
            if ((m_dir_prefix == "") && (m_dir_suffix == ""))
                dir_name = utils::stringFormat("%06d", m_id);
            else if (m_dir_prefix == "")
                dir_name = utils::stringFormat("%06d_%s", m_id, m_dir_suffix.c_str());
            else if (m_dir_suffix == "")
                dir_name = utils::stringFormat("%s_%06d", m_dir_prefix.c_str(), m_id);
            else
                dir_name = utils::stringFormat("%s_%06d_%s", m_dir_prefix.c_str(), m_id, m_dir_suffix.c_str());

            boost::filesystem::path rel_dir(dir_name);
            boost::filesystem::path data_dir = m_data_root_dir / rel_dir;
            return data_dir;
        }

        int m_id;
        json m_context_info;

    public:
        void open(const int id) {
            // Assign id
            m_id = id;
            // Clear info
            m_context_info.clear();
            // Check existence
            boost::filesystem::path current_dir;
            if (!boost::filesystem::exists(current_dir = currentDir())) {
                boost::filesystem::create_directories(current_dir);
            }
        }
        
        void clear() {
            m_context_info.clear();
        }

        void close(const bool enable_save=true, const bool enable_inc = false) {
            if (enable_save) save(enable_inc);
        }
        
        void saveTo(const std::string& path) {
            std::ofstream o(path);
            o << std::setw(4) << m_context_info << std::endl;
            o.close();
        }

        void clearDir() {
            for (boost::filesystem::directory_iterator end_dir_it, it(m_data_root_dir); it != end_dir_it; ++it) {
                boost::filesystem::remove_all(it->path());
            }
        }

    private:
        // TODO: add inc mode
        void save(const bool enable_inc) {
            std::string file_name = (currentDir() / "context.json").string();
            std::ofstream o(file_name);
            o << std::setw(4) << m_context_info << std::endl;
            o.close();
        }

    public:
        static Context& Instance() {
            static Context context;
            return context;
        }
    };

}