# url = "//bostock.evl.uic.edu:8080/matches/score-above-zero-stream.json"
#url = "//bostock.evl.uic.edu:8080/matches/score-above-zero-stream-limit/200"
url = "//bostock.evl.uic.edu:8080/matches/score-above-zero/participant-b/Uniprot:P05412"

margin =
    top: 0
    right: 0
    bottom: 0
    left: 0

cell_size = 10
n = 1e3

# [width, height] = [window.innerWidth, window.innerHeight]
width = height = cell_size * n

container = d3.select("body").append("main")
    .append("div").classed("container", true)
    .style({ "padding-top": "10px" })
    
    
addPanes = ->
    container.append("div").classed("row", true)
        .append("div").classed("col-xs-12", true)
        .append("div").classed("panel panel-default", true)
        .append("div").classed("panel-body", true)
        .append("a") # .attr("href", "#")
        .text("Search for Participant B: Uniprot:P05412")
        .on("click", -> doSearch(url))
        
addPanes()
    
main = container.append("div").classed("row", true)

svg = main.append("svg")
    .attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    })

svg.append("rect")
    .style({ fill: "none", stroke: "black" })
    .attr({ width: "100%", height: "100%" })

translate = (x, y) -> "translate (#{x},#{y})"

matrix_container = svg.append("g")
    .attr({ "transform": translate(margin.left, margin.top) })

matrix_container.append("rect")
    .attr({ width: width, height: height })
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

doSearch = (url) ->
    fries = []
    pc = []
    links = []
    oboe(url)
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

updateAll = ->
    y.domain(d3.range(fries.length)).rangeBands([0, cell_size * fries.length], 0.1)
    x.domain(d3.range(pc.length)).rangeBands([0, cell_size * pc.length], 0.1)

    updateRows(fries)
    updateColumns(pc)

updateAll = _.throttle(updateAll, 100);

font_size = "9px"

color = d3.scale.category10()

cell_padding = 2

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
        .append("rect")
        .attr({ 
            width: x.rangeBand() - cell_padding, 
            height: y.rangeBand() - cell_padding, 
            x: cell_padding/2, 
            y: cell_padding/2 
        })
        #.append("circle")
        #.attr({ r: x.rangeBand() * 0.4, cx: x.rangeBand() / 2, cy: x.rangeBand() / 2 })
        .style({ opacity: 0.7 })
        .style({ 
            stroke: (d) -> color(d.match_data.deltaFeature),
            "stroke-width": x.rangeBand() * 0.3,
            fill: (d) -> if d.match_data.potentialConflict then "none" else color(d.match_data.deltaFeature)
        })

    cells.attr({
        transform: (link) ->
            index = pc.indexOf(link.target)
            if index is -1
                throw new Error("Can't find link target.")
            translate(x(index), 0)
        })

updateColumns = (pc) ->
    columns = columns_container.selectAll(".column").data(pc)

    columns.enter().append("g").classed("column", true)
        .append("text")
        .text((d) -> d._id)
        .attr({ dy: font_size })
        .style({ "font-size": font_size })
        .attr({ transform: (d, i) -> translate(x(i),0) + "rotate(-90)" })
