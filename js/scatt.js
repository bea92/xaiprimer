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

// define path
const path = (d) => d.path;

// define tasks
const tasks = (d) => d.task;

// Scale the range of the data
const sizeScale = d3.scaleLinear().range([5, 10]);

const sizePath = d3
  .scaleOrdinal()
  .domain(["Linear", "Iterative"])
  .range(["0.2px", "0.5px"]);

const dashStroke = d3
  .scaleOrdinal()
  .domain(["Guided", "Open Ended"])
  .range(["0.5", "1"]);

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

  const dataFixed = data.map((d) => ({
    px: d.x,
    py: d.y,
    title: d.title,
    size: (d.medium + d.explanation) / 3,
    tour: d.tour,
    path: d.path,
    scenario: d.scenario,
    task: d.task,
    explanation: d.explanation,
    medium: d.medium,
    user: +d.user,
    format: d.format,
    focus: d.focus,
  }));

  // define the color

  const color = d3
    .scaleOrdinal()
    .domain(["desktop", "exhibition", "multiple"])
    .range(["#FFD039", "#FFB237", "#EA1515"]);
  // Scale the range of the data
  const sizeScale = d3.scaleLinear().range([0, 3]);
  const colorC = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

  const sizePath = d3
    .scaleOrdinal()
    .domain(["Linear", "Iterative"])
    .range(["0.2px", "1px"]);

  let veri = d3.scaleOrdinal().domain(["0", "1"]).range(["#fff", "#3479FF"]);

  let r = 20;
  let collisionR = r / 3;

  const simulation = d3
    .forceSimulation(dataFixed)
    .force(
      "x",
      d3.forceX((d) => x(d.px))
    )
    .force(
      "y",
      d3.forceY((d) => y(d.py))
    )
    .force("collide", d3.forceCollide(r + collisionR).iterations(10));

  // Run the simulation for 100 steps
  for (let i = 2; i < 100; i++) simulation.tick();
  simulation.stop();

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
    .bandwidth(50)(
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
    .attr("fill", "white")
    .attr("d", d3.geoPath())
    .attr("stroke", (d) => veri(d.value))
    .attr("stroke-width", "0.2px")
    .attr("opacity", 1)

  let g = svg
    .append("g")
    .attr("stroke-width", 1.5)
    .attr("font-family", "serif")
    .attr("font-size", 10)
    .selectAll("g")
    .data(dataFixed);

  g = g
    .enter()
    .append("g")
    .classed("glyph", true)
    .attr("transform", (d) => `translate(${d.x},${d.y})`);


  g.append("rect")
    .classed("item", true)
    .attr("width", "40px")
    .attr("height", function (d) {
      if (d.medium <= d.explanation) {
        return sizeScale(d.explanation) + 15;
      } else if (d.medium >= d.explanation) {
        return sizeScale(d.medium) + 15;
      } else if (d.medium === d.explanation) {
        return sizeScale(d.medium) + 15;
      } else {
        return sizeScale(d.medium) + 15;
      }
    })
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", function (d) {
      return sizePath(d.path);
    })
    .on("mouseover", function (d) {
      div.transition().duration(100).style("opacity", 1);
      div
        .html(
          "<h4>" + d.title + "</h4>" +  "<strong> FORMAT </strong> " + "</br>" + d.format + "</br>" + "<strong> TACTICS </strong> " + "</br>" + "<h6>" + d.focus + "</h6>"
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
      this.parentNode.parentNode.appendChild(this.parentNode); //the path group is on the top with in its parent group
      this.parentNode.parentNode.parentNode.appendChild(
        this.parentNode.parentNode
      );
      d3.select(this).transition().duration(300).style("fill", "#3479FF");
    })
    .on("mouseout", function (d) {
      div.transition().duration(200).style("opacity", 0);
      d3.select(this).transition().duration(300).style("fill", "white");
    });

  // TASKS

  // understanding

  g.append("rect")
    .classed("understanding", true)
    .attr("display", "block")
    .attr("width", "10px")
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
    .attr("transform", (d) => "translate(" + [5, d.size / 6 + 5] + ")");

  // diagnosis
  g.append("rect")
    .classed("diagnosis", true)
    .attr("display", "block")
    .attr("width", "10px")
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
    .attr("transform", (d) => "translate(" + [15, d.size / 6 + 5] + ")");

  // refinement
  g.append("rect")
    .classed("refinement", true)
    .attr("display", "block")
    .attr("width", "10px")
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
    .attr("transform", (d) => "translate(" + [25, d.size / 6 + 5] + ")");

  // EXPLANATION

  g.append("rect")
    .classed("expl-block", true)
    .attr("display", "block")
    .attr("width", "15px")
    .attr("height", function (d) {
      return sizeScale(d.explanation);
    })
    .attr("fill", "#eee")
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("transform", (d) => "translate(" + [5, 8 + d.size / 6] + ")");

  d3.selectAll(".glyph").each(function (d) {
    const thisExpl = d3.select(this).append("svg");
    for (let i = 1; i <= d.explanation; i++) {
      thisExpl
        .append("rect")
        .classed("grid", true)
        .attr("transform", (d) => "translate(" + [5, 8 + d.size / 6] + ")")
        .attr("y", function (d) {
          return i * 3;
        })
        .attr("width", "15px")
        .attr("height", "0.01px")
        .attr("fill", "none")
        .attr("stroke-width", ".2")
        .attr("stroke", "#0A0101")
        .attr("opacity", ".1");
    }
  });

  //MEDIUM

  g.append("rect")
    .classed("medium-block", true)
    .attr("display", "block")
    .attr("width", "15px")
    .attr("height", function (d) {
      return sizeScale(d.medium);
    })
    .attr("fill", function (d) {
      return color(d.scenario);
    })
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px")
    .attr("transform", (d) => "translate(" + [20, 8 + d.size / 6] + ")");

  d3.selectAll(".glyph").each(function (d) {
    const thisMedium = d3.select(this).append("svg");
    for (let i = 1; i <= d.medium; i++) {
      thisMedium
        .append("rect")
        .classed("grid", true)
        .attr("transform", (d) => "translate(" + [20, 8 + d.size / 6] + ")")
        .attr("y", function (d) {
          return i * 3;
        })
        .attr("width", "15px")
        .attr("height", "0.01px")
        .attr("fill", "none")
        .attr("stroke-width", ".2")
        .attr("stroke", "#0A0101")
        .attr("opacity", ".1");
    }
  });

  // tour

  g.append("rect")
    .classed("tour", true)
    .attr("display", "block")
    .attr("width", "40px")
    .attr("height", "2px")
    .attr("fill", function (d) {
      if (d.tour === "Guided") {
        return "black";
      } else return "white";
    })
    .attr("stroke", "black")
    .attr("stroke-width", "0.2px");

  // add users

  d3.selectAll(".glyph").each(function (d) {
    const thisSvg = d3.select(this).append("svg");

    for (let i = 1; i <= d.user; i++) {
      thisSvg
        .append("circle")
        .classed("user", true)
        .attr("cx", function (d) {
          return 10 + i * 5;
        })
        .attr("cy", function (d) {
          if (d.medium <= d.explanation) {
            return sizeScale(d.explanation) + 15;
          } else if (d.medium >= d.explanation) {
            return sizeScale(d.medium) + 15;
          } else if (d.medium === d.explanation) {
            return sizeScale(d.medium) + 15;
          } else {
            return sizeScale(d.medium) + 15;
          }
        })
        .attr("r", "1.5px")
        .attr("fill", "black")
        .attr("stroke-width", ".5")
        .attr("stroke", "#0A0101");
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
