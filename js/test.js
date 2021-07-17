
$(document).ready(function(){
    h = document.getElementById("Title").innerHTML = "League Calculator"

    var body = document.body
    var div = document.createElement("div")
    div.id = "selector_id"
    body.appendChild(div)
    div.append(document.createElement("img"))

    $.getJSON("https://ddragon.leagueoflegends.com/api/versions.json", function(lol_version){
        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/champion.json", function(champion_data) {
            var select = document.createElement("select")
            select.className = "champion_selector"
            select.name = "state"

            $.each(champion_data["data"], function() {
                addItemToSelect(select, this.id)
            });

            var div = document.getElementById("selector_id")
            div.appendChild(select)
            
            $('.champion_selector').select2();
            $(".champion_selector").change(function(){
                document.getElementById("Title").innerHTML = this.value
                document.getElementById("Title")
            });
        });
    });
})

function addItemToSelect(parent, name)
{
    var tmp = document.createElement("option")
    tmp.innerHTML = name
    parent.appendChild(tmp)
}