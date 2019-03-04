let movieData = []
d3.csv("original_with_ratings.csv").then(function (data) {
    movieData = data
    let timeGraphContainerSvg = d3.select("svg#timeGraph");
    let padding = {
        "top": 100,
        "bottom": 100,
        "right": 100,
        "left": 100
    };

    
    let timeGraphWidth = timeGraphContainerSvg.attr("width") - padding.left - padding.right;
    let timeGraphHeight = timeGraphContainerSvg.attr("height") - padding.top - padding.bottom;

    // console.log(timeGraphHeight)


    let svg = timeGraphContainerSvg.append("g")
        .attr("transform", "translate(" + (timeGraphContainerSvg.attr("width") / 2.0 - timeGraphWidth / 2.0) + "," + padding.top + ")")

    // console.log("here")

    movieData.forEach(function (data, index) {
        data['year_num'] = Number(data['year'])
        data['imdb_rating_num'] = Number(data['imdbRating'])
    });

    movieData = movieData.filter(d_point =>
        isNaN(d_point['imbd_rating_num']) === true
    );
    let yearMax = d3.max(movieData, function (data) {
        return data['year'];
    });

    let rateMin = d3.min(movieData, function (data) {
        return data['imdb_rating_num'];
    });

    let rateMax = d3.max(movieData, function (data) {
        return data['imdb_rating_num'];
    });
    let yearScale = d3.scaleLinear().domain([1980, 2015]).range([0, timeGraphWidth]);
    let ratingScale = d3.scaleLinear().domain([5, 8]).range([timeGraphHeight, 0])
    let xAxis = d3.axisBottom(yearScale).tickFormat(d3.format(".0f")).tickSize(10);
    let yAxis = d3.axisRight(ratingScale).ticks(5).tickSize(10);

    svg.append("g").style("font-size", "15")
        .attr("transform", "translate(" + timeGraphWidth + "," + -0.5 + ")")
        .call(yAxis)
        .selectAll(".tick line")
        .attr("stroke-width", "2px");
    svg.append("g").style("font-size", "15")
        .attr("transform", "translate(" + -0.5 + "," + (timeGraphHeight) + ")")
        .call(xAxis)
        .selectAll(".tick line")
        .attr("stroke-width", "2px");

    let yGrid = d3.axisLeft(ratingScale).tickSize(-timeGraphWidth).tickFormat("");
    let xGrid = d3.axisBottom(yearScale).tickSize(-timeGraphHeight).tickFormat("");

    // svg.append("g")
    //     .attr("class", "gridlines")
    //     .attr("transform", "translate(" + 0 + "," + 0 + ")")
    //     .call(yGrid);
    // svg.append("g")
    //     .attr("class", "gridlines")
    //     .attr("transform", "translate(" + 0 + "," + (timeGraphHeight) + ")")
    //     .call(xGrid);


    let passed_rating_dict = {};
    let failed_rating_dict = {};
    passArray = [];
    failArray = [];
    movieData.forEach(function (data, index) {
        let currYear = data['year'];
        if (currYear >= 1980) {
            if (data['binary'] === "PASS") {
                passArray.push(data);
            };
            if (data['binary'] === "FAIL") {
                failArray.push(data);
            };
        };
    });

    passArray.forEach(function (data, index) {
        let currYear = data['year'];
        if (currYear in passed_rating_dict) {
            let currList = passed_rating_dict[currYear];
            currList.push(data['imdb_rating_num']);
            passed_rating_dict[currYear] = currList;
        } else {
            passed_rating_dict[currYear] = [data['imdb_rating_num']]
        }
    });


    failArray.forEach(function (data, index) {
        let currYear = data['year'];
        if (isNaN(data['imdb_rating_num'])) {} else {
            if (currYear in failed_rating_dict) {
                let currList = failed_rating_dict[currYear];
                currList.push(data['imdb_rating_num']);
                failed_rating_dict[currYear] = currList;
            } else {
                failed_rating_dict[currYear] = [data['imdb_rating_num']]
            }
        }
    });

    finalPassedArray = [];
    finalFailedArray = [];
    for (var key in passed_rating_dict) {
        let currTotal = 0;
        let currArray = passed_rating_dict[key];
        let itemIndexTotal = currArray.length;
        for (var i = 0; i < currArray.length; i++) {
            currTotal = currTotal + currArray[i];
        };
        let averagedVal = currTotal / (itemIndexTotal)
        currObject = new Object();
        currObject.year = key;
        currObject.val = averagedVal;
        finalPassedArray.push(currObject);
    };
    for (var key in failed_rating_dict) {
        let currTotal = 0;
        let currArray = failed_rating_dict[key];
        let itemIndexTotal = currArray.length;
        for (var i = 0; i < currArray.length; i++) {
            currTotal = currTotal + currArray[i];
        };
        let averagedVal = currTotal / (itemIndexTotal)
        currObject = new Object();
        currObject.year = key;
        currObject.val = averagedVal;
        finalFailedArray.push(currObject);
    };

    let legendXInset = -50;

    let path = d3.line().x(d => yearScale(d.year)).y(d => ratingScale(d.val) + 30);
    let currentGraph = svg;
    currentGraph.append("path").attr("stroke", 'red').attr("stroke-width", 2).attr("fill-opacity", 0).datum(finalFailedArray).attr("d", path);
    currentGraph.append("path").attr("stroke", 'blue').attr("stroke-width", 2).attr("fill-opacity", 0).datum(finalPassedArray).attr("d", path);
    timeGraphContainerSvg.append("text").attr("transform", "translate(" + (padding.left + timeGraphWidth / 2.0) + "," + (padding.top + timeGraphHeight + padding.bottom / 2.0) + ")").style("text-anchor", "middle").attr("class", "x axesLabel").text("Year")
    timeGraphContainerSvg.append("text").attr("transform", "translate(" + (padding.left + timeGraphWidth + padding.right / 2.0) + "," + (timeGraphHeight / 2.0 + padding.top) + ")rotate(90)").style("text-anchor", "middle").attr("class", "y axesLabel").text("IMDB Rating")
    svg.append("line").style("stroke", "red").attr("x1", 750 - legendXInset).attr("y1", 60).attr("x2", 760 - legendXInset).attr("y2", 60);
    svg.append("text").attr("transform", "translate(" + (770 - legendXInset) + "," + 63 + ")").style("font-size", "15").text("Failed Bechdel Test");
    svg.append("line").style("stroke", "blue").attr("x1", 750 - legendXInset).attr("y1", 79).attr("x2", 760 - legendXInset).attr("y2", 79);
    svg.append("text").attr("transform", "translate(" + (770 - legendXInset) + "," + 83 + ")").style("font-size", "15").text("Passed Bechdel Test");

    // Add left edge for y axis
    svg.append("line")
        .attr("x1", timeGraphWidth)
        .attr("x2", timeGraphWidth)
        .attr("y1", 0)
        .attr("y2", timeGraphHeight)
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .attr("class", "yAxisBoundary")

    // Add bottom edge for x axis
    svg.append("line")
        .attr("x1", 0)
        .attr("x2", timeGraphWidth)
        .attr("y1", timeGraphHeight)
        .attr("y2", timeGraphHeight)
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .attr("class", "xAxisBoundary")


    // Remove domain components garbage
    d3.selectAll("path.domain").remove();



})
.catch(error => {
    console.log("Your Error is this:" + error.message);
});