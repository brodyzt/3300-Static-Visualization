d3.json("testfailures.json", (error, movieData) => {

    // Output error to console if data can't be loaded
    if (error) {
        return console.warn(error);
    }

    // console.log(movieData);


    let stackBarTestNames = [
        // 'ok',                        // passes bechdel test
        // 'ok-disagree',               // passes bechdel test (not unanimous opinion)
        // 'dubious',                   // doubtful that it passes the test
        // 'dubious-disagree',
        'men', // women talk to each other, but only about men
        'men-disagree',
        'notalk', // women don't talk to each other
        'notalk-disagree',
        'nowomen', // no women in the movie
        'nowomen-disagree',

    ]

    let stackBarTestKeyToFullNameDict = {
        'ok': "Passes Bechdel Test",
        'ok-disagree': "Passes Bechdel Test (Some Disagreement)",
        'dubious': "Doubtful",
        'dubious-disagree': "Doubtful ",
        'men': "Only Talk About Men",
        'men-disagree': "Only Talk About Men (Some Disagreement)",
        'notalk': "Women Do Not Talk To Each Other",
        'notalk-disagree': "Women Do Not Talk To Each Other (Some Disagreement)",
        'nowomen': "No Women In Movie",
        'nowomen-disagree': "No Women In Movie (Some Disagreement)",
    }

    // Configure padding around graph
    let stackBarPadding = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }


    let stackBarLegendWidth = 300;

    let stackBarContainerSvg = d3.select("svg#zack");

    let stackBarSvg = stackBarContainerSvg.append("g")
        .attr("transform", "translate(" + stackBarPadding.left + "," + stackBarPadding.top + ")");


    let stackBarWidth = stackBarContainerSvg.attr("width") - stackBarPadding.left - stackBarPadding.right - stackBarLegendWidth;
    let stackBarHeight = stackBarContainerSvg.attr("height") - stackBarPadding.top - stackBarPadding.bottom;

    console.log(stackBarWidth);

    // Create scales for axes
    // let stackBarMinYear = 1970;
    // let stackBarMaxYear = 2013;
    let startYear = 1990;
    let endYear = 2013;
    // let years = [...Array(endYear - startYear + 1).keys()]
    //     .map(x => x + startYear);
    years = movieData.map((x, i) => i)

    console.log(years)

    let stackBarXScale = d3.scale.ordinal()
        .domain(years)
        .rangeRoundBands([0, stackBarWidth], 0.1);

    let stackBarYScale = d3.scale.linear()
        .domain([0, 1])
        .range([stackBarHeight, 0]);

    // Create axis SVG components
    let stackBarXAxis = d3.svg.axis()
        .scale(stackBarXScale)
        .orient("bottom")
        .tickSize(-stackBarHeight)
        .tickFormat(yearVal => yearVal % 3 == 0 ? yearVal : "")
    let stackBarYAxis = d3.svg.axis()
        .scale(stackBarYScale)
        .orient("left")
        .ticks(5)
        .tickSize(-stackBarWidth)
        .tickFormat(d3.format("%"))

    // Append axis SVG components to DOM
    let stackBarXAxisSVGComponent = stackBarSvg.append("g")
        .attr("transform", "translate(0," + (stackBarHeight) + ")")
        .call(stackBarXAxis);
    let stackBarYAxisSVGComponent = stackBarSvg.append("g")
        .attr("transform", "translate(0,0)")
        .call(stackBarYAxis);

    stackBarYAxisSVGComponent.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr('stroke-width',
        '.75px')
    stackBarYAxisSVGComponent.selectAll(".tick text").attr("y", 0).attr("dx", 0);

    // Remove domain components garbage
    d3.selectAll("path.domain").remove();

    // Add Data to graph

    let stackBarColorScale = d3.scale.category10();
    let verticalSpacing = 1;

    movieData
        // .filter(x => x[0] >= startYear)
        .forEach((yearData, yearIndex) => {
            // console.log(movie)
            var currentY = stackBarHeight;

            stackBarTestNames.forEach((testName, index) => {
                // console.log(yearData[1][testName])
                // console.log("Year: " + yearData[0] + "; TestName: " + testName + "; " + yearData[1][testName]);
                let barTopY = stackBarYScale(yearData[1][testName]);
                let height = stackBarHeight - barTopY;
                // console.log("Testval: " + yearData[1][testName] + "; barTopY: " + String(barTopY) + "; height: " + height + "; currentY: " + currentY);
                stackBarSvg.append("rect")
                    .attr("width", stackBarXScale.rangeBand())
                    // .attr("height", stackBarYScale(parseFloat(yearData[1][testName])))
                    .attr("height", Math.max(height - verticalSpacing, 0))
                    .attr("x", stackBarXScale(yearIndex))
                    .attr("y", barTopY - stackBarHeight + currentY)
                    .style("fill", stackBarColorScale(Math.floor(index / 2.0) * 2.0))
                    .style("opacity", 1 - (index % 2) * 0.5)

                // console.log(colors(index))
                currentY -= height;
            })

        });


    // Create legend for colors
    let stackBarLegendHeight = stackBarHeight / 2;

    let stackBarLegend = stackBarSvg.append("g")
        .attr("class", "legend")
        .attr("width", stackBarLegendWidth)
        .attr("height", stackBarLegendHeight)
        .attr("transform", "translate(" + (stackBarPadding.left + stackBarWidth - stackBarLegendWidth) + "," + (stackBarPadding.top) +
            ")");

    stackBarTestNames.forEach((testName, index) => {
        let stackBarCurrentLegendItem = stackBarLegend.append("g")
            .attr("class", "legend-item")
            .attr("width", stackBarLegendWidth)
            .attr("transform", "translate(0," +
                (index * stackBarLegendHeight / (stackBarTestNames.length * 1.0)) +
                ")");


        stackBarCurrentLegendItem.append("rect")
            .attr("width", "20")
            .attr("height", "20")
            .attr("id", testName)
            .style("fill", stackBarColorScale(Math.floor(index / 2.0) * 2.0))
            .style("opacity", 1 - (index % 2) * 0.5)

        stackBarCurrentLegendItem.append("text")
            .text(stackBarTestKeyToFullNameDict[testName])
            .attr("dx", "25")
            .attr("dy", "15")
            .attr("font-size", "10")
            .attr("font-family", "Arial")
            .attr("id", testName + "_label")
    });


})