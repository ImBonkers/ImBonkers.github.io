
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
let global_mult_scale_calc_exception_tabel = {
    "LifeSteal" : "AD",
}
var global_flat_calc_tabel = {}
var global_mult_calc_tabel = {}
var global_total_calc_tabel = {}

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
                updateIcons("spell", "Q", getRawIconName(this.value+"Q")+".png")
                updateIcons("spell", "W", getRawIconName(this.value+"W")+".png")
                updateIcons("spell", "E", getRawIconName(this.value+"E")+".png")
                updateIcons("spell", "R", getRawIconName(this.value+"R")+".png")
                calculateAllStats()
            })
            $("#LevelSlider").change(function(){
                document.getElementById("LevelLabel").innerHTML = "Level: " + this.value

                champion_name = document.getElementById("ChampionSelect").value
                updateStats(global_champion_data["data"][champion_name])
                calculateAllStats()
            })
        })
        $.getJSON("https://ddragon.leagueoflegends.com/cdn/"+lol_version[0]+"/data/en_US/item.json", function(item_data) {

            for(var k = 1; k <= 6; k++){
                let itemSelectID = "Item" + k;
                var item = document.getElementById(itemSelectID)
                global_item_data = {...item_data}
                $.each(global_item_data["data"], function(){
                    addItemToSelect(item, this.name)
                    global_item_name_to_id[this.name] = this.image.full.substring(0, this.image.full.length - 4)
                })

                $("#Item" + k).select2();
                $("#Item" + k).change(function(){
                    let myItem = global_item_data["data"][global_item_name_to_id[this.value]]
                    updateItemStats(itemSelectID.toUpperCase(), myItem)
                    updateIcons("item", itemSelectID, myItem.image.full)
                    calculateAllStats()
                    console.log(calculateAutoAttackDPS())
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
        img.width = 40;
        img.height = 40;
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

function getRawIconName(name)
{
    if (global_icon_name_override[name] === undefined)
        return name
    else
        return global_icon_name_override[name]
}

function updateStats(champion)
{
    cstats = champion["stats"]
    clevel = document.getElementById("LevelSlider").value
    
    global_flat_calc_tabel["HP_BASE"] = statisticalGrowth(cstats["hp"], cstats["hpperlevel"], clevel)
    global_flat_calc_tabel["HPReg_BASE" ] = statisticalGrowth(cstats["hpregen"], cstats["hpregenperlevel"], clevel)
    global_flat_calc_tabel["Mana_BASE" ] = statisticalGrowth(cstats["mp"], cstats["mpperlevel"], clevel)
    global_flat_calc_tabel["ManaReg_BASE" ] = statisticalGrowth(cstats["mpregen"], cstats["mpregenperlevel"], clevel)
    global_flat_calc_tabel["AD_BASE" ] = statisticalGrowth(cstats["attackdamage"], cstats["attackdamageperlevel"], clevel)
    global_flat_calc_tabel["AP_BASE" ] = 0
    global_flat_calc_tabel["AS_BASE" ] = cstats["attackspeed"]
    global_flat_calc_tabel["LifeSteal_BASE" ] = 0
    global_flat_calc_tabel["Spellvamp_BASE" ] = 0
    global_flat_calc_tabel["Omnivamp_BASE" ] = 0
    global_flat_calc_tabel["Armor_BASE" ] = statisticalGrowth(cstats["armor"], cstats["armorperlevel"], clevel)
    global_flat_calc_tabel["MR_BASE" ] = statisticalGrowth(cstats["spellblock"], cstats["spellblockperlevel"], clevel)
    global_flat_calc_tabel["MS_BASE" ] = cstats["movespeed"]
    global_flat_calc_tabel["Crit_BASE" ] = cstats["crit"]
    global_flat_calc_tabel["Range_BASE" ] = cstats["attackrange"]
    global_flat_calc_tabel["CharacterRadius_BASE" ] = 0
    global_flat_calc_tabel["AttackRadius_BASE" ] = 0  
    
    global_mult_calc_tabel["HP_BASE"] = null
    global_mult_calc_tabel["HPReg_BASE" ] = null
    global_mult_calc_tabel["Mana_BASE" ] = null
    global_mult_calc_tabel["ManaReg_BASE" ] = null
    global_mult_calc_tabel["AD_BASE" ] = null
    global_mult_calc_tabel["AP_BASE" ] = null
    global_mult_calc_tabel["AS_BASE" ] = statisticalGrowth(0, cstats["attackspeedperlevel"] / 100.0, clevel)
    global_mult_calc_tabel["LifeSteal_BASE" ] = null
    global_mult_calc_tabel["Spellvamp_BASE" ] = null
    global_mult_calc_tabel["Omnivamp_BASE" ] = null
    global_mult_calc_tabel["Armor_BASE" ] = null
    global_mult_calc_tabel["MR_BASE" ] = null
    global_mult_calc_tabel["MS_BASE" ] = null
    global_mult_calc_tabel["Crit_BASE" ] = null
    global_mult_calc_tabel["Range_BASE" ] = null
    global_mult_calc_tabel["CharacterRadius_BASE" ] = null
    global_mult_calc_tabel["AttackRadius_BASE" ] = null

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
    stats = item["stats"]

    global_flat_calc_tabel["HP_" + bonusType] = stats["FlatHPPoolMod"]
    global_flat_calc_tabel["HPReg_" + bonusType ] = null
    global_flat_calc_tabel["Mana_" + bonusType ] = stats["FlatMPPoolMod"]
    global_flat_calc_tabel["ManaReg_" + bonusType ] = null
    global_flat_calc_tabel["AD_" + bonusType ] = stats["FlatPhysicalDamageMod"]
    global_flat_calc_tabel["AP_" + bonusType ] = stats["FlatMagicDamageMod"]
    global_flat_calc_tabel["AS_" + bonusType ] = stats["FlatAttackSpeedMod"]
    global_flat_calc_tabel["LifeSteal_" + bonusType ] = stats["FlatLifeStealMod"]
    global_flat_calc_tabel["Spellvamp_" + bonusType ] = stats["FlatSpellvampMod"]
    global_flat_calc_tabel["Omnivamp_" + bonusType ] = null
    global_flat_calc_tabel["Armor_" + bonusType ] = stats["FlatArmorMod"]
    global_flat_calc_tabel["MR_" + bonusType ] = stats["FlatSpellBlockMod"]
    global_flat_calc_tabel["MS_" + bonusType ] = stats["FlatMoveSpeedMod"]
    global_flat_calc_tabel["Crit_" + bonusType ] = stats["FlatCritChanceMod"]
    global_flat_calc_tabel["Range_" + bonusType ] = null
    global_flat_calc_tabel["CharacterRadius_" + bonusType ] = null
    global_flat_calc_tabel["AttackRadius_" + bonusType ] = null  
    
    global_mult_calc_tabel["HP_" + bonusType] = stats["PercentHPPoolMod"]
    global_mult_calc_tabel["HPReg_" + bonusType ] = null
    global_mult_calc_tabel["Mana_" + bonusType ] = stats["PercentMPPoolMod"]
    global_mult_calc_tabel["ManaReg_" + bonusType ] = null
    global_mult_calc_tabel["AD_" + bonusType ] = stats["PercentPhysicalDamageMod"]
    global_mult_calc_tabel["AP_" + bonusType ] = stats["PercentMagicDamageMod"]
    global_mult_calc_tabel["AS_" + bonusType ] = stats["PercentAttackSpeedMod"]
    global_mult_calc_tabel["LifeSteal_" + bonusType ] = stats["PercentLifeStealMod"]
    global_mult_calc_tabel["Spellvamp_" + bonusType ] = stats["PercentSpellvampMod"]
    global_mult_calc_tabel["Omnivamp_" + bonusType ] = null
    global_mult_calc_tabel["Armor_" + bonusType ] = stats["PercentArmorMod"]
    global_mult_calc_tabel["MR_" + bonusType ] = stats["PercentSpellBlockMod"]
    global_mult_calc_tabel["MS_" + bonusType ] = stats["PercentMoveSpeedMod"]
    global_mult_calc_tabel["Crit_" + bonusType ] = stats["PercentCritChanceMod"]
    global_mult_calc_tabel["Range_" + bonusType ] = null
    global_mult_calc_tabel["CharacterRadius_" + bonusType ] = null
    global_mult_calc_tabel["AttackRadius_" + bonusType ] = null  


    setTableValue("HP_" + bonusType, stats["FlatHPPoolMod"])                    
    setTableValue("HPReg_" + bonusType, null)
    setTableValue("Mana_" + bonusType, stats["FlatMPPoolMod"])
    setTableValue("ManaReg_" + bonusType, null)
    setTableValue("AD_" + bonusType, stats["FlatPhysicalDamageMod"])
    setTableValue("AP_" + bonusType, stats["FlatMagicDamageMod"])
    setTableValue("AS_" + bonusType, stats["PercentAttackSpeedMod"])
    setTableValue("LifeSteal_" + bonusType, stats["PercentLifeStealMod"])
    setTableValue("Spellvamp_" + bonusType, stats["PercentSpellvampMod"])
    setTableValue("Omnivamp_" + bonusType, stats["?????"])
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

function calculateAttackSpeed(base, g, l, bonus)
{
    return base * (1 + (statisticalGrowth(0, g, l)/100))
}

function calculateAllStats(){
    $.each(global_stat_names, function() {
        var flat = calculateFlatStat(this)
        var mult = calculateMultStat(this)
        var mod = global_mult_scale_calc_exception_tabel[this]
        if(global_mult_scale_calc_exception_tabel[this]){
            mod = global_total_calc_tabel[mod]
            console.log(mod)
        }
        else{
            mod = flat
        }
        mult ??= 0
        flat ??= 0
        mod ??= 0
        global_total_calc_tabel[this] = mod * mult + flat
        setTableValue(this + "_TOTAL", global_total_calc_tabel[this])
    })
}

function calculateFlatStat(name){
    var value = 0.0
    $.each(global_col_keys, function() {
        if(this != "TOTAL")
        {
            var flat = global_flat_calc_tabel[name + "_" + this]

            if(flat != null)
                value += flat
        }
    })
    return value
}
function calculateMultStat(name){
    var value = 0.0
    $.each(global_col_keys, function() {
        if(this != "TOTAL")
        {
            var mult = global_mult_calc_tabel[name + "_" + this]

            if(mult != null)
                value += mult
        }
    })
    return value
}

function calculateAutoAttackDPS() {
    var as = parseFloat(document.getElementById("AS_TOTAL").innerHTML)
    var ad = parseFloat(document.getElementById("AD_TOTAL").innerHTML)
    var crit = parseFloat(document.getElementById("Crit_TOTAL").innerHTML)
    return as * ad * (1 + crit)
}