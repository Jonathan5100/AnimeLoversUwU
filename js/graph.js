class Graph {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;

        let graph = d3.select("#graph-div");
        const svgWidth = 2000;
        const svgHeight = 1100;
        //get all genres
        let formattedGenres = Object.keys(this.globalApplicationState.anime_data[0]).filter(key => key.includes("genre")).map((genre) => {
            let formatteGenre = genre.replace("genre_", "");
            return formatteGenre.charAt(0).toUpperCase() + formatteGenre.slice(1);
        });

        let animes = this.globalApplicationState.anime_utils.getAllAnime(this.globalApplicationState.anime_data);


        //map animes to their genres
        let mappedAnimeToGenre = this.globalApplicationState.anime_data.map((anime) => {
            let genresInAnime = this.globalApplicationState.anime_utils.getGeners(anime);
            return { anime: anime, genres: [...genresInAnime] }
        });
        //genres data
        let genresNodes = Object.keys(this.globalApplicationState.anime_data[0]).filter(key => key.includes("genre")).map((d, i) => { return { id: i, name: d } });
        // create links data
        let animeLinks = [];
        for (let i = 0; i < mappedAnimeToGenre.length; i++) {
            let current = mappedAnimeToGenre[i];
            let currentAnime = current.anime.anime;
            let genres = current.genres
            if (genres.length !== 0) {
                for (let j = 0; j < genres.length; j++) {
                    for (let k = genres.length - 1; k > j; k--) {
                        let sourceGenre = genresNodes.find(genre => genre.name === genres[j]);
                        let targetGenre = genresNodes.find(genre => genre.name === genres[k]);
                        animeLinks.push({ anime: currentAnime, source: sourceGenre.id, target: targetGenre.id })
                    }
                }
            }
        }

        let svg = graph.append("svg")
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        let color = d3.scaleOrdinal(d3.schemePaired);
        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        let linkLayer = svg.append("g")
            .attr("class", "links");
        // Now let's create the lines

        // Initialize the links
        var links = linkLayer
            .selectAll("line")
            .data(animeLinks)
            .enter()
            .append("line")
            .style("stroke", "#aaa")
            // Now we create the node group, and the nodes inside it
        let nodeLayer = svg.append("g")
            .attr("class", "nodes");
        // Initialize the nodes
        var nodes = nodeLayer
            .selectAll("circle")
            .data(genresNodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .style("fill", "#69b3a2")
            // We can add a tooltip to each node, so when you hover over a circle, you 
            //  see the node's id
        nodes.append("title")
            .text(d => d.name);


        // Let's list the force we wanna apply on the network
        var simulation = d3.forceSimulation(genresNodes) // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink() // This force provides links between nodes
                .id(function(d) { return d.id; }) // This provide  the id of a node
                .links(animeLinks) // and this the list of links
            )
            .force("charge", d3.forceManyBody().strength(-400)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2)) // This force attracts nodes to the center of the svg area
            .on("end", ticked);

        // This function is run at each iteration of the force algorithm, updating the nodes position.
        function ticked() {
            links
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            nodes
                .attr("cx", function(d) { return d.x + 6; })
                .attr("cy", function(d) { return d.y - 6; });
        }

    }
}