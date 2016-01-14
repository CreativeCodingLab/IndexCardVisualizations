margin =
    top: 0
    right: 0
    bottom: 0
    left: 0

cell_size = 10
n = 1e3

width = height = cell_size * n
    
addButtons = (container) ->
    base_url = "//bostock.evl.uic.edu:8080/matches/score-above-zero/participant-b/"
    button_data = ["Uniprot:P27361", "Uniprot:P05412", "Uniprot:Q05397"]
    
    container.append("div").classed("row", true)
        .append("div").classed("col-xs-12", true)
        .append("div").classed("panel panel-default", true)
        .append("div").classed("panel-body", true)
        .append("div").classed("btn-group", true).attr({ "data-toggle": "buttons" })
        .call (div) ->
            label = div.selectAll("label").data(button_data)
                
            label.enter().append("label").classed("btn btn-primary", true)
                .text((d) -> "Participant B: #{d}")
                .on("click", (d) -> doSearch("#{base_url}#{d}"))
                
            label.append("input").attr({ type: "radio", name: "data" })

translate = (x, y) -> "translate (#{x},#{y})"

fries = []
pc = []
links = []

doSearch = (url) ->
    fries = []
    pc = []
    links = []
    matrix_container.selectAll(".row").remove()
    
    if existing_oboe?
        existing_oboe.abort()
        
    existing_oboe = oboe(url)
        .node("!.*", (card) ->

            # Add to fries
            source_fries = new_card = {}
            keep_fries_keys.forEach (key) -> new_card[key] = card[key]
            source_index = bisect(fries, new_card)
            fries.splice(source_index, 0, new_card)

            # Find or push new pc cards and new links
            card.match.forEach (match) ->
                if match.score is 0
                    return

                target_index = _.findIndex(pc, (d) -> d._id is match._id)

                if target_index is -1
                    target_pc = new_card = { _id: match._id }
                    target_index = bisect(pc, new_card)
                    pc.splice(target_index, 0, new_card)
                else
                    target_pc = pc[target_index]

                match_data = {}
                keep_match_keys.forEach (key) -> match_data[key] = match[key]

                links.push {
                    source: source_fries, target: target_pc,
                    match_data: match_data
                }

            updateAll()
        )

x = d3.scale.ordinal()
y = d3.scale.ordinal()

cell_spacing = 0
cell_padding = 0

updateAll = ->
    cell_size = parseInt(svg.style("width")) / pc.length
    cell_padding = if cell_size > 3 then 2 else 0
    
    y.domain(d3.range(fries.length)).rangeBands([0, cell_size * fries.length], cell_spacing)
    x.domain(d3.range(pc.length)).rangeBands([0, cell_size * pc.length], cell_spacing)

    svg.style({ height: cell_size * fries.length })

    updateRows(fries)
    updateColumns(pc)

updateAll = _.throttle(updateAll, 100);

font_size = "9px"

color = d3.scale.category10()

score_scale = d3.scale.linear().domain([0,10]).range([0,0.6])

getOne = (json) ->
    return new Promise (resolve) ->
        d3.xhr("//bostock.evl.uic.edu:8080/get-one", "application/json")
            .header("Content-Type", "application/json")
            .on("load", resolve)
            .post(JSON.stringify(json))

mouseover = (d) ->
    d3.select(this).classed("highlight", true)
    getOne({ _id: d.source._id, collection: "fries_cards" })
        .then (d) -> 
            json = JSON.parse(d.response)
            
            text = JSON.stringify(json, null, 2)
            d3.select(".fries-data .text").text(text)
            
    getOne({ _id: d.target._id, collection: "pc_cards" })
        .then (d) ->
            text = JSON.stringify(JSON.parse(d.response), null, 2)
            d3.select(".pc-data .text").text(text)
            
    text = JSON.stringify(d.match_data, null, 2)
    d3.select(".match-data").selectAll("tr")
        .each (row) ->
            string = d.match_data[row.key]
            td = d3.select(this).selectAll(".hover-data").data([string])
            td.enter().append("td").classed("hover-data", true)
            td.text(string)
            if row.key is "deltaFeature"
                td.style({ color: (d) -> color(string) })
            if row.key is "potentialConflict"
                td.style({ color: (d) -> if string is true then "red" else "black" })
            
mouseout = (d) ->
    d3.select(this).classed("highlight", false)
    d3.select(".fries-data .text").text("")
    d3.select(".pc-data .text").text("")
    d3.select(".match-data").selectAll(".hover-data").text("")

