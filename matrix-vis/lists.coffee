[width, height] = [window.innerWidth, window.innerHeight]

main = d3.select("body").append("main")
    .append("div").classed("container", true)

lists = main.append("div").classed("row", true);

url = "//bostock.evl.uic.edu:8080/matches/score-above-zero-stream.json"

lists.selectAll("div").data(["fries_cards", "pc_cards", "links"])
    .enter().append("div")
    .attr("class", (d) -> d)
    .classed("col-xs-4", true)
    .call (div) ->
        div.append("h1").text((d) -> d);
        div.append("ul")

fries_list = lists.select(".fries_cards").select("ul")
pc_list = lists.select(".pc_cards").select("ul")
links_list = lists.select(".links").select("ul");

fries = []
pc = []
links = []

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
            index = bisect(fries, new_card)
            fries.splice(index, 0, new_card)

            # Find or push new pc cards and new links
            card.match.forEach (match) ->
                if match.score is 0
                    return

                target_pc = found = _.find(pc, (d) -> d._id is match._id)

                if ! found?
                    target_pc = new_card = { _id: match._id }
                    index = bisect(pc, new_card)
                    pc.splice(index, 0, new_card)

                match_data = {}
                keep_match_keys.forEach (key) -> match_data[key] = match[key]

                link = { source: source_fries, target: target_pc, match_data: match_data }
                links.push link

            updateAll()
        )

window.onload = go

updateAll = () ->
    updateLinks(links)
    updatePc(pc)
    updateFries(fries)

# updateAll = _.debounce(updateAll, 500, true);
updateAll = _.throttle(updateAll, 800);

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

# updateFries = _.debounce(updateFries, 50)
