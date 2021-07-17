
$(document).ready(function(){
    h = document.getElementById("Title").innerHTML = "League Calculator"

    var body = document.body
    var div = document.createElement("div")
    body.appendChild(div)
    
    var input = document.createElement("input")
    input.type = "text"
    input.id = "champion_selector"
    div.appendChild(input)

    var select = document.createElement("select")
    select.className = "js-example-basic-single"
    select.name = "state"
    addItemToSelect(select, "Hello")
    addItemToSelect(select, "World")
    div.appendChild(select)

    $("input").change(function(){
        document.getElementById("Title").innerHTML = this.value
    });

    $('.js-example-basic-single').select2();
})

function addItemToSelect(parent, name)
{
    var tmp = document.createElement("option")
    tmp.innerHTML = name
    parent.appendChild(tmp)
}