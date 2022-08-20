$(document).ready(function(){
    
    var skill_data = {}
    var skill_dropdown, level_dial, next_level_xp_dial, desired_level_dial, total_xp_needed

    skill_dropdown = document.getElementById("levelable-selector");
    skill_dropdown.addEventListener("change", function(event){
        update_values(skill_data, skill_dropdown.value);
    });

    level_dial = document.getElementById("level_dial");
    level_dial.addEventListener("change", function(event){
        update_values(skill_data, skill_dropdown.value);
    });

    next_level_xp_dial = document.getElementById("next_level_xp_dial");
    next_level_xp_dial.addEventListener("change", function(event){
        update_values(skill_data, skill_dropdown.value);
    });

    desired_level_dial = document.getElementById("desired_level_dial");
    desired_level_dial.addEventListener("change", function(event){
        update_values(skill_data, skill_dropdown.value);
    });

    total_xp_needed = document.getElementById("total_xp_needed");
    total_xp_needed.addEventListener("change", function(event){
        update_values(skill_data, skill_dropdown.value);
    });

    $.getJSON("data/level_data.json", function(data) {
        skill_data = data;
        Object.keys(data).forEach(function(key) {
            option = document.createElement("option");
            option.name = key;
            option.text = key;
            skill_dropdown.add(option);
        });
    });
});

function toInt(str){
    return parseInt(str.replace(",", ""));
}

function update_values(data, skill){
    var level = level_dial.value;
    var xp_for_cur_level = calculate_needed_xp(data[skill], level);
    var additional_xp = calculate_needed_xp_next(data[skill], (toInt(level) + 1).toString()) - toInt(next_level_xp_dial.value);
    var xp_for_desired_level = calculate_needed_xp(data[skill], desired_level_dial.value);
    console.log("xp_for_cur_level", xp_for_cur_level);
    console.log("additional_xp", additional_xp);
    console.log("xp_for_desired_level", xp_for_desired_level);
    total_xp_needed.value = xp_for_desired_level - (xp_for_cur_level - additional_xp);
}

function calculate_needed_xp_next(xp_table, level){
    return toInt(xp_table[level]["xp"]);
}

function calculate_needed_xp(xp_table, level){
    return toInt(xp_table[level]["total_xp"]);
}