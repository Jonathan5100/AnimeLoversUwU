anime_data = d3.csv("./data/crunchy.csv");

Promise.all([anime_data]).then((data) => {
    const globalApplicationState = {
        selected_anime: null,
        selected_genre: null,
        scatter: null,
        graph: null,
        pies: null,
        anime_data: null,
        anime_utils: null
    };

    let anime_data = data[0];

    globalApplicationState.anime_data = anime_data;
    globalApplicationState.anime_utils = new Anime_Utils();

    let scatter = new Scatter(globalApplicationState);
    let pies = new Pies(globalApplicationState);
    let graph = new Graph(globalApplicationState);

    globalApplicationState.scatter = scatter;
    globalApplicationState.graph = graph;
    globalApplicationState.pies = pies;

    let selector = d3.select("#anime_selector");
    let gSelector = d3.select("#genre_selector");

    selector.selectAll('option').data(anime_data)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return JSON.stringify(d);
        })
        .text(function(d) {
            return d.anime;
        });

    let all = globalApplicationState.anime_utils.getAllGenres()
    all.unshift("Select a Genre")
    gSelector.selectAll('option').data(all)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return JSON.stringify(d);
        })
        .text(function(d) {
            return d
        })

    selector.on("change", function(d) {
        let selectedOption = JSON.parse(d3.select(this).property("value"));
        globalApplicationState.selected_anime = selectedOption;
        d3.select("#anime_image")
            .attr("src", selectedOption.anime_img);


        let geners = globalApplicationState.anime_utils.getGeners(selectedOption)
        if (geners.length == 0)
            geners = globalApplicationState.anime_utils.getAllGenres()
        let appending = gSelector.selectAll('option').data([]);

        appending.exit().remove();
        geners.unshift("Select a Genre")
        appending = gSelector.selectAll('option').data(geners);
        appending.enter()
            .append('option')
            .attr('value', function(d) {
                return JSON.stringify(d);
            })
            .text(function(d) {
                return d;
            });
        globalApplicationState.scatter.update();
        globalApplicationState.pies.update();

    })

    gSelector.on("change", function(d) {
        let selectedOption = JSON.parse(d3.select(this).property("value"));
        globalApplicationState.selected_genre = selectedOption;
        globalApplicationState.scatter.update();
    })

});