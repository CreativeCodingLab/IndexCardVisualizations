// Generated by CoffeeScript 1.7.1
(function() {
  var addButtons, arrayToString, bisect, cell_padding, cell_size, cell_spacing, color, columns_container, container, doSearch, existing_oboe, font_size, fries, getOne, height, i, keep_fries_keys, keep_match_keys, links, margin, matrix_container, matrix_panel, mouseout, mouseover, n, panels, pc, rows_container, score_scale, setHoverData, svg, translate, updateAll, updateColumns, updateRows, vis_row, width, x, y;

  margin = {
    top: 50,
    right: 0,
    bottom: 0,
    left: 50
  };

  cell_size = 10;

  n = 1e3;

  width = height = cell_size * n;

  addButtons = function(container) {
    var base_url, button_data;
    base_url = "//bostock.evl.uic.edu:8080/matches/score-above-zero/participant-b/";
    button_data = ["Uniprot:P27361", "Uniprot:P05412", "Uniprot:Q05397"];
    return container.append("div").classed("row", true).append("div").classed("col-xs-12", true).append("div").classed("panel panel-default", true).append("div").classed("panel-body", true).call(function(div) {
      var group, text;
      group = div.append("div").classed("input-group", true).style({
        "margin-bottom": "20px"
      });
      group.append("span").classed("input-group-btn", true).append("button").classed("btn btn-default", true).attr({
        type: "button"
      }).text("Search").on("click", function() {
        var value;
        value = text.node().value;
        if (value.length) {
          console.log(value);
          d3.select(".search-buttons").selectAll("label").classed("active", false);
          return doSearch("" + base_url + value);
        }
      });
      text = group.append("input").attr({
        type: "text",
        "class": "form-control",
        placeholder: "Identifier"
      });
      return div.append("h4").text("Example Queries");
    }).append("div").classed("btn-group search-buttons", true).attr({
      "data-toggle": "buttons"
    }).call(function(div) {
      var label;
      label = div.selectAll("label").data(button_data);
      label.enter().append("label").classed("btn btn-primary", true).text(function(d) {
        return "Participant B: " + d;
      }).on("click", function(d) {
        return doSearch("" + base_url + d);
      });
      return label.append("input").attr({
        type: "radio",
        name: "data"
      });
    });
  };

  translate = function(x, y) {
    return "translate (" + x + "," + y + ")";
  };

  fries = [];

  pc = [];

  links = [];

  doSearch = function(url) {
    var existing_oboe;
    fries = [];
    pc = [];
    links = [];
    matrix_container.selectAll(".row").remove();
    matrix_container.selectAll(".column").remove();
    if (typeof existing_oboe !== "undefined" && existing_oboe !== null) {
      existing_oboe.abort();
    }
    return existing_oboe = oboe(url).node("!.*", function(card) {
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

  cell_spacing = 0;

  cell_padding = 0;

  updateAll = function() {
    var fries_title, matrix_height, matrix_width, pc_title, _wid, _wid_2;
    matrix_width = parseInt(svg.style("width")) - margin.left - margin.right;
    matrix_height = parseInt(svg.style("height")) - margin.top - margin.bottom;
    cell_size = matrix_width / pc.length;
    cell_padding = cell_size > 3 ? 2 : 0;
    y.domain(d3.range(fries.length)).rangeBands([0, cell_size * fries.length], cell_spacing);
    x.domain(d3.range(pc.length)).rangeBands([0, cell_size * pc.length], cell_spacing);
    svg.style({
      height: cell_size * fries.length + margin.top + margin.bottom
    });
    pc_title = svg.selectAll(".columns-title").data(["pathway commons"]);
    pc_title.enter().append("g").classed("columns-title", true).append("text").text(function(d) {
      return d.toUpperCase();
    });
    _wid = pc_title.select("text").node().getBBox().width;
    pc_title.attr({
      transform: translate(margin.left + matrix_width / 2 - _wid / 2, 10)
    });
    fries_title = svg.selectAll(".rows-title").data(["fries"]);
    fries_title.enter().append("g").classed("rows-title", true).append("text").text(function(d) {
      return d.toUpperCase();
    });
    _wid_2 = fries_title.select("text").node().getBBox().width;
    fries_title.attr({
      transform: function() {
        var h;
        h = parseInt(svg.style("height")) - margin.top;
        return translate(10, margin.top + h / 2 + _wid_2 / 2) + "rotate(-90)";
      }
    });
    updateRows(fries);
    return updateColumns(pc);
  };

  updateAll = _.throttle(updateAll, 100);

  font_size = "9px";

  color = d3.scale.category10();

  score_scale = d3.scale.linear().domain([0, 10]).range([0, 0.6]);

  getOne = function(json) {
    return new Promise(function(resolve) {
      return d3.xhr("//bostock.evl.uic.edu:8080/get-one", "application/json").header("Content-Type", "application/json").on("load", resolve).post(JSON.stringify(json));
    });
  };

  mouseover = function(d) {
    d3.select(this).classed("highlight", true);
    getOne({
      _id: d.source._id,
      collection: "fries_cards"
    }).then(function(d) {
      var json, text;
      json = JSON.parse(d.response);
      console.log(json);
      text = JSON.stringify(json, null, 2);
      d3.select(".fries-data .text").text(text);
      return d3.select(".fries-data").selectAll("tr").each(setHoverData(json));
    });
    getOne({
      _id: d.target._id,
      collection: "pc_cards"
    }).then(function(d) {
      var json, text;
      json = JSON.parse(d.response);
      console.log(json);
      text = JSON.stringify(json, null, 2);
      d3.select(".pc-data .text").text(text);
      return d3.select(".pc-data").selectAll("tr").each(setHoverData(json));
    });
    return d3.select(".match-data").selectAll("tr").each(setHoverData(d.match_data));
  };

  setHoverData = function(data) {
    return function(row) {
      var string, td;
      string = data[row.key];
      td = d3.select(this).selectAll(".hover-data").data([string]);
      td.enter().append("td").classed("hover-data", true);
      if (row.func != null) {
        row.func(string)(td);
      } else {
        td.text(string);
      }
      if (row.key === "deltaFeature") {
        td.style({
          color: function(d) {
            return color(string);
          }
        });
      }
      if (row.key === "potentialConflict") {
        return td.style({
          color: function(d) {
            if (string === true) {
              return "red";
            } else {
              return "black";
            }
          }
        });
      }
    };
  };

  mouseout = function(d) {
    d3.select(this).classed("highlight", false);
    d3.select(".fries-data .text").text("");
    d3.select(".fries-data").selectAll(".hover-data").text("");
    d3.select(".pc-data .text").text("");
    d3.select(".pc-data").selectAll(".hover-data").text("");
    return d3.select(".match-data").selectAll(".hover-data").text("");
  };

  updateRows = function(fries) {
    var cells, rows;
    rows = rows_container.selectAll(".row").data(fries);
    rows.enter().append("g").classed("row", true).append("text").attr({
      dy: font_size
    }).style({
      "font-size": font_size,
      "text-anchor": "end"
    });
    rows.attr({
      transform: function(d, i) {
        return translate(0, y(i));
      }
    }).select("text").text(function(d) {
      return d._filename.slice(-6);
    });
    rows.exit().remove();
    cells = rows.selectAll(".cell").data(function(card) {
      return links.filter(function(link) {
        return link.source === card;
      });
    });
    cells.enter().append("g").classed("cell", true).on("mouseover", mouseover).on("mouseout", mouseout).append("rect");
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
      fill: function(d) {
        if (d.match_data.potentialConflict) {
          return "red";
        } else {
          return color(d.match_data.deltaFeature);
        }
      }
    });
  };

  updateColumns = function(pc) {
    var columns;
    columns_container.selectAll(".column").remove();
    columns = columns_container.selectAll(".column").data(pc);
    columns.enter().append("g").classed("column", true).append("text").attr({
      dy: "8px"
    }).style({
      "font-size": font_size
    });
    columns.attr({
      transform: function(d, i) {
        return translate(x(i), 0) + "rotate(-90)";
      }
    }).select("text").text(function(d) {
      return d._id.slice(-6);
    });
    return columns.exit().remove();
  };

  container = d3.select("body").append("main").append("div").classed("container", true).style({
    "padding-top": "10px"
  }).call(addButtons);

  vis_row = container.append("div").classed("row", true);

  matrix_panel = vis_row.append("div").classed("col-xs-7", true).append("div").classed("panel panel-default", true).append("div").classed("panel-body", true);

  arrayToString = function(d) {
    return function(td) {
      var html;
      html = d.length ? d.join("<br>") : d;
      return td.html(html);
    };
  };

  panels = [
    {
      label: "Match Data",
      klass: "match-data",
      keys: [
        {
          key: "deltaFeature",
          label: "Delta Feature"
        }, {
          key: "potentialConflict",
          label: "Potential Conflict?"
        }, {
          key: "participantA",
          label: "Participant A"
        }, {
          key: "score",
          label: "Score"
        }
      ]
    }, {
      label: "FRIES Data",
      klass: "fries-data",
      keys: [
        {
          key: "_participant_a_ids",
          label: "Participant A",
          func: arrayToString
        }, {
          key: "_participant_b_ids",
          label: "Participant B",
          func: arrayToString
        }, {
          key: "extracted_information",
          label: "Interaction Type",
          func: function(d) {
            return function(td) {
              return td.text(d.interaction_type);
            };
          }
        }
      ]
    }, {
      label: "PC Data",
      klass: "pc-data",
      keys: [
        {
          key: "_participant_a_ids",
          label: "Participant A",
          func: arrayToString
        }, {
          key: "_participant_b_ids",
          label: "Participant B",
          func: arrayToString
        }, {
          key: "extracted_information",
          label: "Interaction Type",
          func: function(d) {
            return function(td) {
              return td.text(d.interaction_type);
            };
          }
        }
      ]
    }
  ];

  vis_row.append("div").classed("col-xs-5", true).selectAll(".panel").data(panels).enter().append("div").attr("class", function(d) {
    return d.klass;
  }).classed("panel panel-default", true).call(function(div) {
    div.append("div").classed("panel-heading", true).text(function(d) {
      return d.label;
    });
    div.append("table").classed("table table-condensed", true).append("tbody").selectAll("tr").data(function(d) {
      return d.keys || [];
    }).enter().append("tr").append("td").text(function(d) {
      return d.label;
    });
    return div.append("div").classed("panel-body", true);
  }).each(function(d) {
    if (d.klass === "match-data") {
      d3.select(this).select("pre").remove();
      return d3.select(this).select(".panel-body").remove();
    }
  });

  svg = matrix_panel.append("svg").attr({
    width: "100%",
    height: "500px"
  });

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

  bisect = d3.bisector(function(d) {
    return d._id;
  }).left;

  keep_fries_keys = ["_id", "_filename", "_participant_a_ids", "_participant_b_ids"];

  keep_match_keys = ["deltaFeature", "potentialConflict", "participantA", "score"];

  i = 0;

  existing_oboe = null;

  container.selectAll("label").each(function(d, i) {
    if (i === 0) {
      d3.select(this).node().click();
    }
    if (d === "Uniprot:P27361") {
      d3.select(this).select("a").append("span").text(" (includes potentialConflict)");
    }
    if (d === "Uniprot:P00533") {
      return d3.select(this).select("a").append("span").text(" (demonstrates scaling issues)");
    }
  });

}).call(this);
