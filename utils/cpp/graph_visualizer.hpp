/**
 * @file graph_visualizer.hpp
 * @author Haonan Chang (chnme40cs@gmail.com)
 * @brief
 * @version 0.1
 * @date 2022-04-15
 *
 * @copyright Copyright (c) 2022
 *
 */
#pragma once

#include <fstream>
#include <nlohmann/json.hpp>
using json = nlohmann::json;

namespace Easy3DViewer {
	/*
	* template:
	*	k: neighbor number 
	*	IT: int type, e.g. int, unsigned int, unsigned short, long
	*	FT: float type, e.g. float, double, half
	* params:
	*	vertices: (x0, y0, z0, x1, y1, z1,....)
	*/
	template<unsigned k, typename IT, typename FT>
	void SaveGraph(
		const size_t graph_size,
		const FT* vertices,
		const FT* normals,
		const IT* edges,
		const FT* edge_weights,
		const std::string& path
	) {
		json graph_json;

		// Vertex edge
		std::vector<std::vector<float>> vec_vertices;
		std::vector<std::vector<int>> vec_edges;
		for (auto i = 0; i < graph_size; ++i) {
			// vertex
			std::vector<float> v_coord{ 
				static_cast<float>(vertices[i * 3 + 0]),
				static_cast<float>(vertices[i * 3 + 1]),
				static_cast<float>(vertices[i * 3 + 2])};
			vec_vertices.push_back(v_coord);

			for (auto j = 0; j < k; ++j) {
				int id_e = static_cast<int>(edges[i * k + j]);
				if ((id_e >= 0) && (id_e < graph_size) && (id_e != i)) {
					std::vector<int> e_ind{ i, id_e };
					vec_edges.push_back(e_ind);
				}
			}
		}
		graph_json["vertices"] = vec_vertices;
		graph_json["edges"] = vec_edges;

		// Normals
		if (normals != nullptr) {
			std::vector<std::vector<float>> vec_normals;
			for (auto i = 0; i < graph_size; ++i) {
				std::vector<float> n_direction{
					static_cast<float>(normals[i * 3 + 0]),
					static_cast<float>(normals[i * 3 + 1]),
					static_cast<float>(normals[i * 3 + 2]) };
				vec_normals.push_back(n_direction);
			}
			graph_json["normals"] = vec_normals;
		}

		// Edege weight
		if (edge_weights != nullptr) {
			std::vector<float> vec_edge_weight;
			for (auto i = 0; i < graph_size; ++i) {
				for (auto j = 0; j < k; ++j) {
					int id_e = static_cast<int>(edges[i * k + j]);
					float w_e = static_cast<float>(edge_weights[i * k + j]);
					if ((id_e >= 0) && (id_e < graph_size) && (id_e != i)) {
						vec_edge_weight.push_back(w_e);
					}
				}
			}
			graph_json["weight_e"] = vec_edge_weight;
		}

		// Write out
		std::ofstream o(path);
		o << std::setw(4) << graph_json << std::endl;
		o.close();
	}

	/*
	* 
	* template:
	*	IT: int type, e.g. int, unsigned int, unsigned short, long
	*	FT: float type, e.g. float, double, half
	* params:
	*	vertices: (x0, y0, z0, x1, y1, z1,....)
	*/
	template<typename IT, typename FT>
	void SaveGraph(
		const size_t graph_size,
		const size_t graph_pair_size,
		const FT* vertices,
		const FT* normals,
		const IT* edge_pairs,
		const FT* edge_pairs_weight,
		const std::string& path
	) {
		json graph_json;

		// Vertex edge
		std::vector<std::vector<float>> vec_vertices;
		std::vector<std::vector<int>> vec_edges;
		for (auto i = 0; i < graph_size; ++i) {
			// vertex
			std::vector<float> v_coord{
				static_cast<float>(vertices[i * 3 + 0]),
				static_cast<float>(vertices[i * 3 + 1]),
				static_cast<float>(vertices[i * 3 + 2]) };
			vec_vertices.push_back(v_coord);
		}
		graph_json["vertices"] = vec_vertices;

		// Edge
		if (edge_pairs != nullptr) {
			for (auto i = 0; i < graph_pair_size; ++i) {
				int id_e_0 = static_cast<int>(edge_pairs[i * 2 + 0]);
				int id_e_1 = static_cast<int>(edge_pairs[i * 2 + 1]);
				std::vector<int> e_ind{ id_e_0, id_e_1 };
				vec_edges.push_back(e_ind);
			}
			graph_json["edges"] = vec_edges;
		}

		// Normals
		if (normals != nullptr) {
			std::vector<std::vector<float>> vec_normals;
			for (auto i = 0; i < graph_size; ++i) {
				std::vector<float> n_direction{
					static_cast<float>(normals[i * 3 + 0]),
					static_cast<float>(normals[i * 3 + 1]),
					static_cast<float>(normals[i * 3 + 2]) };
				vec_normals.push_back(n_direction);
			}
			graph_json["normals"] = vec_normals;
		}

		// Edege weight
		if (edge_pairs_weight != nullptr) {
			std::vector<float> vec_edge_weight;
			for (auto i = 0; i < graph_pair_size; ++i) {
				float w_e = static_cast<float>(edge_pairs_weight[i]);
				vec_edge_weight.push_back(w_e);
			}
			graph_json["weight_e"] = vec_edge_weight;
		}

		// Write out
		std::ofstream o(path);
		o << std::setw(4) << graph_json << std::endl;
		o.close();
	}
}