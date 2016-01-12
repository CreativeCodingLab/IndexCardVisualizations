main = d3.select("body").append("main")
    .append("div").classed("container", true)
    .style({ "padding-top": "10px" })
    .append("row")

# url = "//bostock.evl.uic.edu:8080/matches/score-above-zero-stream.json"
url = "//bostock.evl.uic.edu:8080/matches/score-above-zero-stream-limit/200"

margin =
    top: 200
    right: 0
    bottom: 0
    left: 300

cell_size = 10
n = 1e3

# [width, height] = [window.innerWidth, window.innerHeight]
width = height = cell_size * n

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
matrix = []

bisect = d3.bisector((d) -> d._id).left

keep_fries_keys = ["_id", "_filename", "_participant_a_ids", "_participant_b_ids"]
keep_match_keys = ["deltaFeature", "potentialConflict", "participantA", "score"]

i = 0

go = () ->
    oboe(url)
        .node("!.*", (card) ->

            # Add to fries
            source_fries = new_card = {}
            keep_fries_keys.forEach (key) -> new_card[key] = card[key]
            source_index = bisect(fries, new_card)
            fries.splice(source_index, 0, new_card)

            matrix[source_index] = [];

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

                # matrix[source_index][target_index] = match_data
                # link = { source: source_fries, target: target_pc, match_data: match_data }
                links.push {
                    source: source_fries, target: target_pc,
                    match_data: match_data
                }

            updateAll()
        )

window.onload = go

x = d3.scale.ordinal() # .rangeBands([0, width])
y = d3.scale.ordinal() # .rangeBands([0, height])

updateAll = () ->
    y.domain(d3.range(fries.length)).rangeBands([0, cell_size * fries.length], 0.1)
    x.domain(d3.range(pc.length)).rangeBands([0, cell_size * pc.length], 0.1)

    updateRows(fries)
    updateColumns(pc)
    # updateLinks(links)
    # updatePc(pc)
    # updateFries(fries)

updateAll = _.throttle(updateAll, 100);

font_size = "9px"

updateRows = (fries) ->
    rows = rows_container.selectAll(".row").data(fries)

    rows.enter().append("g").classed("row", true)
        .append("text")
        .text((d) -> d._filename)
        .attr({ dy: font_size })
        .style({ "font-size": font_size, "text-anchor": "end" })

    rows.attr({ transform: (d, i) -> translate(0, y(i)) })

    cells = rows.selectAll(".cell")
        .data((card) -> links.filter((link) -> link.source is card))

    cells.enter().append("g").classed("cell", true)
        .append("rect")
        .attr({ width: x.rangeBand(), height: y.rangeBand() })
        .style({ opacity: 0.7 })

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

    columns.attr({ transform: (d, i) -> translate(x(i),0) + "rotate(-90)" })

updateLinks = (links) ->
    items = links_list.selectAll("li").data(links)

    items.enter().append("li")
        .text((d) -> JSON.stringify(d))
        .style({ "font-size": "0.5em" })

updatePc = (pc) ->
    items = pc_list.selectAll("li").data(pc)

    items.enter().append("li").text((d) -> d._id)
        .style({ "font-size": "0.5em", opacity: 0 })
        .style({ opacity: 1 })

updateFries = (fries) ->
    items = fries_list.selectAll("li").data(fries)

    items.enter().append("li").text((d) -> d._filename)
        .style({ "font-size": "0.5em", opacity: 0 })
        # .transition("new")
        # .duration(500)
        # .delay((d, i) -> i * 50)
        .style({ opacity: 1 })
