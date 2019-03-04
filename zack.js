d3.json("testfailures.json").then(movieData => {

        /* List of Keywords for Each Bechdel Failure Category */
        let stackBarTestNames = [
            'men', // women talk to each other, but only about men
            'men-disagree',
            'notalk', // women don't talk to each other
            'notalk-disagree',
            'nowomen', // no women in the movie
            'nowomen-disagree',

            /* Passing categories that aren't being included in this graph */
            // 'ok',                        // passes bechdel test
            // 'ok-disagree',               // passes bechdel test (not unanimous opinion)
            // 'dubious',                   // doubtful that it passes the test
            // 'dubious-disagree',

        ]

        /* Mapping of Category Keys to Full Names */
        let stackBarTestKeyToFullNameDict = {
            'ok': "Passes Bechdel",
            'ok-disagree': "Passes Bechdel (Disagreement)",
            'dubious': "Doubtful",
            'dubious-disagree': "Doubtful (Disagreement)",
            'men': "Only Talk About Men",
            'men-disagree': "Only Talk About Men (Disagreement)",
            'notalk': "No W2W",
            'notalk-disagree': "No W2W (Disagreement)",
            'nowomen': "No Women",
            'nowomen-disagree': "No Women (Disagreement)",
        }

        /* Configure padding around graph */
        let stackBarPadding = {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100,
            betweenLegend: -250
        }
        
        
        let stackBarContainerSvgWidth = 1200;
        let stackBarContainerSvgHeight = 800;

        let stackBarContainerSvg = d3.select("svg#stackBarGraph")
            // .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + stackBarContainerSvgWidth + " " + stackBarContainerSvgHeight)
            .classed("svg-content", true);

        let stackBarWidth = stackBarContainerSvgWidth - stackBarPadding.left - stackBarPadding.right;
        let stackBarHeight = stackBarContainerSvgHeight - stackBarPadding.top - stackBarPadding.bottom;

        console.log(stackBarWidth)
        console.log(stackBarHeight)

        let stackBarSvg = stackBarContainerSvg.append("g")
            .attr("transform", "translate(" + (stackBarContainerSvgWidth / 2.0 - stackBarWidth / 2.0) + "," + stackBarPadding.top + ")");

        let startYear = 1990;
        let endYear = 2013;
        years = movieData.map((x, i) => i)

        let stackBarXScale = d3.scaleBand()
            .domain(years)
            .range([0, stackBarWidth])
            .paddingInner(0.1)
            .paddingOuter(0.02);

        let stackBarYScale = d3.scaleLinear()
            .domain([0, 1])
            .range([stackBarHeight, 0]);

        /* Create axis SVG components */
        let stackBarXAxis = d3.axisBottom()
            .scale(stackBarXScale)
            .tickSize(-10)
            .tickFormat(yearVal => {
                let lowerBound = yearVal * 2 + 1970;
                let upperBound = lowerBound + 1;
                return yearVal % 3 == 0 ? String(lowerBound) + "- " + String(upperBound) : ""
            })
        let stackBarYAxis = d3.axisLeft()
            .scale(stackBarYScale)
            .ticks(5)
            .tickSize(10)
            .tickFormat(d3.format(".0%"))

        /* Append axis SVG components to DOM */
        let stackBarXAxisSVGComponent = stackBarSvg.append("g")
            .attr("transform", "translate(0," + (stackBarHeight) + ")")
            .attr("class", "x")
            .call(stackBarXAxis)

        let stackBarYAxisSVGComponent = stackBarSvg.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "y")
            .call(stackBarYAxis);

        stackBarXAxisSVGComponent.selectAll(".tick line").attr("stroke", "#000000").attr("transform", "translate(0,10)")
            .style("stroke-width", (d, i) => {
                if (i % 3 == 0) {
                    return "2px"
                } else {
                    return "0px"
                }
            })
        stackBarXAxisSVGComponent.selectAll(".tick text").attr("y", 10).attr("dx", 0);


        stackBarYAxisSVGComponent.selectAll(".tick:not(first-of-type) line")
            .attr("stroke", "#000000")
            .attr('stroke-width', '2px')
            .attr("transform", "translate(0,-0.5)")
        stackBarYAxisSVGComponent.selectAll(".tick text").attr("y", 0).attr("dx", 0);

        /* Add left edge for x axis */
        stackBarSvg.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", stackBarHeight)
            .attr("stroke", "#000000")
            .attr("stroke-width", "2px")
            .attr("class", "yAxisBoundary")

        /* Add left edge for y axis */
        stackBarSvg.append("line")
            .attr("x1", 0)
            .attr("x2", stackBarWidth)
            .attr("y1", stackBarHeight)
            .attr("y2", stackBarHeight)
            .attr("stroke", "#000000")
            .attr("stroke-width", "2px")
            .attr("class", "yAxisBoundary")


        /* Add axes labels */
        stackBarContainerSvg.append("text").
        attr("transform", "translate(" + (stackBarPadding.left + stackBarWidth / 2.0) + "," + (stackBarPadding.top + stackBarHeight + stackBarPadding.bottom / 2.0) + ")")
            .style("text-anchor", "middle")
            .attr("class", "axesLabel")
            .text("Year")
        stackBarContainerSvg.append("text")
            .attr("transform", "translate(" + (stackBarPadding.left / 2.0 - 10) + "," + (stackBarHeight / 2.0 + stackBarPadding.top) + ")rotate(270)")
            .style("text-anchor", "middle")
            .attr("class", "axesLabel")
            .text("Percentage In Category")


        // Remove domain components garbage
        d3.selectAll("path.domain").remove();

        /* Add Data to graph */
        let stackBarColorScale = [d3.schemeCategory10[2], "#ff8300", "red"];
        let verticalSpacing = 1;

        movieData
            .forEach((yearData, yearIndex) => {
                var currentY = stackBarHeight;

                stackBarTestNames.forEach((testName, index) => {
                    let barTopY = stackBarYScale(yearData[1][testName]);
                    let height = stackBarHeight - barTopY;
                    stackBarSvg.append("rect")
                        .attr("width", stackBarXScale.bandwidth)
                        .attr("height", Math.max(height - verticalSpacing, 0))
                        .attr("x", stackBarXScale(yearIndex))
                        .attr("y", barTopY - stackBarHeight + currentY)
                        .style("fill", stackBarColorScale[Math.floor(index / 2.0)])
                        .style("opacity", 0.75 - (index % 2) * 0.25)

                    currentY -= height;
                })

            });


        /* Creating legend for colors */
        let stackBarLegendHeight = stackBarHeight / 4;
        let stackBarLegendWidth = 200;
        let stackBarLegendInset = 725;

        /* Add SVG grouping element for legend */
        let stackBarLegend = stackBarSvg.append("g")
            .attr("class", "legend")
            .attr("width", stackBarLegendWidth)
            .attr("height", stackBarLegendHeight)
            .attr("transform", "translate(" + stackBarLegendInset + "," + (0) +
                ")");

        /* Add an item for each category to the legend */
        stackBarTestNames.reverse().forEach((testName, index) => {

            /* Adding SVG grouping element for each category */
            let stackBarCurrentLegendItem = stackBarLegend.append("g")
                .attr("class", "legend-item")
                .attr("width", stackBarLegendWidth)
                .attr("transform", "translate(0," +
                    (index * stackBarLegendHeight / (stackBarTestNames.length * 1.0)) +
                    ")");

            /* Add rect sample color for category */
            stackBarCurrentLegendItem.append("rect")
                .attr("width", "20")
                .attr("height", "20")
                .attr("id", testName)
                .style("fill", stackBarColorScale[Math.floor((stackBarTestNames.length - 1 - index) / 2.0)])
                .style("opacity", 0.75 - (index % 2) * 0.25)

            /* Add decription text for category */
            stackBarCurrentLegendItem.append("text")
                .text(stackBarTestKeyToFullNameDict[testName])
                .attr("dx", "25")
                .attr("dy", "15")
                .attr("id", testName + "_label")
        });


    })
    .catch(error => {
        console.log("Your Error is this:" + error.message);
    });