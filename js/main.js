
let global_champion_data = Object
let global_version = Object
let global_col_keys = [
    "TOTAL", "BASE", "ITEM1", "ITEM2", "ITEM3", "ITEM4", "ITEM5", "ITEM6",
    "TRINKET", "PASSIVE", "Q", "W", "E", "R", 
    "KEYSTONE", "PRIMARYRUNE1", "PRIMARYRUNE2", "PRIMARYRUNE3",
    "SECONDARYRUNE1", "SECONDARYRUNE2",
    "GAMEMODE", "MISC"]
let global_stat_names = [
    "HP", "HPReg", "Mana", "ManaReg", "AD", "AP", "AS",
    "LifeSteal", "Spellvamp", "Omnivamp", "Armor", "MR",
    "MS", "Crit", "Range", "CharacterRadius", "AttackRadius"]

$(document).ready(function(){
    
    global_stat_names.forEach(key => {
        createRowElements(document.getElementById(key), key.toLowerCase()) 
    });
    createRowHeader(document.getElementById("StatTableHeader"))
    document.getElementById("LevelSlider").value = 1

    $.getJSON("https://ddragon.leagueoflegends.com/api/versions.json", function(lol_version){
        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/champion.json", function(champion_data) {
            var select = document.getElementById("ChampionSelect")
            select.name = "state"

            global_champion_data = {...champion_data}
            global_version = {...lol_version}

            $.each(global_champion_data["data"], function() {
                addItemToSelect(select, this.id)
            })
            
            $("#ChampionSelect").select2();
            $("#ChampionSelect").change(function(){
                updateStats(this.value)
                updateIcons(this.value)
            })
            $("#LevelSlider").change(function(){
                document.getElementById("LevelLabel").innerHTML = "Level: " + this.value

                champion_name = document.getElementById("ChampionSelect").value
                updateStats(champion_name)
            })
        })
    })
})

function createRowHeader(header)
{
    function createHeaderElement(id)
    {
        th = document.createElement("th")
        img = document.createElement("img")
        img.src = "resources/placeholder.jpg"
        img.width = 20;
        img.height = 20;
        img.id = id;
        th.appendChild(img)
        return th
    }

    for (let i = 1; i < global_col_keys.length; i++) {
        header.appendChild(createHeaderElement("Img"+"_"+global_col_keys[i]))
    }
}

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

    global_col_keys.forEach(key => {
        row.appendChild(createRowElement(className, row.id+"_"+key))
    });
}

function setTableValue(name, value)
{
    document.getElementById(name).innerHTML = value.toFixed(3)
}

function updateStats(champion_name)
{
    cstats = global_champion_data["data"][champion_name]["stats"]
    clevel = document.getElementById("LevelSlider").value

    setTableValue("HP_BASE", statisticalGrowth(cstats["hp"], cstats["hpperlevel"], clevel))
    setTableValue("HPReg_BASE",statisticalGrowth(cstats["hpregen"], cstats["hpregenperlevel"], clevel))
    setTableValue("Mana_BASE", statisticalGrowth(cstats["mp"], cstats["mpperlevel"], clevel))
    setTableValue("ManaReg_BASE", statisticalGrowth(cstats["mpregen"], cstats["mpregenperlevel"], clevel))
    setTableValue("AD_BASE", statisticalGrowth(cstats["attackdamage"], cstats["attackdamageperlevel"], clevel))
    setTableValue("AP_BASE", 0)
    setTableValue("AS_BASE", calculateAttackSpeed(cstats["attackspeed"], cstats["attackspeedperlevel"], clevel, 0))
    setTableValue("LifeSteal_BASE", 0)
    setTableValue("Spellvamp_BASE", 0)
    setTableValue("Omnivamp_BASE", 0)
    setTableValue("Armor_BASE", statisticalGrowth(cstats["armor"], cstats["armorperlevel"], clevel))
    setTableValue("MR_BASE", statisticalGrowth(cstats["spellblock"], cstats["spellblockperlevel"], clevel))
    setTableValue("MS_BASE", cstats["movespeed"])
    setTableValue("Crit_BASE", cstats["crit"])
    setTableValue("Range_BASE", cstats["attackrange"])
    setTableValue("CharacterRadius_BASE", 0)
    setTableValue("AttackRadius_BASE", 0)
}

function updateIcons(champion_name)
{
    document.getElementById("Img_BASE").src = "https://ddragon.leagueoflegends.com/cdn/"+global_version[0]+"/img/champion/"+champion_name+".png"
}

function addItemToSelect(parent, name)
{
    var tmp = document.createElement("option")
    tmp.innerHTML = name
    parent.appendChild(tmp)
}

function statisticalGrowth(b, g, l)
{
    return b + (g * (l-1)) * (0.7025+(0.0175*(l-1)))
}

function calculateAttackSpeed(b, g, l, bonus)
{
    return b * (1+(statisticalGrowth(0, g, l) + bonus)/100)
}