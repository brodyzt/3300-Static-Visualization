d3.json("testfailures.json").then(movieData => {

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
        'ok': "Passes Bechdel",
        'ok-disagree': "Passes Bechdel (Disagreement)",
        'dubious': "Doubtful",
        'dubious-disagree': "Doubtful (Disagreement)",
        'men': "Only Talk About Men",
        'men-disagree': "Only Talk About Men (Disagreement)",
        'notalk': "Women Don't Talk to Each Other",
        'notalk-disagree': "Women Don't Talk to Each Other (Disagreement)",
        'nowomen': "No Women",
        'nowomen-disagree': "No Women (Disagreement)",
    }

    // Configure padding around graph
    let stackBarPadding = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
        betweenLegend: -250
    }


    let stackBarLegendWidth = 200;

    let stackBarContainerSvg = d3.select("svg#zack");


    let stackBarWidth = stackBarContainerSvg.attr("width") - stackBarPadding.left - stackBarPadding.right - stackBarLegendWidth;
    let stackBarHeight = stackBarContainerSvg.attr("height") - stackBarPadding.top - stackBarPadding.bottom;

    let stackBarSvg = stackBarContainerSvg.append("g")
        .attr("transform", "translate(" + (stackBarContainerSvg.attr("width") / 2.0 - stackBarWidth / 2.0) + "," + stackBarPadding.top + ")");


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

    let stackBarXScale = d3.scaleBand()
        .domain(years)
        .range([0, stackBarWidth])
        .paddingInner(0.1);

    console.log(stackBarXScale.bandwidth())

    let stackBarYScale = d3.scaleLinear()
        .domain([0, 1])
        .range([stackBarHeight, 0]);

    // Create axis SVG components
    let stackBarXAxis = d3.axisBottom()
        .scale(stackBarXScale)
        .tickSize(-20)
        .tickFormat(yearVal => {
            let lowerBound = yearVal * 2 + 1970;
            let upperBound = lowerBound + 1;
            return yearVal % 3 == 0 ? String(lowerBound) + "- " + String(upperBound) : ""
        })
    let stackBarYAxis = d3.axisLeft()
        .scale(stackBarYScale)
        .ticks(5)
        .tickSize(-stackBarWidth)
        .tickFormat(d3.format(".0%"))

    // Append axis SVG components to DOM
    let stackBarXAxisSVGComponent = stackBarSvg.append("g")
        .attr("transform", "translate(0," + (stackBarHeight) + ")")
        .attr("class", "x")
        .call(stackBarXAxis)

    d3.selectAll(".x .tick text")
        .call(labelGroup => {
            console.log(labelGroup)
            labelGroup.each(label => {
                let self = d3.select(this);
                console.log(self);
                let retrieved_text = self.text();
                console.log(retrieved_text)
                // self.text(null);

                if (retrieved_text !== undefined) {
                    console.log(retrieved_text)
                    let split_text = retrieved_text.split(" ")
                    self.text(null);
                    self.append("tspan")
                        .attr("x", 0)
                        .attr("dy", ".8em")
                        .text(split_text[0]);
                    self.append("tspan")
                        .attr("x", 0)
                        .attr("dy", ".8em")
                        .text(split_text[1]);
                }
            });
        });

    let stackBarYAxisSVGComponent = stackBarSvg.append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "y")
        .call(stackBarYAxis);

    stackBarXAxisSVGComponent.selectAll(".tick line").attr("stroke", "#000000").attr("transform", "translate(0,20)")
        .style("stroke-width", (d, i) => {
        console.log(i)
        console.log(this)
            // if (i % 3 != 0)  d3.select(this).remove();
            if (i % 3 == 0) {
                return "1px"
            } else {
                return "0px"
            }
        })
    stackBarXAxisSVGComponent.selectAll(".tick text").attr("y", 20).attr("dx", 0);


    stackBarYAxisSVGComponent.selectAll(".tick:first-of-type line").attr("stroke", "#000000").attr('stroke-width',
        '1px')
    stackBarYAxisSVGComponent.selectAll(".tick:not(first-of-type) line").attr("stroke", "#000000").attr('stroke-width',
        '0px')
    stackBarYAxisSVGComponent.selectAll(".tick text").attr("y", 0).attr("dx", -10);

    // Add left edge for x axis
    stackBarSvg.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", stackBarHeight)
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .attr("class", "yAxisBoundary")

    // Add left edge for y axis
    stackBarSvg.append("line")
        .attr("x1", 0)
        .attr("x2", stackBarWidth)
        .attr("y1", stackBarHeight)
        .attr("y2", stackBarHeight)
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .attr("class", "yAxisBoundary")


    // Remove domain components garbage
    d3.selectAll("path.domain").remove();

    // Add Data to graph

    let stackBarColorScale = d3.schemeCategory10;
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
                    .attr("width", stackBarXScale.bandwidth)
                    // .attr("height", stackBarYScale(parseFloat(yearData[1][testName])))
                    .attr("height", Math.max(height - verticalSpacing, 0))
                    .attr("x", stackBarXScale(yearIndex))
                    .attr("y", barTopY - stackBarHeight + currentY)
                    .style("fill", stackBarColorScale[Math.floor(index / 2.0) * 2.0])
                    .style("opacity", 0.75 - (index % 2) * 0.35)

                // console.log(colors(index))
                currentY -= height;
            })

        });


    // Create legend for colors
    let stackBarLegendHeight = stackBarHeight / 3;

    let stackBarLegend = stackBarContainerSvg.append("g")
        .attr("class", "legend")
        .attr("width", stackBarLegendWidth)
        .attr("height", stackBarLegendHeight)
        .attr("transform", "translate(" + (stackBarContainerSvg.attr("width") / 2.0 + stackBarWidth / 2.0 + stackBarPadding.betweenLegend) + "," + (0) +
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
            .style("fill", stackBarColorScale[Math.floor(index / 2.0) * 2.0])
            .style("opacity", 0.75 - (index % 2) * 0.35)

        stackBarCurrentLegendItem.append("text")
            .text(stackBarTestKeyToFullNameDict[testName])
            .attr("dx", "25")
            .attr("dy", "15")
            .attr("font-size", "10")
            .attr("font-family", "Arial")
            .attr("id", testName + "_label")
    });


})