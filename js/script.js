anime_data = d3.csv("./data/crunchy.csv");

Promise.all([anime_data]).then((data) => {
    let anime_data = data[0];
    console.log(anime_data);

    let scatter = new Scatter(anime_data);
    let pies = new Pies(anime_data);
    let graph = new Graph(anime_data);

    let selector = d3.select("#anime_selector");
    selector.selectAll('option').data(anime_data)
    .enter()
    .append('option')
    .attr('value', function(d) {
      return d.anime_img;
    })
    .text(function(d) {
      return d.anime;
    });
    selector.on("change", function(d) {
        var selectedOption = d3.select(this).property("value")
        d3.select("#anime_image")
        .attr("src", selectedOption);
    })
});