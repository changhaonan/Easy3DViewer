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
	*	IT: int type, e.g. int, unsigned int, unsigned short
	*	FT: float type, e.g. float, double, half
	* params:
	*	vertices: (x0, y0, z0, x1, y1, z1,....)
	*/
	template<unsigned k, typename IT, typename FT>
	void SaveGraph(
		const size_t graph_size,
		const FT* vertices,
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
}