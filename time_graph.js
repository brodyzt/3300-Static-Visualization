let movieData = []
d3.csv("original_with_ratings.csv").then(function (data) {
    movieData = data
    let timeGraphContainerSvg = d3.select("svg#timeGraph");
    let padding = {
        "top": 50,
        "bottom": 50,
        "right": 50,
        "left": 50
    };

    
    let timeGraphWidth = timeGraphContainerSvg.attr("width") - padding.left - padding.right;
    let timeGraphHeight = timeGraphContainerSvg.attr("height") - padding.top - padding.bottom;

    console.log(timeGraphHeight)


    let svg = timeGraphContainerSvg.append("g")
        .attr("transform", "translate(" + (timeGraphContainerSvg.attr("width") / 2.0 - timeGraphWidth / 2.0) + "," + padding.top + ")")

    console.log("here")

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
    let xAxis = d3.axisBottom(yearScale).tickFormat(d3.format(".0f"));
    let yAxis = d3.axisLeft(ratingScale).ticks(5);

    svg.append("g").style("font-size", "7")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .call(yAxis);
    svg.append("g").style("font-size", "7")
        .attr("transform", "translate(" + 0 + "," + (timeGraphHeight) + ")")
        .call(xAxis);

    let yGrid = d3.axisLeft(ratingScale).tickSize(-timeGraphWidth).tickFormat("");
    let xGrid = d3.axisBottom(yearScale).tickSize(-timeGraphHeight).tickFormat("");
    svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")
        .call(yGrid);
    svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", "translate(" + 0 + "," + (timeGraphHeight) + ")")
        .call(xGrid);


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

    let path = d3.line().x(d => yearScale(d.year) + 30).y(d => ratingScale(d.val) + 30);
    let currentGraph = svg;
    currentGraph.append("path").attr("stroke", 'red').attr("stroke-width", 2).attr("fill-opacity", 0).datum(finalFailedArray).attr("d", path);
    currentGraph.append("path").attr("stroke", 'green').attr("stroke-width", 2).attr("fill-opacity", 0).datum(finalPassedArray).attr("d", path);
    timeGraphContainerSvg.append("text").attr("transform", "translate(" + (padding.left + timeGraphWidth / 2.0) + "," + (padding.top + timeGraphHeight + padding.bottom / 2.0) + ")").style("text-anchor", "middle").text("Year")
    timeGraphContainerSvg.append("text").attr("transform", "translate(" + (padding.left / 2.0) + "," + (timeGraphHeight / 2.0 + padding.top) + ")rotate(270)").style("text-anchor", "middle").style("font-size", "9").text("IMDB Rating")
    svg.append("line").style("stroke", "red").attr("x1", 750).attr("y1", 60).attr("x2", 760).attr("y2", 60);
    svg.append("text").attr("transform", "translate(" + 770 + "," + 63 + ")").style("font-size", "9").text("Failed Bachdel Test");
    svg.append("line").style("stroke", "green").attr("x1", 750).attr("y1", 70).attr("x2", 760).attr("y2", 70);
    svg.append("text").attr("transform", "translate(" + 770 + "," + 73 + ")").style("font-size", "9").text("Passed Bachdel Test");



    // Remove domain components garbage
    d3.selectAll("path.domain").remove();



})
//.catch(error => {
//     console.log("Your Error is this:" + error.message);
// });