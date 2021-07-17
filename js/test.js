
champion_data = Object

$(document).ready(function(){
    // div.append(document.createElement("img"))

    createRowElements(document.getElementById("HP"), "hp")
    createRowElements(document.getElementById("HPReg"), "hp")
    createRowElements(document.getElementById("Mana"), "mana")
    createRowElements(document.getElementById("ManaReg"), "mana")
    createRowElements(document.getElementById("AD"), "ad")
    createRowElements(document.getElementById("AP"), "ap")
    createRowElements(document.getElementById("Armor"), "armor")
    createRowElements(document.getElementById("MR"), "mr")
    createRowElements(document.getElementById("MS"), "ms")
    createRowElements(document.getElementById("Crit"), "crit")
    createRowElements(document.getElementById("Range"), "range")
    createRowElements(document.getElementById("CharacterRadius"), "characterradius")
    createRowElements(document.getElementById("AttackRadius"), "attackradius")

    $.getJSON("https://ddragon.leagueoflegends.com/api/versions.json", function(lol_version){
        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/champion.json", function(champion_data) {
            var select = document.getElementById("ChampionSelect")
            select.name = "state"

            $.each(champion_data["data"], function() {
                addItemToSelect(select, this.id)
            })
            
            $('#ChampionSelect').select2();
            $("#ChampionSelect").change(function(){
                UpdateStats(champion_data)
            })
        })
    })
})

function createRowElements(row, className, Prefix)
{
    function createRowElement(className, id)
    {
        var td = document.createElement("td")
        td.id = id
        td.className = className
        td.innerHTML = 0
        return td
    }
    row.appendChild(createRowElement(className, row.id+"_STAT"))
    row.appendChild(createRowElement(className, row.id+"_BASE"))
    row.appendChild(createRowElement(className, row.id+"_ITEM1"))
    row.appendChild(createRowElement(className, row.id+"_ITEM2"))
    row.appendChild(createRowElement(className, row.id+"_ITEM3"))
    row.appendChild(createRowElement(className, row.id+"_ITEM4"))
    row.appendChild(createRowElement(className, row.id+"_ITEM5"))
    row.appendChild(createRowElement(className, row.id+"_ITEM6"))
    row.appendChild(createRowElement(className, row.id+"_TRINKET"))
    row.appendChild(createRowElement(className, row.id+"_PASSIVE"))
    row.appendChild(createRowElement(className, row.id+"_Q"))
    row.appendChild(createRowElement(className, row.id+"_W"))
    row.appendChild(createRowElement(className, row.id+"_E"))
    row.appendChild(createRowElement(className, row.id+"_R"))
    row.appendChild(createRowElement(className, row.id+"_KEYSTONE"))
    row.appendChild(createRowElement(className, row.id+"_PRIMARYRUNE1"))
    row.appendChild(createRowElement(className, row.id+"_PRIMARYRUNE2"))
    row.appendChild(createRowElement(className, row.id+"_PRIMARYRUNE3"))
    row.appendChild(createRowElement(className, row.id+"_SECONDARYRUNE1"))
    row.appendChild(createRowElement(className, row.id+"_SECONDARYRUNE2"))
    row.appendChild(createRowElement(className, row.id+"_GAMEMODE"))
    row.appendChild(createRowElement(className, row.id+"_MISC"))
}

function UpdateStats(champion_data)
{
    champion_stats = champion_data["data"][this.value]["stats"]
    champion_level = document.getElementById("LevelSlider").value

    document.getElementById("HP_STAT").innerHTML = champion_stats["hp"]
    document.getElementById("HPReg_STAT").innerHTML = champion_stats["hpregen"]
    document.getElementById("Mana_STAT").innerHTML = champion_stats["mp"]
    document.getElementById("ManaReg_STAT").innerHTML = champion_stats["mpregen"]
    document.getElementById("AD_STAT").innerHTML = champion_stats["attackdamage"]
    document.getElementById("AP_STAT").innerHTML = 0
    document.getElementById("Armor_STAT").innerHTML = champion_stats["armor"]
    document.getElementById("MR_STAT").innerHTML = champion_stats["spellblock"]
    document.getElementById("MS_STAT").innerHTML = champion_stats["movespeed"]
    document.getElementById("Crit_STAT").innerHTML = champion_stats["crit"]
    document.getElementById("Range_STAT").innerHTML = champion_stats["attackrange"]
    document.getElementById("CharacterRadius_STAT").innerHTML = 0
    document.getElementById("AttackRadius_STAT").innerHTML = 0
}

function addItemToSelect(parent, name)
{
    var tmp = document.createElement("option")
    tmp.innerHTML = name
    parent.appendChild(tmp)
}