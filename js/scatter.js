class Scatter {
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        this.au = new Anime_Utils()

        // set up svg
        this.width = 1200;
        this.height = 1100;
        this.svg = d3.select("#plot-chart-div")
            .append("svg")
            .attr("class", "scatter")
            .attr("width", this.width)
            .attr("height", this.height)

        // scales
        this.x = d3.scaleLinear()
            .domain([1, 5])
            .range([30, this.width - 30]);

        this.color = d3.scaleSequential([1, 5], d3.interpolatePlasma)
            // get the total episodes
        let totals = d3.extent(this.globalApplicationState.anime_data
            .map((d) => +d.episodes));
        // base size of of episode sizes
        this.size = d3.scaleSqrt().domain(totals).range([3, 35]);

        this.DrawAxis();
        this.DrawCircle();

    }

    // draws single x-axis
    DrawAxis() {

        // tick marks
        this.svg.append("g")
            .attr("transform", "translate(0," + 85 + ")")
            .call(d3.axisBottom(this.x).ticks(10))
            .call(g => g.select(".domain").remove())

        // axis labels
        this.svg.append("g")
            .append("text")
            .attr("x", 10)
            .attr("y", 70)
            .attr("font-weight", "bold")
            .text("Low Rated Animes");

        this.svg.append("g")
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", this.width)
            .attr("y", 70)
            .attr("font-weight", "bold")
            .text("High Rated Animes");
    }

    // draws all circles in graph
    DrawCircle() {
        // https://observablehq.com/@tomwhite/beeswarm-bubbles
        let dodge = (data) => {
            const circles = data.map(d => ({ x: this.x(+d.rate), r: this.size(+d.episodes), data: d })).sort((a, b) => b.r - a.r);
            const epsilon = 1e-3;
            let head = null,
                tail = null,
                queue = null;

            // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
            function intersects(x, y, r) {
                let a = head;
                while (a) {
                    const radius2 = (a.r + r) ** 2;
                    if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
                        return true;
                    }
                    a = a.next;
                }
                return false;
            }

            // Place each circle sequentially.
            for (const b of circles) {
                // Choose the minimum non-intersecting tangent.
                if (intersects(b.x, b.y = b.r, b.r)) {
                    let a = head;
                    b.y = Infinity;
                    do {
                        let y = a.y + Math.sqrt((a.r + b.r) ** 2 - (a.x - b.x) ** 2);
                        if (y < b.y && !intersects(b.x, y, b.r)) b.y = y;
                        a = a.next;
                    } while (a);
                }

                // Add b to the queue.
                b.next = null;
                if (head === null) {
                    head = tail = b;
                    queue = head;
                } else tail = tail.next = b;
            }

            return circles;
        }

        // click event added to all circles
        //https://alvarotrigo.com/blog/javascript-select-option/
        let click = (event, d) => {

            // correct image
            d3.select("#anime_image")
                .attr("src", d.data.anime_img)

            // get selector of animes
            const $select = document.querySelector('#anime_selector');
            const $options = Array.from($select.options);
            // get option that matches anime name
            let optionToSelect = null;
            for (let i = 0; i < $options.length; i++) {

                if ($options[i].text === d.data.anime) {
                    optionToSelect = $options[i]
                    break;
                }
            }

            if (optionToSelect == null) {

                optionToSelect = $options[3]
            }
            // set selector selection
            $select.value = optionToSelect.value;
            // let program know selector has been changed
            $select.dispatchEvent(new Event('change'));
        };

        // add circles
        this.svg.append("g")
            .selectAll("circle")
            .data(dodge(this.globalApplicationState.anime_data))
            .join("circle")
            .attr("stroke", "black")
            .attr("fill", d => this.color(+d.data.rate))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y + 130)
            .attr("r", d => d.r)
            .on("click", click)
            .append("title")
            .text(d => d.data.anime);
    }

    // what to do when an anime has been selected
    update() {
        let total = []
            // get genre of selected animes
        let genresOfSelected = this.globalApplicationState.anime_utils.getGeners(this.globalApplicationState.selected_anime)

        // check that this has any genres
        if (genresOfSelected.length == 0) {

            d3.selectAll("circle").attr("opacity", 1)
            return
        }

        d3.selectAll("circle").attr("opacity", d => {
            // go through all data and get its genres
            let genresOfRandom = this.au.getGeners(d.data)

            // check if arbritrary anime has any matching genres
            const filteredArray = genresOfSelected.filter(value => genresOfRandom.includes(value));

            // if the intersection of genres is not empty
            if (filteredArray.length == 0)
                return 0.5

            total.push(filteredArray)
            return 1
        })

        // check if any genres were the same as what was selected
        if (total.length == 0)
            d3.selectAll("circle").attr("opacity", 1)


    }
}