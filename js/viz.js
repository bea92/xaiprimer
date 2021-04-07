$( document ).ready(function() {
console.log("Drawing visualizations");


// various scales, could be optimized
let colors = d3.scaleOrdinal()
  .domain(["ZERO", "ONE", "TWO", "THREE", "FOUR"])
  .range(["#EA1515","#9fc6c3","#FFFFFF","#a6adac", "#FF5500"]);

let celebSel = d3.select("#celeb")

let sizeGlyph = d3.scaleSqrt()
.range([4,35]);


// caricamento dataset
d3.tsv("data/glyphs.tsv", function(error, data) {
	if (error) throw error;

	sizeGlyph.domain(d3.extent(data, function(d) { 
		return +d.medium; }
		));
// scatterplot


	// databinding sui div degli eventi
	let container = celebSel.selectAll(".event")
	.data(data)
	.enter()
	.append("div")
	.classed("event", true)

	// creazione glifo in SVG
	let glyph = container.append("svg")
	.attr("width", 100)
	.attr("height", 100)
	.classed("glyph", true)

	// morti
	glyph.append("circle")
	.attr("cx", function(d) {return d.x })
	.attr("cy", function(d) {return d.y })
	.attr("r", function(d) { return sizeGlyph(d.medium) })
	.attr("fill", function(d) { return colors(d.scenario) })
	.classed("highEvents", true)


	// disegno delle linee per il numero di armi utilizzate
	d3.selectAll(".item").each(function(d, o) {
		let thisSvg = d3.select(this).select('svg');

		for ( let i = 1; i <= +d.user; i++) {

			thisSvg.append("line")
			.attr("x1", 25)
			.attr("x2", 35)
			.attr("y1", i*3.6)
			.attr("y2", i*3.6)
			.attr("stroke", "#0A0101")
			.attr("stroke-width", 1.5);

		}

	})

	// data nel div
	container.append("p")
	.classed("year", true)
	.text(function(d) {
		return d.year
	})

	// gender nel div
	container.append("p")
	.classed("gender", true)
	.text(function(d) {
		if(d.gender === "Male") {
			return "M"
		// } else if(d.gender === "Male/Female") {
		// 	return "M & F"
		} else {
			return "F"
		}
	})
	.attr("fill", "black")

	// stato finale dei perpetrators
	container.append("p")
	.style("opacity", function(d) {
		switch(d.state){
			case "unknown":
			return 0.3;
			default:
			return 1;
		}
	})
	.classed("state", true)
	.text(function(d){
		switch(d.state){
			case "killed":
			return "×";
			break;
			case "suicide":
			return "•";
			break;
			case "arrested":
			return "#";
			break;
			case "unknown":
			return "?";
			break;
			case "escaped":
			return "~";
			break;
		} 
	})
	
	// location negli USA
	container.append("p")
	.classed("location", true)
	.text(function(d) {
		return d.location
	})

	container.append("p")
	.text(function(d) {
		return d.title
	})

	// interazioni desktop
	d3.selectAll('.event').on("mouseenter", function(d){


		d3.selectAll(".event").style("opacity", 0.1)
		d3.select(this).style("opacity", 1)

		d3.select("#details")
		.text(d.perpetrator + ", " + d.gender + ", injured and killed " + d.kills + " people using an arsenal of " + d.guns + " gun(s)")
	})

	d3.selectAll('.event').on("mouseleave", function(d){

		d3.selectAll(".event").style("opacity", 1)
		
		d3.select("#details")
		.style("opacity", 1)
		.text("")
	})

	// interazioni touch
	d3.selectAll('.event').on("touchstart", function(d){

		d3.selectAll(".event").style("opacity", 0.2)
		d3.select(this).style("opacity", 1)
		
		d3.select("#details")
		.text(d.perpetrator + ", " + d.gender + ", injured and killed " + d.kills + " people using " + d.guns + "guns")
	})

	d3.selectAll('.event').on("touchend", function(d){

		d3.selectAll(".event").style("opacity", 1)
		
		d3.select("#details")
		.style("opacity", 1)
		.text("")
	})
	
})

/////////////////// Legislations

let billsWidth = d3.selectAll("#legislations-timeline").node().getBoundingClientRect().width,
billsHeight = 50,
billsPadding = window.innerWidth * 0.08;

let parseTimeline = d3.timeParse("%Y");

let timeline = d3.scaleTime()
.range([0 + billsPadding, billsWidth - billsPadding]);

let typology = d3.scalePoint()
.domain(["act","bill","extra","law","none"])
.range([30, billsHeight - 0])

let order = d3.scaleLinear()
.domain([1,3])
.range([billsHeight - 30, 5])

let locality = d3.scaleOrdinal()
.domain(["Act","Bill","Event"])
.range(["#010A0A","#999999","#FFFFFF"])

let timelineAxis = d3.axisBottom(timeline).ticks(10)
.tickFormat(d3.timeFormat("%Y"))
.tickSize(billsHeight - 20);

let bills = d3.select('#legislations-timeline').append('svg')
.attr("width", billsWidth)
.attr("height", billsHeight);

let g = bills.append("g");

let billsTooltip = d3.select('.bills-tooltip');

d3.tsv("data/legislations.tsv", function(error, data) {
	if (error) throw error;

	timeline.domain(d3.extent(data, function(d) { 
		d.year = parseTimeline(d.year);
		return d.year;
	}));

	bills.append("g")
	.call(timelineAxis)
	.classed("timelineAxis", true);

	g.append("rect")
	.attr("width", billsWidth)
	.attr("height", billsHeight)
	.classed("escape", true)
	.attr("opacity", "0");

	bills.selectAll("rect")
	.data(data)
	.enter()
	.append("rect")
	.attr("x", d => { return timeline(+d.year) - ( (billsWidth - billsPadding) / 54 ) / 2})
	.attr("y", d => { return order(d.id)})
	.attr("width", (billsWidth - billsPadding) / 54)
	.attr("height", 7)
	.attr("fill", d => { return locality(d.type)})
	.style("stroke", "black")
	.style("stroke-width", 1)
	.classed("bills", true)

	d3.selectAll('.bills').on("click", function(d){

		billsTooltip.selectAll("p").remove()

		d3.select(".escape").classed("active", true)

		d3.selectAll(".bills").attr("fill", "rgba(0,0,0,0)")
		d3.select(this).attr("fill", d => { return locality(d.type)})

		billsTooltip.append("p")
		.classed("code", true)
		.text(d.code + ", " + d.where + " " + d.type)

		billsTooltip.append("p")
		.classed("summary", true)
		.text(d.info)

		$(".bills-tooltip").animate({
			height: 170
		}, 600, "easeOutCubic" );
	});


	d3.selectAll(".escape").on("click", function(d){

		billsTooltip.selectAll("p").remove()

		d3.select(".escape").classed("active", false)

		d3.selectAll(".bills").attr("fill", d => { return locality(d.type)})

		$(".bills-tooltip").animate({
			height: 0
		}, 600, "easeOutCubic" );
	});

// console.log(JSON.stringify(data, null, "\t"));

});

/////////////////// Bloodstream

let bloodstream = d3.select("#bloodstream").append("svg")
.attr("width", billsWidth)
.attr("height", 150);

let stream = bloodstream.append("g");

let bloodtimeAxis = d3.axisBottom(timeline).ticks(10)
.tickFormat(d3.timeFormat("%Y"))
.tickSize(130);

d3.csv('data/bloodstream.csv', function(error, data) {
  if (error) throw error;

  data.forEach(function(d) {
    d.year = +d.year;
    d.fat = +d.fat;
    d.inj = +d.inj;
  });


  let keys = (["inj", "fat"]);


  let stack = d3.stack()
  .keys(keys)

  .order(d3.stackOrderNone)
  .offset(d3.stackOffsetZero);

  let series = stack(data);

          //set the axis span to fit the data
          let x = d3.scaleLinear()
          .domain(d3.extent(data, function(d) {
            d.year = parseTimeline(d.year);
            d.year = +d.year;
            return d.year;
          }))
          .range([billsPadding, billsWidth - billsPadding]);

          let xAxis = d3.axisBottom(x);

          let y = d3.scaleLinear()
          .domain([0, d3.max(series, function(layer) {
            return d3.max(layer, function(d) {
              return d[0] + d[1];
            });
          })])
          .range([5, 250]);

          let victimAxis = d3.axisLeft(y).ticks(4).tickSize(billsWidth - window.innerWidth * 0.15).tickPadding(10);

          // console.log(y.domain())

          //set colors
          let z = d3.scaleOrdinal()
          .range(["#EA1515", "#AA0F0F"]);

          //convert bounding lines into areas
          let area = d3.area()
          .x(function(d) {
              // console.info('in area function', d);
              // console.log(d.data.year);
              return timeline(d.data.year);
            })
          .y0(function(d) {
            return y(d[0]);
          })
          .y1(function(d) {
            return y(d[1]);
          })
          .curve(d3.curveCatmullRom);

          //append the paths and fill in the areas
          stream.selectAll("path")
          .data(series)
          .enter().append("path")
          .attr("d", area)
          .style("fill", function() {
            return z(Math.random());
          });

          //append the x axis
          stream.append("g")
          .call(bloodtimeAxis)
          .classed("timelineAxis", true);

          //append the x axis
          stream.append("g")
          .call(victimAxis)
          .attr("transform", "translate(" + (billsWidth - billsPadding ) + ",0)")
          .classed("bloodAxis", true);

        });

});
