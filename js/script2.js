const margin = { top: 100, right: 50, bottom: 100, left: 50 },
  width = 1920,
  height = 1000 - margin.top - margin.bottom;

// set the ranges
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const r = 10;
const collisionR = -r / 5;
// define the size
const sizeMedium = (d) => +d.medium;

// define the width size
const sizeExpl = (d) => +d.explanation;

// define maxHeight glyphs
const sizeGlyph = (d) => +(sizeMedium(d) + sizeExpl(d) + 1.5);

// define the color
const colorValue = (d) => d.scenario;

// define users
const usersValue = (d) => +d.user;

// define path
const path = (d) => d.path;

// define tasks
const tasks = (d) => d.task;

// Scale the range of the data
const sizeScale = d3.scaleLinear().range([0, 5]);

const sizePath = d3
  .scaleOrdinal()
  .domain(["Linear", "Iterative"])
  .range(["0.2px", "0.5px"]);

const dashStroke = d3
  .scaleOrdinal()
  .domain(["Guided", "Open Ended"])
  .range(["0.5", "1"]);

const colorC = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

const color = d3
  .scaleOrdinal()
  .domain(["desktop", "exhibition", "multiple"])
  .range(["#FFD039", "#FFB237", "#EA1515"]);

let color2 = d3.scaleOrdinal().range(["#EA1515", "#9fc6c3"]);

let veri = d3.scaleOrdinal().domain(["0", "1"]).range(["#fff","#3479FF"]);

