let svg_height = 800;
let svg_width = 1200;

let svg = d3.select("svg#eldor")
    .attr("viewBox", "0 0 " + svg_width + " " + svg_height)
    .classed("svg-content", true);
let margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};
let chartWidth = svg_width - margin.left - margin.right;
let chartHeight = svg_height - margin.top - margin.bottom;

d3.json("eldor.json").then(function (movieData) {
    // Cast the data into appropriate types
    movieData.forEach((d, i) => {
        d['year'] = Number(d["year"]);
        d['budget13'] = Number(d["budget13"]);
        d['domGross'] = Number(d["domGross"]);
        d['intGross'] = Number(d["intGross"]);
        d['imdbRating'] = Number(d["imdbRating"]);
    });
    
    // filter the movieData
    movieData = movieData.filter(d => !isNaN(d['budget13']) && !isNaN(d['domGross']) && !isNaN(d['intGross']));

    // Prepare the scales
    const budgetMin = d3.min(movieData, d => d['budget13']);
    const budgetMax = d3.max(movieData, d => d['budget13']);
    const budgetScale = d3.scaleLog().domain([budgetMin-1000, budgetMax]);

    const ratingMin = d3.min(movieData, d => d['imdbRating']);
    const ratingMax = d3.max(movieData, d => d['imdbRating']);
    const ratingScale = d3.scaleLinear().domain([ratingMin, ratingMax]);

    const yearMin = 1965;
    const yearMax = 2015;
    const yearScale = d3.scaleLinear().domain([yearMin, yearMax]);

    const xScale = yearScale.range([0, chartWidth]); // x axis
    const yScale = budgetScale.range([chartHeight, 0]); // y axis
    const rScale = ratingScale.range([ratingMin, ratingMax]); // radius

    // X axis 
    let bottomAxis = d3.axisBottom(xScale).tickFormat(d3.format(""));
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + chartHeight) + ")")
        .call(bottomAxis);

    // Y axis 
    let leftAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".0s"));
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(leftAxis);

    // add a canvas to svg  
    let scatter = svg.append("g")
        .attr("id", "scatter")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let dict = {}
    // add the circles
    movieData.forEach((d, i) => {
        let x = xScale(d['year']) + Math.random() * 20 - 10;
        let y = yScale(d['budget13']);
        let r = rScale(d['imdbRating']);
        let bin = (d['binary'] == "PASS") ? "blue" : "red";

        // collect the yearly pass/fail count
        if (dict[d["year"]] == undefined) {
            dict[d["year"]] = {
                'pass': 0,
                'fail': 0,
                "year": d["year"]
            };
        };
        if (d['binary'] == "PASS") {
            dict[d["year"]].pass += 1;
        } else {
            dict[d["year"]].fail += 1;
        };

        let circle = scatter.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 8)
            .attr("opacity", 0.6)
            .style("fill", bin)
            .attr("title", d['title'])
            .attr("year", d['year'])
            .attr("rating", d['imdbRating'])
            .attr("binary", d['binary'])
            .attr("domGain", d['domGain'])
            .attr("intGain", d['intGain']);
    });

    // let lScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, chartHeight - 160]);
    // let rightAxis = d3.axisRight(lScale);
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(" + (chartWidth + margin.left) + "," + margin.top + ")")
    //     .call(rightAxis);
    // let passPath = d3.line().x(d => xScale(d.year)).y(d => lScale(100 * (d["pass"] / (d["pass"] + d["fail"]))));
    // d3.select("g#scatter")
    //     .append("path")
    //     .attr("stroke", 'blue')
    //     .attr("stroke-width", 2)
    //     .attr("opacity", 0.5)
    //     .attr("fill-opacity", 0)
    //     .datum(Object.values(dict))
    //     .attr("d", passPath);

    // let pfillData = Object.values(dict).concat([{
    //     'pass': 0,
    //     'fail': 1,
    //     "year": 2013
    // }, {
    //     'pass': 0,
    //     'fail': 1,
    //     "year": 1970
    // }]);
    // let pfillPath = d3.line().x(d => xScale(d.year)).y(d => lScale(100 * (d["pass"] / (d["pass"] + d["fail"]))));
    // d3.select("g#scatter")
    //     .append("path")
    //     .attr("stroke", 'blue')
    //     .attr("stroke-width", 0)
    //     .attr("fill", "blue")
    //     .attr("opacity", 0.5)
    //     .attr("fill-opacity", 0.1)
    //     .datum(pfillData)
    //     .attr("d", pfillPath);

    // let failPath = d3.line().x(d => xScale(d.year)).y(d => lScale(100 * (d["fail"] / (d["pass"] + d["fail"]))));
    // d3.select("g#scatter")
    //     .append("path")
    //     .attr("stroke", 'red')
    //     .attr("stroke-width", 2)
    //     .attr("opacity", 0.5)
    //     .attr("fill-opacity", 0)
    //     .datum(Object.values(dict))
    //     .attr("d", failPath);

    // let fillData = Object.values(dict).concat([{
    //     'pass': 1,
    //     'fail': 0,
    //     "year": 2013
    // }]);
    // let fillPath = d3.line().x(d => xScale(d.year)).y(d => lScale(100 * (d["fail"] / (d["pass"] + d["fail"]))));
    // d3.select("g#scatter")
    //     .append("path")
    //     .attr("stroke", 'red')
    //     .attr("stroke-width", 0)
    //     .attr("fill", "red")
    //     .attr("opacity", 0.5)
    //     .attr("fill-opacity", 0.1)
    //     .datum(fillData)
    //     .attr("d", fillPath);
    // //     console.log(fillData);

    svg.append("text")
        .attr("transform", "translate(" + (margin.left + chartWidth / 2.0) + "," + (margin.top + chartHeight + margin.bottom / 2.0) + ")")
        .style("text-anchor", "middle")
        .attr("class", "axesLabel")
        .text("Year")
    svg.append("text")
        .attr("transform", "translate(" + (margin.left / 2.0 - 20) + "," + (chartHeight / 2.0 + margin.top) + ")rotate(270)")
        .style("text-anchor", "middle")
        .attr("class", "axesLabel")
        .text("Budget ($)")
    
    svg.append("circle")
        .style("fill", "red")
        .attr("cx", xScale(1973))
        .attr("cy", 50)
        .attr("r", 10);
    svg.append("text")
        .attr("transform", "translate(" + xScale(1974) + "," + 55 + ")")
        .style("font-size", "15")
        .text("Failed Bechdel Test");

    svg.append("circle")
        .style("fill", "blue")
        .attr("cx", xScale(1985))
        .attr("cy", 50)
        .attr("r", 10);
    svg.append("text")
        .attr("transform", "translate(" + xScale(1986) + "," + 55 + ")")
        .style("font-size", "15")
        .text("Passed Bechdel Test");
});