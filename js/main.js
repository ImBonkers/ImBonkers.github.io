
let global_item_data = Object
let global_champion_data = Object
let global_version = Object
let global_item_name_to_id = Object
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
        global_version = {...lol_version}

        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/champion.json", function(champion_data) {
            var select = document.getElementById("ChampionSelect")
            select.name = "state"

            global_champion_data = {...champion_data}

            $.each(global_champion_data["data"], function() {
                addItemToSelect(select, this.id)
            })
            
            $("#ChampionSelect").select2();
            $("#ChampionSelect").change(function(){
                updateStats(global_champion_data["data"][this.value])
                updateIcons("champion", "BASE", this.value + ".png")
            })
            $("#LevelSlider").change(function(){
                document.getElementById("LevelLabel").innerHTML = "Level: " + this.value

                champion_name = document.getElementById("ChampionSelect").value
                updateStats(global_champion_data["data"][champion_name])
            })
        })
        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/item.json", function(item_data) {

            for(var k = 1; k <= 6; k++){
                let itemSelectID = "Item" + k;
                var item = document.getElementById(itemSelectID)
                global_item_data = {...item_data}
                console.log(item_data)
                var i = 0
                $.each(global_item_data["data"], function(){
                    addItemToSelect(item, this.name)
                    console.log(this.image.full.substring(0, this.image.full.length - 4))
                    global_item_name_to_id[this.name] = this.image.full.substring(0, this.image.full.length - 4)
                })

                $("#Item" + k).select2();
                $("#Item" + k).change(function(){
                    let myItem = global_item_data["data"][global_item_name_to_id[this.value]]
                    updateItemStats(itemSelectID.toUpperCase(), myItem)
                    updateIcons("item", itemSelectID, myItem.image.full)
                })
            }
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
    if(value != null)
        document.getElementById(name).innerHTML = value.toFixed(3)
    else
        document.getElementById(name).innerHTML = ""
}

function updateStats(champion)
{
    cstats = champion["stats"]
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


function updateItemStats(bonusType, item)
{
    console.log("HP_" + bonusType)
    stats = item["stats"]

    setTableValue("HP_" + bonusType , stats["FlatHPPoolMod"])
    setTableValue("HPReg_" + bonusType, null)
    setTableValue("Mana_" + bonusType, stats["FlatMPPoolMod"])
    setTableValue("ManaReg_" + bonusType, null)
    setTableValue("AD_" + bonusType, stats["FlatPhysicalDamageMod"])
    setTableValue("AP_" + bonusType, stats["FlatMagicDamageMod"])
    setTableValue("AS_" + bonusType, stats["PercentAttackSpeedMod"])
    setTableValue("LifeSteal_" + bonusType, stats["fdasfdsafdsa"])
    setTableValue("Spellvamp_" + bonusType, stats["fdsafdsafdsa"])
    setTableValue("Omnivamp_" + bonusType, stats["fdsafdsafdsafdsa"])
    setTableValue("Armor_" + bonusType, stats["FlatArmorMod"])
    setTableValue("MR_" + bonusType, stats["FlatSpellBlockMod"])
    setTableValue("MS_" + bonusType, stats["FlatMoveSpeedMod"])
    setTableValue("Crit_" + bonusType, stats["FlatCritChanceMod"])
    setTableValue("Range_" + bonusType, null)
    setTableValue("CharacterRadius_" + bonusType, null)
    setTableValue("AttackRadius_" + bonusType, null)
}

function updateIcons(type, target, name)
{
    document.getElementById("Img_" + target.toUpperCase()).src = "https://ddragon.leagueoflegends.com/cdn/"+global_version[0]+"/img/" + type + "/" + name
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