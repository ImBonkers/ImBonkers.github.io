
$(document).ready(function(){
    // div.append(document.createElement("img"))

    $.getJSON("https://ddragon.leagueoflegends.com/api/versions.json", function(lol_version){
        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/champion.json", function(champion_data) {
            var select = document.getElementById("ChampionSelect")
            select.className = "champion_selector"
            select.name = "state"

            $.each(champion_data["data"], function() {
                addItemToSelect(select, this.id)
            });
            
            $('.champion_selector').select2();
            $(".champion_selector").change(function(){
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