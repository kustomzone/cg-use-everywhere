import { app } from "../../scripts/app.js";
import { is_UEnode } from "./use_everywhere_utilities.js";


function _convert_to_links(ue) {
    const output_node_id = ue.output[0];
    const output_index = ue.output[1];
    const output_node = app.graph._nodes_by_id[output_node_id];
    ue.sending_to.forEach((st) => {
        const input_node_id = st.node.id;
        const input_node = app.graph._nodes_by_id[input_node_id];
        const input_index = st.input_index;
        output_node.connect(output_index, input_node, input_index);
    });
}

function convert_to_links(ues, control_node_id) {
    ues.ues.forEach((ue)=> {
        if (control_node_id==-1 || ue.controller.id == control_node_id) _convert_to_links(ue);
    });
}

function remove_all_ues() {
    app.graph._nodes.forEach((node)=>{
        if (is_UEnode(node)) app.graph.remove(node)
    });
}

export {convert_to_links, remove_all_ues}