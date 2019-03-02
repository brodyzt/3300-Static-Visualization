var map;


d3.csv("populations.csv", populations => {
    d3.json("mapping.json", mapping => {

        let inverted = {};

        for (map in mapping) {
            // console.log(map)
            inverted[mapping[map]] = map;
        }

        console.log(inverted)

        let stateData = {};

        populations.forEach(element => {
            var key = inverted[element["state"]]
            stateData[key] = {
                population: element["pop_est_2014"],
                fillKey: "Republican"
            }
        });

        // let stateData = {
        //     "AZ": {
        //         fillKey: "Republican",
        //         electoralVotes: 15
        //     }
        // }

        console.log(stateData)

        map = new Datamap({
            element: document.getElementById('container'),
            scope: "usa",
            geographyConfig: {
                highlightOnHover: false,
                popupOnHover: false
            },
            fills: {
                Republican: "#ff0000",
                defaultFill: "#ff00ff"
            },
            data: stateData
        });


        map.labels();
    })
});