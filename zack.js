d3.json("testfailures.json", (error, movieData) => {

    // Output error to console if data can't be loaded
    if (error) {
        return console.warn(error);
    }

    // console.log(movieData);

    // Configure padding around graph
    let stackBarPadding = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }

    let stackBarContainerSvg = d3.select("svg#zack");

    let stackBarSvg = stackBarContainerSvg.append("g")
        .attr("transform", "translate(" + stackBarPadding.left + "," + stackBarPadding.top + ")");


    let stackBarWidth = stackBarContainerSvg.attr("width") - stackBarPadding.left - stackBarPadding.right;
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
    let tests = [
        'ok',
        'ok-disagree',
        'dubious',
        'dubious-disagree',
        'men',
        'men-disagree',
        'notalk',
        'notalk-disagree',
        'nowomen',
        'nowomen-disagree',

    ]

    let colors = d3.scale.category10();
    let verticalSpacing = 5.0

    movieData
        // .filter(x => x[0] >= startYear)
        .forEach((yearData, yearIndex) => {
            console.log(yearIndex)
            // console.log(movie)
            var currentY = stackBarHeight;

            tests.forEach((testName, index) => {
                // console.log(yearData[1][testName])
                // console.log("Year: " + yearData[0] + "; TestName: " + testName + "; " + yearData[1][testName]);
                let barTopY = stackBarYScale(yearData[1][testName]);
                let height = stackBarHeight - barTopY;
                // console.log("Testval: " + yearData[1][testName] + "; barTopY: " + String(barTopY) + "; height: " + height + "; currentY: " + currentY);
                stackBarSvg.append("rect")
                    .attr("width", stackBarXScale.rangeBand())
                    // .attr("height", stackBarYScale(parseFloat(yearData[1][testName])))
                    .attr("height", height - verticalSpacing / 2)
                    .attr("x", stackBarXScale(yearIndex))
                    .attr("y", barTopY - stackBarHeight + currentY)
                    .style("fill", colors(index >= 4 ? 0 : 1))

                // console.log(colors(index))
                currentY -= height;
            })

        });
})