anime_data = d3.csv("./data/crunchy.csv");


Promise.all([anime_data]).then((data) => {

    // global state defining the global variables all should see
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

    // graphs
    let scatter = new Scatter(globalApplicationState);
    let pies = new Pies(globalApplicationState);
    let graph = new Graph(globalApplicationState);

    globalApplicationState.scatter = scatter;
    globalApplicationState.graph = graph;
    globalApplicationState.pies = pies;

    // get both selector forms, genre and anime 
    let animeSelector = d3.select("#anime_selector");
    let genreSelector = d3.select("#genre_selector");
    anime_data.push(anime_data[0])

    // give anime selector animes
    animeSelector.selectAll('option').data(anime_data)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return JSON.stringify(d);
        })
        .text(function(d) {
            return d.anime;
        });

    // get all genres possible
    let allGenres = globalApplicationState.anime_utils.getAllGenres()
    allGenres.unshift("Select a Genre")

    // add all genres to selector
    genreSelector.selectAll('option').data(allGenres)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return JSON.stringify(d);
        })
        .text(function(d) {
            return d
        })

    // when anime is selected
    animeSelector.on("change", function(d) {
        // store selected anime in global and local settings
        let selectedOption = JSON.parse(d3.select(this).property("value"));
        globalApplicationState.selected_anime = selectedOption;

        // set image
        d3.select("#anime_image")
            .attr("src", selectedOption.anime_img);

        // get genres of anime
        let geners = globalApplicationState.anime_utils.getGeners(selectedOption)
            // if no genres, give anime all genres
        if (geners.length == 0)
            geners = globalApplicationState.anime_utils.getAllGenres()
        let appending = genreSelector.selectAll('option').data([]);

        // default to selecting the 0th anime option
        globalApplicationState.selected_genre = geners[0];
        // remove old genres and add new ones
        appending.exit().remove();
        geners.unshift("Select a Genre")
        appending = genreSelector.selectAll('option').data(geners);
        appending.enter()
            .append('option')
            .attr('value', function(d) {
                return JSON.stringify(d);
            })
            .text(function(d) {
                return d;
            });

        // select the genre in list
        const $select = document.querySelector('#genre_selector');
        const $options = Array.from($select.options);
        // get option that matches anime name
        let optionToSelect = $options[1]

        if (geners.length == 25) {
            optionToSelect = $options[0]
        }
        // set selector selection
        $select.value = optionToSelect.value;

        globalApplicationState.scatter.update();
        globalApplicationState.pies.update();

    })

    // define what happens when genre is selected
    genreSelector.on("change", function(d) {
        let selectedOption = JSON.parse(d3.select(this).property("value"));
        globalApplicationState.selected_genre = selectedOption;
        globalApplicationState.pies.updateGenre();
        globalApplicationState.scatter.update();
    })

    // checkbox event
    d3.select("#myCheckbox").on("change", () => {
        globalApplicationState.scatter.drawBasedOnCheckBox();
    });

});