let div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Get the data
let data = d3.tsv("data/glyphs.tsv").then(function (data) {
  // format the data
  data.forEach(function (d) {
    d.x = +d.x;
    d.y = +d.y;
  });

  // Scale the range of the data
  x.domain([
    -30,
    d3.max(data, function (d) {
      return d.x;
    }),
  ]);
  y.domain([
    -30,
    d3.max(data, function (d) {
      return d.y;
    }),
  ]);

  const svg = d3
    .select("#xai")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(
      d3.zoom().on("zoom", function () {
        svg.attr("transform", d3.event.transform);
      })
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // compute the density data
  var densityData = d3
    .contourDensity()
    .x(function (d) {
      return x(d.x);
    }) // x and y = column name in .csv input data
    .y(function (d) {
      return y(d.y);
    })
    .size([width, height])
    .bandwidth(10)(
    // smaller = more precision in lines = more lines
    data
  );

  // add value for coloring contourplot

  value = (x, y) =>
    (1 +
      (x + y + 1) ** 2 *
        (19 - 14 * x + 3 * x ** 2 - 14 * y + 6 * x * y + 3 * y ** 2)) *
    (30 +
      (2 * x - 3 * y) ** 2 *
        (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y ** 2));

  // Add the contour: several "path"
  svg
    .selectAll("path")
    .data(densityData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("fill", (d) => veri(d.value))
    .attr("opacity", 0.4);

  // append rect item as pathaway
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("svg")
    .classed("glyph", true)
    .append("rect")
    .classed("item", true)
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .attr("width", "40px")
    .attr("height", (d) => sizeScale(sizeGlyph(d)))
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", (d) => sizePath(d.path))
    .attr("x", (d) => x(d.x))
    .attr("y", (d) => y(d.y))
    .on("mouseover", function (d) {
      this.parentNode.parentNode.appendChild(this.parentNode); //the path group is on the top with in its parent group
      this.parentNode.parentNode.parentNode.appendChild(
        this.parentNode.parentNode
      ); //the parent group is on the top with in its parent group
      d3.select(this)
        .transition()
        .duration(300)
        .style("fill", "#eee")
        .style("bord");
    })
    .on("mouseout", function (d) {
      this.parentNode.parentNode.appendChild(this.parentNode); //the path group is on the top with in its parent group
      this.parentNode.parentNode.parentNode.appendChild(
        this.parentNode.parentNode
      );
      d3.select(this).transition().duration(300).style("fill", "white");
    });

  // tooltip
  // .on("mouseover", function (d) {
  //   div.transition().duration(100).style("opacity", 1);
  //   div
  //     .html(d.title + "</br>" + d.medium + "</br>" + d.explanation)
  //     .style("left", d3.event.pageX + "px")
  //     .style("top", d3.event.pageY - 28 + "px");
  // })
  // .on("mouseout", function (d) {
  //   div.transition().duration(200).style("opacity", 0);
  // });

  svg
    .selectAll(".glyph")
    .append("rect")
    .classed("path", true)
    .attr("width", "40px")
    .attr("height", "1px")
    .style("fill", function (d) {
      if (d.tour === "Guided") {
        return "black";
      } else {
        return "white";
      }
    })
    .attr("stroke", "black")
    .attr("stroke-width", (d) => sizePath(d.path))
    .attr("x", (d) => x(d.x))
    .attr("y", (d) => y(d.y))
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // TASKS

  var task = svg
    .selectAll(".glyph")
    .append("g")
    .classed("task", true)
    .attr("display", "block")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  // understanding

  task
    .append("rect")
    .classed("understanding", true)
    .attr("display", "block")
    .attr("width", "9.5px")
    .attr("height", "2px")
    .style("fill", function (d) {
      if (d.task === "Understanding") {
        return "black";
      } else if (d.task === "Understanding,Diagnosis,Refinement") {
        return "black";
      } else if (d.task === "Understanding,Diagnosis") {
        return "black";
      } else if (d.task === "Understanding,Refinement") {
        return "black";
      } else {
        return "white";
      }
    })
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("x", (d) => x(d.x) + 5)
    .attr("y", (d) => y(d.y))
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 5] + ")"
    );

  // diagnosis
  task
    .append("rect")
    .classed("diagnosis", true)
    .attr("display", "block")
    .attr("width", "9.5px")
    .attr("height", "2px")
    .style("fill", function (d) {
      if (d.task === "Diagnosis") {
        return "black";
      } else if (d.task === "Understanding,Diagnosis,Refinement") {
        return "black";
      } else if (d.task === "Understanding,Diagnosis") {
        return "black";
      } else if (d.task === "Diagnois,Refinement") {
        return "black";
      } else {
        return "white";
      }
    })
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("x", (d) => x(d.x) + 15.33)
    .attr("y", (d) => y(d.y))
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 5] + ")"
    );

  // refinement
  task
    .append("rect")
    .classed("refinement", true)
    .attr("display", "block")
    .attr("width", "9.5px")
    .attr("height", "2px")
    .style("fill", function (d) {
      if (d.task === "Refinement") {
        return "black";
      } else if (d.task === "Understanding,Refinement") {
        return "black";
      } else if (d.task === "Understanding,Diagnosis,Refinement") {
        return "black";
      } else if (d.task === "Diagnois,Refinement") {
        return "black";
      } else {
        return "white";
      }
    })
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("x", (d) => x(d.x) + 25.5)
    .attr("y", (d) => y(d.y))
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 5] + ")"
    );

  // EXPLANATION

  var explanation = svg
    .selectAll(".glyph")
    .append("g")
    .classed("explanation", true)
    .attr("display", "block")
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 6] + ")"
    )
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  explanation
    .append("rect")
    .classed("expl-block", true)
    .attr("display", "block")
    .attr("width", "15px")
    .attr("height", (d) => sizeScale(sizeExpl(d)))
    .attr("fill", "#eee")
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("x", (d) => x(d.x) + 5)
    .attr("y", (d) => y(d.y) + 5)
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 6] + ")"
    );

  //grid explanation

  var gridExpl = d3
    .selectAll(".explanation")
    .append("g")
    .classed("gridExpl", true)
    .attr("display", "block")
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 6] + ")"
    );
  gridExpl
    .append("line")
    .classed("grid", true)
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("stroke-dasharray", ".2, .2")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.explanation === "1") {
        return "none";
      } else {
        return "block";
      }
    })
    .attr("x1", (d) => x(d.x) + 5)
    .attr("x2", (d) => x(d.x) + 20)
    .attr("y1", (d) => y(d.y) + 10)
    .attr("y2", (d) => y(d.y) + 10);

  gridExpl
    .append("line")
    .classed("grid", true)
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("stroke-dasharray", ".2, .2")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.explanation >= 2) {
        return "block";
      } else {
        return "none";
      }
    })
    .attr("x1", (d) => x(d.x) + 5)
    .attr("x2", (d) => x(d.x) + 20)
    .attr("y1", (d) => y(d.y) + 15)
    .attr("y2", (d) => y(d.y) + 15);

  gridExpl
    .append("line")
    .classed("grid", true)
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("stroke-dasharray", ".2, .2")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.explanation >= "3") {
        return "block";
      } else {
        return "none";
      }
    })
    .attr("x1", (d) => x(d.x) + 5)
    .attr("x2", (d) => x(d.x) + 20)
    .attr("y1", (d) => y(d.y) + 20)
    .attr("y2", (d) => y(d.y) + 20);

  //MEDIUM

  var medium = svg
    .selectAll(".glyph")
    .append("g")
    .classed("medium", true)
    .attr("display", "block")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  medium
    .append("rect")
    .classed("medium-block", true)
    .attr("display", "block")
    .attr("width", "15px")
    .attr("height", (d) => sizeScale(sizeMedium(d)))
    .attr("fill", (d) => color(d.scenario))
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("x", (d) => x(d.x) + 20)
    .attr("y", (d) => y(d.y) + 5)
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 6] + ")"
    );

  // grid medium

  var gridMedium = d3
    .selectAll(".medium")
    .append("g")
    .classed("gridMedium", true)
    .attr("display", "block")
    .attr(
      "transform",
      (d) => "translate(" + [0, sizeScale(sizeGlyph(d)) / 6] + ")"
    );

  gridMedium
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("stroke-dasharray", ".2, .2")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.medium === "1") {
        return "none";
      } else {
        return "block";
      }
    })
    .attr("x1", (d) => x(d.x) + 20)
    .attr("x2", (d) => x(d.x) + 35)
    .attr("y1", (d) => y(d.y) + 10)
    .attr("y2", (d) => y(d.y) + 10);

  gridMedium
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("stroke-dasharray", ".2, .2")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.medium >= 2) {
        return "block";
      } else {
        return "none";
      }
    })
    .attr("x1", (d) => x(d.x) + 20)
    .attr("x2", (d) => x(d.x) + 35)
    .attr("y1", (d) => y(d.y) + 15)
    .attr("y2", (d) => y(d.y) + 15);

  gridMedium
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("stroke-dasharray", ".2, .2")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.medium >= "3") {
        return "block";
      } else {
        return "none";
      }
    })
    .attr("x1", (d) => x(d.x) + 20)
    .attr("x2", (d) => x(d.x) + 35)
    .attr("y1", (d) => y(d.y) + 20)
    .attr("y2", (d) => y(d.y) + 20);

  gridMedium
    .append("line")
    .attr("stroke", "black")
    .attr("stroke-width", "0.1px")
    .style("opacity", ".4")
    .style("display", function (d) {
      if (d.medium >= "4") {
        return "block";
      } else {
        return "none";
      }
    })
    .attr("x1", (d) => x(d.x) + 20)
    .attr("x2", (d) => x(d.x) + 35)
    .attr("y1", (d) => y(d.y) + 25)
    .attr("y2", (d) => y(d.y) + 25);

  // add users

  d3.selectAll(".glyph").each(function (d) {
    const thisSvg = d3.select(this).append("svg");

    for (let i = 1; i <= +d.user; i++) {
      thisSvg
        .append("circle")
        .classed("user", true)
        .attr("cx", (d) => x(d.x) + i * 9)
        .attr("cy", (d) => sizeScale(sizeGlyph(d)) + y(d.y))
        .attr("r", "1.5px")
        .attr("fill", "white")
        .attr("stroke-width", ".5")
        .attr("stroke", "#0A0101")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
    }
  });

  // Add the X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("display", "none")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g").call(d3.axisLeft(y)).attr("display", "none");
});
