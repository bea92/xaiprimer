const margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = 1500,
  height = 700 - margin.top - margin.bottom;

// set the ranges
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// define the size
const sizeValue = (d) => d.medium;

// define the color
const colorValue = (d) => d.explanation;

// define the color
const colorValue2 = (d) => d.format;

console.log(colorValue2)

// define users
const usersValue = (d) => +d.user;

// Scale the range of the data
const sizeScale = d3.scaleSqrt().range([0, 6]);

let color = d3
  .scaleOrdinal()
  .domain(["ZERO", "ONE", "TWO", "THREE", "FOUR"])
  .range(["transparent", "#FFD039", "#FFB237", "#FF9535", "#EA1515"]);

let color2 = d3.scaleOrdinal()
  .range(["#EA1515","#9fc6c3","#FFFFFF","#a6adac", "#FF5500"]);

let veri = d3.scaleOrdinal().domain(["0", "1"]).range(["#000", "#ddd"]);

const radians = 0.0174532925;

let orbitRadius = d3
  .scaleLinear()
  .domain([0, 8]) //number of planets
  .range([90, 45]); //you may need adjust this later

let angle = d3
  .scaleLinear()
  .domain([0, 9]) //number of planets + 1
  .range([0, 360]); //you may need adjust this late

let div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);

// Get the data
d3.tsv("data/glyphs.tsv").then(function (data) {
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
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// compute the density data
  var densityData = d3.contourDensity()
  .x(function(d) { return x(d.x); })   // x and y = column name in .csv input data
  .y(function(d) { return y(d.y); })
  .size([width, height])
  .bandwidth(20)    // smaller = more precision in lines = more lines
  (data)

// Add the contour: several "path"
svg
  .selectAll("path")
  .data(densityData)
  .enter()
  .append("path")
    .attr("d", d3.geoPath())
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 0.4)
    .attr("opacity", .8)

  // disegno delle linee per il numero di armi utilizzate

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("g")
    .classed("item", true)
    .append("circle")
    .attr("r", (d) => sizeScale(sizeValue(d)))
    .attr("fill", (d) => color(colorValue(d)))
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .on("mouseover", function(d) {		
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div	.html((d.title) + "</br>" + (d.venue) + "</br>" + (d.format))
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });;

  d3.selectAll(".item")
    .append("circle")
    .classed("veri", true)
    .attr("display", "block")
    .attr("r", (d) => sizeScale(sizeValue(d)) + 3)
    .attr("fill", "none")
    .attr("stroke", (d) => veri(colorValue(d)))
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y));

  d3.selectAll(".item")
    .append("text")
    .classed("location", true)
    .attr("x", (d) => x(d.x) - 30)
    .attr("y", (d) => y(d.y) + 8)
    .text(function (d) {
      return d.format;
    });

    var r = 200,
    w = r * 3,
    h = w,
    rad = Math.PI/180,
    interval = 360/data.length;
    
  d3.selectAll(".item").each(function (d) {
    const thisSvg = d3.select(this).append("svg");

    for (let i = 1; i <= +d.user; i++) {
      thisSvg
        .append("circle")
        .attr("cx", (d) => x(d.x) + i*3)
        .attr("cy", (d) => y(d.y) + i*3)
        .attr("r", "1px")
        .attr("fill", "black")
        .attr("stroke", "#0A0101")
        .attr("stroke-width", 1.5)
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
