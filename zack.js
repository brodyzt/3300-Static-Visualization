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
    let stackBarMinYear = 1970;
    let stackBarMaxYear = 2013;

    let stackBarXScale = d3.scale.linear()
        .domain([stackBarMinYear, stackBarMaxYear])
        .range([0, stackBarWidth]);

    let stackBarYScale = d3.scale.linear()
        .domain([0, 1])
        .range([stackBarHeight, 0]);

    // Create axis SVG components
    let stackBarXAxis = d3.svg.axis()
        .scale(stackBarXScale)
        .orient("bottom")
        .tickSize(-stackBarHeight)
        .tickFormat(d3.format(""))
    let stackBarYAxis = d3.svg.axis()
        .scale(stackBarYScale)
        .orient("left")
        .ticks(5)
        .tickSize(-stackBarWidth)
        .tickFormat(d3.format("%"))

    // Append axis SVG components to DOM
    stackBarSvg.append("g")
        .attr("transform", "translate(0," + (stackBarHeight) + ")")
        .call(stackBarXAxis);
    stackBarSvg.append("g")
        .attr("transform", "translate(0,0)")
        .call(stackBarYAxis);

    // Remove domain components garbage
    d3.selectAll("path.domain").remove();

    // Add Data to graph
    movieData.forEach(movie => {
        // console.log(movie)
        
    });
})