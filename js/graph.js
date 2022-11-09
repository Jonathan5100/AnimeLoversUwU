class Graph {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        debugger
        let graph = d3.select("graph-div");
        const svgWidth = 800;
        const svgHeight = 600;
        //get all genres
        let genres = Object.keys(this.globalApplicationState.anime_data[0]).filter(key => key.includes("genre")).map((genre) => {
            let formatteGenre = genre.replace("genre_", "");
            return formatteGenre.charAt(0).toUpperCase() + formatteGenre.slice(1);
        });
        //map animes to their genres
        let mappedGenreToAnime = Object.keys(this.globalApplicationState.anime_data[0]).filter(key => key.includes("genre")).map((genre) => {
            let animesInGenre = this.globalApplicationState.anime_utils.getAllInGenres(this.globalApplicationState.anime_data, genre);
            return { genre: { genre }, animes: { animesInGenre } }
        });

        debugger
        let svg = graph.append("svg")
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        let color = d3.scaleOrdinal(d3.schemePaired);
    }
}