let svg = d3.select("svg#eldor");
let svg_height = svg.attr("height");
let svg_width = svg.attr("width");
let margin = { top: 50, right: 50, bottom: 50, left: 50};
let chartWidth = svg_width-margin.left-margin.right;
let chartHeight = svg_height-margin.top-margin.bottom;

d3.json("eldor.json").then( function(movieData) {
    // Cast the data into appropriate types
    movieData.forEach( (d, i) => {
      d['year'] =  Number(d["year"]);
      d['budget'] =  Number(d["budget"]);
      d['domGross'] =  Number(d["domGross"]);
      d['intGross'] =  Number(d["intGross"]);
      d['imdbRating'] =  Number(d["imdbRating"]);
      d['intGain'] = Number(d["intGross"])/Number(d["budget"]);
      d['domGain'] = Number(d["domGross"])/Number(d["budget"]);
    });
    
    // filter the movieData
    movieData = movieData.filter(d => !isNaN(d['budget']) && !isNaN(d['domGross']) && !isNaN(d['intGross']));
    
    // Prepare the scales
    const budgetMin = d3.min(movieData, d => d['budget']);
    const budgetMax = d3.max(movieData, d => d['budget']);
    const budgetScale = d3.scaleLog().domain([budgetMin, budgetMax]);                
    
    const ratingMin =  d3.min(movieData, d => d['imdbRating']);
    const ratingMax =  d3.max(movieData, d => d['imdbRating']);
    const ratingScale = d3.scaleLinear().domain([ratingMin, ratingMax]);

    const yearMin =  d3.min(movieData, d => d['year']);
    const yearMax =  d3.max(movieData, d => d['year']);
    const yearScale = d3.scaleLinear().domain([yearMin, yearMax]);

    const xScale = yearScale.range([0, chartWidth]); // x axis
    const yScale = budgetScale.range([chartHeight, 0]); // y axis
    const rScale = ratingScale.range([ratingMin*2, ratingMax*2]); // radius
    
    // X axis 
    let bottomAxis = d3.axisBottom(xScale);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform","translate("+ margin.left +","+ (margin.top + chartHeight) +")")
        .call(bottomAxis); 

    // Y axis 
    let leftAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".0s"));
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform","translate("+margin.left +","+ margin.top +")")
        .call(leftAxis);
    
    // add a canvas to svg  
    let scatter = svg.append("g")
                    .attr("id", "scatter")
                    .attr("transform","translate("+margin.left+","+margin.top+")");
    let dict = {}
    // add the circles
    movieData.forEach( (d, i) => {
      let x = xScale(d['year']);
      let y = yScale(d['budget']);
      let r = rScale(d['imdbRating']);
      let bin = (d['binary']=="PASS")?"blue":"red";
      
      // collect the yearly pass/fail count
      if(dict[d["year"]] == undefined){
          dict[d["year"]] = {'pass':0,'fail':0, "year":d["year"]};
      };
      if(d['binary']=="PASS"){
          dict[d["year"]].pass +=1;
      }else{
          dict[d["year"]].fail +=1;
      };
      
      let circle = scatter.append("circle")
                            .attr("cx", x)
                            .attr("cy", y)
                            .attr("r", r)
                            .attr("opacity", 0.2)
                            .style("fill", bin)
                            .attr("title", d['title'])
                            .attr("year", d['year'])
                            .attr("rating", d['imdbRating'])
                            .attr("binary", d['binary'])
                            .attr("domGain", d['domGain'])
                            .attr("intGain", d['intGain']);  
    });
    
    let lScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, chartHeight-160]);
    let rightAxis = d3.axisRight(lScale);
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform","translate("+(chartWidth+margin.left) +","+ margin.top +")")
        .call(rightAxis);
    let passPath = d3.line().x(d => xScale(d.year)).y( d => lScale( 100*(d["pass"]/(d["pass"]+d["fail"])) ) );
    d3.select("g#scatter")
        .append("path")
        .attr("stroke", 'blue')
        .attr("stroke-width", 2)
        .attr("opacity",0.5)
        .attr("fill-opacity",0)
        .datum(Object.values(dict))
        .attr("d", passPath);
    
    let pfillData = Object.values(dict).concat([{'pass':0,'fail':1, "year":2013}, {'pass':0,'fail':1, "year":1970}]);
    let pfillPath = d3.line().x(d => xScale(d.year)).y( d => lScale( 100*(d["pass"]/(d["pass"]+d["fail"])) ));
     d3.select("g#scatter")
        .append("path")
        .attr("stroke", 'blue')
        .attr("stroke-width", 0)
        .attr("fill","blue")
        .attr("opacity",0.5)
        .attr("fill-opacity",0.1)
        .datum(pfillData)
        .attr("d", pfillPath);
    
    let failPath = d3.line().x(d => xScale(d.year)).y( d => lScale( 100*(d["fail"]/(d["pass"]+d["fail"])) ) );
     d3.select("g#scatter")
        .append("path")
        .attr("stroke", 'red')
        .attr("stroke-width", 2)
        .attr("opacity",0.5)
        .attr("fill-opacity",0)
        .datum(Object.values(dict))
        .attr("d", failPath);
    
    let fillData = Object.values(dict).concat([{'pass':1,'fail':0, "year":2013}]);
    let fillPath = d3.line().x(d => xScale(d.year)).y( d => lScale( 100*(d["fail"]/(d["pass"]+d["fail"])) ));
     d3.select("g#scatter")
        .append("path")
        .attr("stroke", 'red')
        .attr("stroke-width", 0)
        .attr("fill","red")
        .attr("opacity",0.5)
        .attr("fill-opacity",0.1)
        .datum(fillData)
        .attr("d", fillPath);
//     console.log(fillData);
});