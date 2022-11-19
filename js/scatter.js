class Scatter {
    constructor(globalApplicationState) {

        this.globalApplicationState = globalApplicationState;
        this.au = new Anime_Utils()
        this.margin = { top: 5, right: 50, bottom: 100, left: 60 }

        // set up svg
        this.width = 1300 - this.margin.left - this.margin.right;
        this.height = 1100 - this.margin.top - this.margin.bottom;
        this.svg = d3.select("#plot-chart-div")
            .append("svg")
            .attr("class", "scatter")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")");

        // scales
        this.x = d3.scaleLinear()
            .domain([1, 5])
            .range([30, this.width - 30]);

        let votes = d3.extent(this.globalApplicationState.anime_data
            .map((d) => +d.votes));
        this.color = d3.scaleLinear()
            .domain([votes[0], votes[1] / 200, votes[1]])
            .range(["#F0F2FF", "#6699FF", "#000000"])

        // get the total episodes
        let totals = d3.extent(this.globalApplicationState.anime_data
            .map((d) => +d.episodes));

        // log scale for 2D plot
        this.y = d3.scaleLog().domain([1, 2000]).range([this.height, 0]);

        // base size of of episode sizes
        this.size = d3.scaleSqrt().domain(totals).range([3, 35]);

        this.drawInitial();

    }

    // draws  x and y-axis
    DrawAxis2D() {

        // x axis
        this.svg.append("g")
            .attr("class", "axis2D")
            .attr("transform", "translate(0," + 85 + ")")
            .call(d3.axisBottom(this.x).ticks(10))
            .attr("transform", "translate(0," + (this.height + 10) + ")")
            .call(g => g.select(".domain").remove())

        // axis labels
        this.svg.append("text")
            .attr("class", "axis2D")
            .attr("text-anchor", "end")
            .style("font-size", "28px")
            .attr("font-weight", "bold")
            .attr("x", this.width / 2 + this.margin.left + this.margin.right)
            .attr("y", this.height + this.margin.top + 50)
            .text("Anime Ratings");

        this.svg.append("text")
            .attr("class", "axis2D")
            .attr("text-anchor", "end")
            .style("font-size", "28px")
            .attr("font-weight", "bold")
            .attr("transform", "rotate(-90)")
            .attr("y", -this.margin.left + 23)
            .attr("x", -this.height / 2 + 0)
            .text("Episode Count")

        // y axis
        this.svg.append("g")
            .attr("class", "axis2D")
            .call(d3.axisLeft(this.y))
            .call(g => g.select(".domain").remove())


    }

    // rearranges circle for 2D graph
    DrawCircle2D() {

        // move circles
        this.svg
            .transition()
            .duration(800)
            .selectAll("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => {
                let temp = +d.data.episodes;

                if (temp != 0)
                    return this.y(temp)

                return this.y(1);
            })
            .attr("r", 5)

    }

    // what to do when an anime has been selected
    update() {

        let total = []

        // get genre of selected animes
        let genresOfSelected = JSON.parse(d3.select("#genre_selector").property("value"));
        let animesWithSelected = this.au.getAllInGenres(this.globalApplicationState.anime_data, genresOfSelected)

        // check that this has any genres
        if (genresOfSelected.length == 29) {

            d3.selectAll("circle").attr("opacity", 1)

            return
        }

        d3.selectAll("circle").attr("opacity", d => {

            // if the intersection of genres is not empty
            if (d.data != null && d.data[genresOfSelected] === "0.0") return 0.1

            return 1
        })

    }

    // draws single x-axis
    DrawAxis1D() {

        // tick marks
        this.svg.append("g")
            .attr("class", "axis1D")
            .attr("transform", "translate(0," + 85 + ")")
            .call(d3.axisBottom(this.x))
            .call(g => g.select(".domain").remove())

        // axis labels
        this.svg.append("g")
            .attr("class", "axis1D")
            .append("text")
            .attr("x", 10)
            .attr("y", 70)
            .attr("font-weight", "bold")
            .text("Low Rated Animes");

        this.svg.append("g")
            .attr("class", "axis1D")
            .append("text")
            .style("font-size", "34px")
            .attr("text-anchor", "end")
            .attr("x", this.width / 2 + 110)
            .attr("y", 70)
            .attr("font-weight", "bold")
            .text("Anime Ratings");

        this.svg.append("g")
            .attr("class", "axis1D")
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", this.width - 20)
            .attr("y", 70)
            .attr("font-weight", "bold")
            .text("High Rated Animes");
    }

    // draws all circles in graph
    DrawCircle1D() {

        // add circles
        this.svg
            .selectAll("circle")
            .transition()
            .duration(800)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y + 130)
            .attr("r", d => d.r);
    }


    // draws all circles in graph
    DrawInitialCircles() {

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

        // Define the div for the tooltip - https://bl.ocks.org/d3noob/97e51c5be17291f79a27705cef827da2
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("opacity", 1)

        // add circles
        let circles = this.svg.append("g")
            .selectAll("circle")
            .data(dodge(this.globalApplicationState.anime_data))
            .join("circle")
            .attr("stroke", "black")
            .attr("fill", d => this.color(+d.data.votes))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y + 130)
            .attr("r", d => d.r)
            .on("click", click)
            .on("mouseover", function(event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<h3>" + d.data.anime + "</h3>\n<h5>Rating for selected: " + d.data.rate +
                        "</h5>\n<h5>Number of votes: " + d.data.votes +
                        "</h5>\n<h5>Number of episodes: " + (d.data.episodes > 0 ? d.data.episodes : 1) + "</h5>\n")
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })

    }

    // draws initial 1D graph 
    drawInitial() {
        this.DrawAxis1D();
        this.DrawInitialCircles();
    }

    // draws 1D graph 
    draw1D() {

        this.remove(".axis2D")
        this.DrawAxis1D();
        this.DrawCircle1D();
    }

    // draws 2D graph
    draw2D() {

        this.remove(".axis1D")
        this.DrawAxis2D();
        this.DrawCircle2D();
    }

    // draw graph based on selection
    drawBasedOnCheckBox() {
        let checkBox = document.getElementById("myCheckbox");
        if (checkBox.checked == true) {
            d3.select("#myCheckboxLabel").text("1D Plot")
            this.draw2D()
        } else {
            d3.select("#myCheckboxLabel").text("2D Plot")
            this.draw1D()
        }
    }

    remove(str) {
        d3.selectAll(str)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1)
            .transition()
            .duration(400)
            //change fill and stroke opacity to avoid CSS conflicts
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0).remove();
    }
}