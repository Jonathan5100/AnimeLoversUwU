class Graph {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;

        let graph = d3.select("#graph-div");
        const svgWidth = 1400;
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
        //initialize links
        let newAnimeLinks = [];
        for (let i = 0; i < genresNodes.length; i++) {
            for (let j = i + 1; j < genresNodes.length; j++) {
                let sourceGenre = genresNodes[i];
                let targetGenre = genresNodes[j];
                newAnimeLinks.push({ id: sourceGenre.name + "~" + targetGenre.name, source: sourceGenre.id, target: targetGenre.id, count: 0 })
            }
        }
        for (let i = 0; i < mappedAnimeToGenre.length; i++) {
            let current = mappedAnimeToGenre[i];
            let currentAnime = current.anime.anime;
            let genres = current.genres
            if (genres.length !== 0) {
                for (let j = 0; j < genres.length; j++) {
                    for (let k = genres.length - 1; k > j; k--) {
                        let sourceGenre = genresNodes.find(genre => genre.name === genres[j]);
                        let targetGenre = genresNodes.find(genre => genre.name === genres[k]);
                        let id = sourceGenre.name + "~" + targetGenre.name;
                        let linkIndex = newAnimeLinks.findIndex(link => link.id === id);
                        if (linkIndex) {
                            newAnimeLinks[linkIndex].count++;
                        }
                    }
                }
            }
        }
        let svg = graph.append("svg")
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        /** Find the node that was clicked, if any, and return it. */
        function dragSubject() {
            const x = transform.invertX(d3.event.x),
                y = transform.invertY(d3.event.y);
            const node = findNode(genresNodes, x, y, 40);
            if (node) {
                node.x = transform.applyX(node.x);
                node.y = transform.applyY(node.y);
            }
            // else: No node selected, drag container
            return node;
        }
        let color = d3.scaleOrdinal(d3.schemePaired);
        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = svg.append("g")
            .attr("class", "links");
        // Now let's create the lines

        // Initialize the links
        var links = this.linkLayer
            .selectAll("line")
            .data(newAnimeLinks)
            .enter()
            .append("line")
            .style("stroke-width", d => d.count / 12)
            .style("stroke", "#aaa")
        // Now we create the node group, and the nodes inside it
        this.nodeLayer = svg.append("g")
            .attr("class", "nodes");
        // Initialize the nodes
        var nodes = this.nodeLayer
            .selectAll("circle")
            .data(genresNodes)
            .enter()
            .append("circle")
            .attr("r", 60)
            .style("fill", "#6698FE")
            // This part adds event listeners to each of the nodes; when you click,
            //  move, and release the mouse on a node, each of these functions gets 
            //  called (we've defined them at the end of the file)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        nodes
            .append("span")
            .text(d => d.name);
        // We can add a tooltip to each node, so when you hover over a circle, you 
        //  see the node's id
        nodes.append("title")
            .text(d => d.name);

        var labels = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(genresNodes)
            .enter().append("text")
            .attr("class", "label")
            .text(function (d) {
                let formattedGenre = d.name.replace("genre_", "");
                return formattedGenre.replaceAll(" ", "\n").charAt(0).toUpperCase() + formattedGenre.slice(1);
            });
        // Let's list the force we wanna apply on the network
        var simulation = d3.forceSimulation(genresNodes) // Force algorithm is applied to data.nodes
            .force("link", d3.forceLink() // This force provides links between nodes
                .id(function (d) { return d.id; }) // This provide  the id of a node
                .links(newAnimeLinks) // and this the list of links
            )
            .force("charge", d3.forceManyBody().strength(-4000)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
            .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2)) // This force attracts nodes to the center of the svg area
            .on("tick", ticked);
        // This function is run at each iteration of the force algorithm, updating the nodes position.
        function ticked() {
            links
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            nodes
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
            labels
                .attr("x", function (d) { return d.x - 30; })
                .attr("y", function (d) { return d.y + 10; })
                .style("font-size", "17px").style("fill", "black");
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }
    update() {
        this.resetGraph();
        if (this.globalApplicationState.selected_anime === null) {
            return;
        }
        this.selectedAnimeGenres = this.globalApplicationState.anime_utils.getGeners(this.globalApplicationState.selected_anime);
        let nodes = this.nodeLayer.selectAll("circle");
        let filteredNodes = nodes.filter((d, i) => {
            return this.selectedAnimeGenres.includes(d.name);
        });
        filteredNodes
            .style("stroke", "#F44937")
            .style("stroke-width", 8);
        let links = this.linkLayer.selectAll("line");
        let filteredLinks = links.filter((d) => {
            const [sourceGenre, targetGenre] = d.id.split("~");
            return (this.selectedAnimeGenres.includes(sourceGenre) && this.selectedAnimeGenres.includes(targetGenre));
        });
        filteredLinks
            .style('stroke', '#F44937');
    }
    resetGraph() {
        let links = this.linkLayer.selectAll("line");
        links.style("stroke", "#aaa");
        let nodes = this.nodeLayer.selectAll("circle");
        nodes.style('stroke', 'transparent');
    }
}