updateRows = (fries) ->
    rows = rows_container.selectAll(".row").data(fries)

    rows.enter().append("g").classed("row", true)
        .append("text")
        .text((d) -> d._filename)
        .attr({ dy: font_size })
        .style({ "font-size": font_size, "text-anchor": "end" })

    rows.attr({ transform: (d, i) -> translate(0, y(i)) })
    
    rows.exit().remove()

    cells = rows.selectAll(".cell")
        .data((card) -> links.filter((link) -> link.source is card))

    cells.enter().append("g").classed("cell", true)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .append("rect")

    cells.attr({
        transform: (link) ->
            index = pc.indexOf(link.target)
            if index is -1
                throw new Error("Can't find link target.")
            translate(x(index), 0)
        })
        .select("rect")
        .attr({ 
            width: x.rangeBand() - cell_padding, 
            height: y.rangeBand() - cell_padding, 
            x: cell_padding/2, 
            y: cell_padding/2 
        })
        .style({ opacity: (d) -> score_scale(d.match_data.score) })
        .style({ 
            #stroke: (d) -> color(d.match_data.deltaFeature),
            #"stroke-width": x.rangeBand() * 0.3,
            fill: (d) -> if d.match_data.potentialConflict then "red" else color(d.match_data.deltaFeature)
        })

updateColumns = (pc) ->
    columns = columns_container.selectAll(".column").data(pc)

    columns.enter().append("g").classed("column", true)
        .append("text")
        .text((d) -> d._id)
        .attr({ dy: font_size })
        .style({ "font-size": font_size })
        .attr({ transform: (d, i) -> translate(x(i),0) + "rotate(-90)" })

container = d3.select("body").append("main")
        .append("div").classed("container", true)
        .style({ "padding-top": "10px" })
        .call(addButtons)

vis_row = container.append("div").classed("row", true)
    
matrix_panel = vis_row.append("div").classed("col-xs-6", true)
    .append("div").classed("panel panel-default", true)
    .append("div").classed("panel-body", true)
    
panels = [ 
        { 
            label: "Match Data", 
            klass: "match-data", 
            keys: [
                { key: "deltaFeature", label: "Delta Feature" },
                { key: "potentialConflict", label: "Potential Conflict?" },
                { key: "participantA", label: "Participant A" },
                { key: "score", label: "Score" }
            ]
        }, 
        { 
            label: "FRIES Data", 
            klass: "fries-data",
            keys: [
                { key: "_participant_a_ids", label: "Participant A" },
                { key: "_participant_b_ids", label: "Participant B" }
            ]
        }, 
        { 
            label: "PC Data", 
            klass: "pc-data",
            keys: [
                { key: "_participant_a_ids", label: "Participant A" },
                { key: "_participant_b_ids", label: "Participant B" }
            ]
        } 
    ]
    
vis_row.append("div").classed("col-xs-6", true)
    .selectAll(".panel")
    .data(panels)
    .enter().append("div")
    .attr("class", (d) -> d.klass)
    .classed("panel panel-default", true)
    .call (div) ->
        div.append("div").classed("panel-heading", true)
            .text((d) -> d.label)
            
        div.append("table").classed("table table-condensed", true)
            .append("tbody")
            .selectAll("tr").data((d) -> return d.keys or [])
            .enter().append("tr")
            .append("td").text((d) -> d.label)
        
        div.append("div").classed("panel-body", true)
        
        div.append("pre").classed("text", true)
            .style({ height: "250px", overflow: "scroll" })
    .each (d) ->
        if d.klass is "match-data"
            d3.select(this).select("pre").remove()
            d3.select(this).select(".panel-body").remove()
    
svg = matrix_panel.append("svg")
    .attr({
        width: "100%",
        height: "500px"
    })

svg.append("rect")
    .style({ fill: "none", stroke: "black" })
    .attr({ width: "100%", height: "100%" })
    
matrix_container = svg.append("g")
    .attr({ "transform": translate(margin.left, margin.top) })

matrix_container.append("rect")
    .attr({ width: "100%", height: "100%" })
    .style({ fill: "#eee" })

rows_container = matrix_container.append("g").classed("rows", true)
columns_container = matrix_container.append("g").classed("columns", true)

fries = []
pc = []
links = []

bisect = d3.bisector((d) -> d._id).left

keep_fries_keys = ["_id", "_filename", "_participant_a_ids", "_participant_b_ids"]
keep_match_keys = ["deltaFeature", "potentialConflict", "participantA", "score"]

i = 0

existing_oboe = null

container.selectAll("label")
    .each (d, i) ->
        if i is 0
            d3.select(this).node().click()
        if d is "Uniprot:P27361"
            d3.select(this).select("a").append("span").text(" (includes potentialConflict)")
        if d is "Uniprot:P00533"
            d3.select(this).select("a").append("span").text(" (demonstrates scaling issues)")