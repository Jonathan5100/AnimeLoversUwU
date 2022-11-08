anime_data = d3.csv("./data/crunchy.csv");

Promise.all([anime_data]).then((data) => {
    const globalApplicationState = {
        selected_anime: null,
        scatter: null,
        graph: null,
        pies: null,
        anime_data: null,
        anime_utils: null
    };

    let anime_data = data[0];
    console.log(anime_data);
    globalApplicationState.anime_data = anime_data;
    globalApplicationState.anime_utils = new Anime_Utils();

    let scatter = new Scatter(globalApplicationState);
    let pies = new Pies(globalApplicationState);
    let graph = new Graph(globalApplicationState);

    globalApplicationState.scatter = scatter;
    globalApplicationState.graph = graph;
    globalApplicationState.pies = scatter;

    let selector = d3.select("#anime_selector");
    selector.selectAll('option').data(anime_data)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return JSON.stringify(d);
        })
        .text(function(d) {
            return d.anime;
        });
    selector.on("change", function(d) {
        let selectedOption = JSON.parse(d3.select(this).property("value"));
        globalApplicationState.selected_anime = selectedOption;
        globalApplicationState.scatter.update();
        d3.select("#anime_image")
            .attr("src", selectedOption.anime_img);
    })
});