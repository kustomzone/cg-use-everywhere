import { app } from "../../scripts/app.js";
import { GraphAnalyser } from "./use_everywhere_graph_analysis.js";
import { LinkRenderController } from "./use_everywhere_ui.js";
import { convert_to_links, remove_all_ues } from "./use_everywhere_apply.js";

function main_menu_settings() {

    app.ui.settings.addSetting({
        id: "AE.details",
        name: "Anything Everywhere show node details",
        type: "boolean",
        defaultValue: false,
    });
    app.ui.settings.addSetting({
        id: "AE.autoprompt",
        name: "Anything Everywhere? autocomplete (may require page reload)",
        type: "boolean",
        defaultValue: true,
    });
    app.ui.settings.addSetting({
        id: "AE.checkloops",
        name: "Anything Everywhere check loops",
        type: "boolean",
        defaultValue: true,
    });
    app.ui.settings.addSetting({
        id: "AE.showlinks",
        name: "Anything Everywhere show links",
        type: "combo",
        options: [ {value:0, text:"All off"}, {value:1, text:"Selected nodes"}, {value:2, text:"Mouseover node"}, {value:3, text:"Selected and mouseover nodes"}, {value:4, text:"All on"}],
        defaultValue: 0,
    });      
    app.ui.settings.addSetting({
        id: "AE.animate",
        name: "Anything Everywhere animate UE links",
        type: "combo",
        options: [ {value:0, text:"Off"}, {value:1, text:"Dots"}, {value:2, text:"Pulse"}, {value:3, text:"Both"}, ],
        defaultValue: 3,
    });
    app.ui.settings.addSetting({
        id: "AE.highlight",
        name: "Anything Everywhere highlight connected nodes",
        type: "boolean",
        defaultValue: true,
    });
    app.ui.settings.addSetting({
        id: "AE.replacesearch",
        name: "Anything Everywhere replace search",
        type: "boolean",
        defaultValue: true,
    });
}

function submenu(properties, property, options, e, menu, node) {
    const current = properties[property] ? (properties[property]==2 ? 3 : 2 ) : 1; 
    const submenu = new LiteGraph.ContextMenu(
        options,
        { event: e, callback: inner_function, parentMenu: menu, node: node }
    );
    const current_element = submenu.root.querySelector(`:nth-child(${current})`);
    if (current_element) current_element.style.borderLeft = "2px solid #484";
    function inner_function(v) {
        if (node) {
            const choice = Object.values(options).indexOf(v);
            properties[property] = choice;
            LinkRenderController.instance().mark_link_list_outdated();
        }
    }
}

const GROUP_RESTRICTION_OPTIONS = ["No restrictions", "Send only within group", "Send only not within group"]
function group_restriction_submenu(value, options, e, menu, node) {
    submenu(node.properties, "group_restricted", GROUP_RESTRICTION_OPTIONS, e, menu, node);
}

const COLOR_RESTRICTION_OPTIONS = ["No restrictions", "Send only to same color", "Send only to different color"]
function color_restriction_submenu(value, options, e, menu, node) {
    submenu(node.properties, "color_restricted", COLOR_RESTRICTION_OPTIONS, e, menu, node);
}

function node_menu_settings(options, node) {
    options.push(null,
        {
            content: "Group Restrictions",
            has_submenu: true,
            callback: group_restriction_submenu,
        }, 
        {
            content: "Color Restrictions",
            has_submenu: true,
            callback: color_restriction_submenu,
        },
        {
            content: "Convert to real links",
            callback: async () => {
                const ues = await GraphAnalyser.instance().analyse_graph();
                convert_to_links(ues, node.id);
                app.graph.remove(node);
            }
        },
    null)
}

function canvas_menu_settings(options) {
    options.push(null); // divider
    options.push({
        content: (app.ui.settings.getSettingValue('AE.showlinks', 0)>0) ? "Hide UE links" : "Show UE links",
        callback: () => {
            const setTo = (app.ui.settings.getSettingValue('AE.showlinks', 0)>0) ? 0 : 4;
            app.ui.settings.setSettingValue('AE.showlinks', setTo);
        }
    },
    {
        content: "Convert all UEs to real links",
        callback: async () => {
            const ues = await GraphAnalyser.instance().analyse_graph();
            convert_to_links(ues, -1);
            remove_all_ues();
        }
    });
    if (GraphAnalyser.instance().ambiguity_messages.length) {
        options.push({
            content: "Show UE broadcast clashes",
            callback: async () => { 
                alert(GraphAnalyser.instance().ambiguity_messages.join("\n")) 
            }
        })
    }
    options.push(null); // divider
}

export { main_menu_settings, node_menu_settings, canvas_menu_settings }