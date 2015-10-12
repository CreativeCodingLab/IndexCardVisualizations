// Generated by CoffeeScript 1.10.0
(function() {
  var addPanes, bisect, cell_padding, cell_size, cell_spacing, color, columns_container, container, doSearch, font_size, fries, getOne, height, i, keep_fries_keys, keep_match_keys, links, main, margin, matrix_container, matrix_panel, mouseover, n, panels, pc, rows_container, score_scale, svg, translate, updateAll, updateColumns, updateRows, vis_row, width, x, y;

  margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  cell_size = 10;

  n = 1e3;

  width = height = cell_size * n;

  container = d3.select("body").append("main").append("div").classed("container", true).style({
    "padding-top": "10px"
  });

  addPanes = function() {
    return container.append("div").classed("row", true).append("div").classed("col-xs-12", true).append("div").classed("panel panel-default", true).append("div").classed("panel-body", true).call(function(div) {
      return div.selectAll("li").data(["Uniprot:P27361", "Uniprot:P05412", "Uniprot:Q05397", "Uniprot:P00533"]).enter().append("li").append("a").text(function(d) {
        return "Search for Participant B: " + d;
      }).on("click", function(d) {
        return doSearch("//bostock.evl.uic.edu:8080/matches/score-above-zero/participant-b/" + d);
      });
    });
  };

  addPanes();

  container.selectAll("li").each(function(d) {
    if (d === "Uniprot:P27361") {
      d3.select(this).select("a").append("span").text(" (includes potentialConflict)");
    }
    if (d === "Uniprot:P00533") {
      return d3.select(this).select("a").append("span").text(" (demonstrates scaling issues)");
    }
  });

  main = container.append("div").classed("row", true);

  vis_row = container.append("div").classed("row", true);

  matrix_panel = vis_row.append("div").classed("col-xs-6", true).append("div").classed("panel panel-default", true).append("div").classed("panel-body", true);

  panels = [
    {
      label: "Match Data",
      klass: "match-data"
    }, {
      label: "FRIES Data",
      klass: "fries-data"
    }, {
      label: "PC Data",
      klass: "pc-data"
    }
  ];

  vis_row.append("div").classed("col-xs-6", true).append("div").classed("row", true).selectAll(".panel").data(panels).enter().append("div").attr("class", function(d) {
    return d.klass;
  }).classed("panel panel-default", true).append("div").classed("panel-body", true).call(function(div) {
    div.append("h2").text(function(d) {
      return d.label;
    });
    return div.append("pre").classed("text", true).style({
      height: "250px",
      overflow: "scroll"
    });
  });

  svg = matrix_panel.append("svg").attr({
    width: "100%",
    height: "500px"
  });

  svg.append("rect").style({
    fill: "none",
    stroke: "black"
  }).attr({
    width: "100%",
    height: "100%"
  });

  translate = function(x, y) {
    return "translate (" + x + "," + y + ")";
  };

  matrix_container = svg.append("g").attr({
    "transform": translate(margin.left, margin.top)
  });

  matrix_container.append("rect").attr({
    width: "100%",
    height: "100%"
  }).style({
    fill: "#eee"
  });

  rows_container = matrix_container.append("g").classed("rows", true);

  columns_container = matrix_container.append("g").classed("columns", true);

  fries = [];

  pc = [];

  links = [];

  bisect = d3.bisector(function(d) {
    return d._id;
  }).left;

  keep_fries_keys = ["_id", "_filename", "_participant_a_ids", "_participant_b_ids"];

  keep_match_keys = ["deltaFeature", "potentialConflict", "participantA", "score"];

  i = 0;

  doSearch = function(url) {
    fries = [];
    pc = [];
    links = [];
    matrix_container.selectAll(".row").remove();
    return oboe(url).node("!.*", function(card) {
      var new_card, source_fries, source_index;
      source_fries = new_card = {};
      keep_fries_keys.forEach(function(key) {
        return new_card[key] = card[key];
      });
      source_index = bisect(fries, new_card);
      fries.splice(source_index, 0, new_card);
      card.match.forEach(function(match) {
        var match_data, target_index, target_pc;
        if (match.score === 0) {
          return;
        }
        target_index = _.findIndex(pc, function(d) {
          return d._id === match._id;
        });
        if (target_index === -1) {
          target_pc = new_card = {
            _id: match._id
          };
          target_index = bisect(pc, new_card);
          pc.splice(target_index, 0, new_card);
        } else {
          target_pc = pc[target_index];
        }
        match_data = {};
        keep_match_keys.forEach(function(key) {
          return match_data[key] = match[key];
        });
        return links.push({
          source: source_fries,
          target: target_pc,
          match_data: match_data
        });
      });
      return updateAll();
    });
  };

  x = d3.scale.ordinal();

  y = d3.scale.ordinal();

  cell_spacing = 0.15;

  cell_padding = 2;

  updateAll = function() {
    cell_size = parseInt(svg.style("width")) / pc.length;
    cell_padding = cell_size > 3 ? 2 : 0;
    y.domain(d3.range(fries.length)).rangeBands([0, cell_size * fries.length], cell_spacing);
    x.domain(d3.range(pc.length)).rangeBands([0, cell_size * pc.length], cell_spacing);
    svg.style({
      height: cell_size * fries.length
    });
    updateRows(fries);
    return updateColumns(pc);
  };

  updateAll = _.throttle(updateAll, 100);

  font_size = "9px";

  color = d3.scale.category10();

  score_scale = d3.scale.linear().domain([0, 10]).range([0, 1]);

  getOne = function(json) {
    return new Promise(function(resolve) {
      return d3.xhr("//bostock.evl.uic.edu:8080/get-one", "application/json").header("Content-Type", "application/json").on("load", resolve).post(JSON.stringify(json));
    });
  };

  mouseover = function(d) {
    getOne({
      _id: d.source._id,
      collection: "fries_cards"
    }).then(function(d) {
      var text;
      text = JSON.stringify(JSON.parse(d.response), null, 2);
      return d3.select(".fries-data .text").text(text);
    });
    getOne({
      _id: d.target._id,
      collection: "pc_cards"
    }).then(function(d) {
      var text;
      text = JSON.stringify(JSON.parse(d.response), null, 2);
      return d3.select(".pc-data .text").text(text);
    });
    return d3.select(".match-data .text").text(JSON.stringify(d.match_data, null, 2));
  };

  updateRows = function(fries) {
    var cells, rows;
    rows = rows_container.selectAll(".row").data(fries);
    rows.enter().append("g").classed("row", true).append("text").text(function(d) {
      return d._filename;
    }).attr({
      dy: font_size
    }).style({
      "font-size": font_size,
      "text-anchor": "end"
    });
    rows.attr({
      transform: function(d, i) {
        return translate(0, y(i));
      }
    });
    rows.exit().remove();
    cells = rows.selectAll(".cell").data(function(card) {
      return links.filter(function(link) {
        return link.source === card;
      });
    });
    cells.enter().append("g").classed("cell", true).on("mouseover", mouseover).append("rect");
    return cells.attr({
      transform: function(link) {
        var index;
        index = pc.indexOf(link.target);
        if (index === -1) {
          throw new Error("Can't find link target.");
        }
        return translate(x(index), 0);
      }
    }).select("rect").attr({
      width: x.rangeBand() - cell_padding,
      height: y.rangeBand() - cell_padding,
      x: cell_padding / 2,
      y: cell_padding / 2
    }).style({
      opacity: function(d) {
        return score_scale(d.match_data.score);
      }
    }).style({
      stroke: function(d) {
        return color(d.match_data.deltaFeature);
      },
      "stroke-width": x.rangeBand() * 0.3,
      fill: function(d) {
        if (d.match_data.potentialConflict) {
          return "none";
        } else {
          return color(d.match_data.deltaFeature);
        }
      }
    });
  };

  updateColumns = function(pc) {
    var columns;
    columns = columns_container.selectAll(".column").data(pc);
    return columns.enter().append("g").classed("column", true).append("text").text(function(d) {
      return d._id;
    }).attr({
      dy: font_size
    }).style({
      "font-size": font_size
    }).attr({
      transform: function(d, i) {
        return translate(x(i), 0) + "rotate(-90)";
      }
    });
  };

}).call(this);
