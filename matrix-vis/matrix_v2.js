// Generated by CoffeeScript 1.7.1
(function() {
  var bisect, cell_padding, cell_size, color, columns_container, font_size, fries, go, height, i, keep_fries_keys, keep_match_keys, links, main, margin, matrix, matrix_container, n, pc, rows_container, svg, translate, updateAll, updateColumns, updateRows, url, width, x, y;

  main = d3.select("body").append("main").append("div").classed("container", true).style({
    "padding-top": "10px"
  }).append("row");

  url = "//bostock.evl.uic.edu:8080/matches/score-above-zero-stream-limit/200";

  margin = {
    top: 200,
    right: 0,
    bottom: 0,
    left: 300
  };

  cell_size = 10;

  n = 1e3;

  width = height = cell_size * n;

  svg = main.append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
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
    width: width,
    height: height
  }).style({
    fill: "#eee"
  });

  rows_container = matrix_container.append("g").classed("rows", true);

  columns_container = matrix_container.append("g").classed("columns", true);

  fries = [];

  pc = [];

  links = [];

  matrix = [];

  bisect = d3.bisector(function(d) {
    return d._id;
  }).left;

  keep_fries_keys = ["_id", "_filename", "_participant_a_ids", "_participant_b_ids"];

  keep_match_keys = ["deltaFeature", "potentialConflict", "participantA", "score"];

  i = 0;

  go = function() {
    return oboe(url).node("!.*", function(card) {
      var new_card, source_fries, source_index;
      source_fries = new_card = {};
      keep_fries_keys.forEach(function(key) {
        return new_card[key] = card[key];
      });
      source_index = bisect(fries, new_card);
      fries.splice(source_index, 0, new_card);
      matrix[source_index] = [];
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

  window.onload = go;

  x = d3.scale.ordinal();

  y = d3.scale.ordinal();

  updateAll = function() {
    y.domain(d3.range(fries.length)).rangeBands([0, cell_size * fries.length], 0.1);
    x.domain(d3.range(pc.length)).rangeBands([0, cell_size * pc.length], 0.1);
    updateRows(fries);
    return updateColumns(pc);
  };

  updateAll = _.throttle(updateAll, 100);

  font_size = "9px";

  color = d3.scale.category10();

  cell_padding = 2;

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
    cells = rows.selectAll(".cell").data(function(card) {
      return links.filter(function(link) {
        return link.source === card;
      });
    });
    cells.enter().append("g").classed("cell", true).append("rect").attr({
      width: x.rangeBand() - cell_padding,
      height: y.rangeBand() - cell_padding,
      x: cell_padding / 2,
      y: cell_padding / 2
    }).style({
      opacity: 0.7
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
    return cells.attr({
      transform: function(link) {
        var index;
        index = pc.indexOf(link.target);
        if (index === -1) {
          throw new Error("Can't find link target.");
        }
        return translate(x(index), 0);
      }
    });
  };

  updateColumns = function(pc) {
    var columns;
    columns = columns_container.selectAll(".column").data(pc);
    columns.enter().append("g").classed("column", true).append("text").text(function(d) {
      return d._id;
    }).attr({
      dy: font_size
    }).style({
      "font-size": font_size
    });
    return columns.attr({
      transform: function(d, i) {
        return translate(x(i), 0) + "rotate(-90)";
      }
    });
  };

}).call(this);
