class Scatter {
    constructor(globalApplicationState) {

        this.globalApplicationState = globalApplicationState;
        this.au = new Anime_Utils()
        this.margin = { top: 10, right: 50, bottom: 190, left: 60 }

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

        this.votes = d3.extent(this.globalApplicationState.anime_data
            .map((d) => +d.votes));
        this.color = d3.scaleLinear()
            .domain([this.votes[0], this.votes[1] / 200, this.votes[1]])
            .range(["#F0F2FF", "#6699FF", "#000000"])

        // get the total episodes
        this.totals = d3.extent(this.globalApplicationState.anime_data
            .map((d) => +d.episodes));

        // log scale for 2D plot
        this.y = d3.scaleLog().domain([1, 1150]).range([this.height - 20, 0])

        // base size of of episode sizes
        this.size = d3.scaleSqrt().domain(this.totals).range([3, 35]);

        this.drawInitial();
        this.legend()

    }

    // draws  x and y-axis
    DrawAxis2D() {

        // x axis
        this.svg.append("g")
            .attr("class", "axis2D")
            .attr("transform", "translate(0," + 85 + ")")
            .call(d3.axisBottom(this.x).ticks(10))
            .style("font-size", "12px")
            .attr("transform", "translate(0," + (this.height + 10) + ")")
            .call(g => g.select(".domain").remove())

        // axis labels
        this.svg.append("text")
            .attr("class", "axis2D")
            .attr("text-anchor", "end")
            .style("font-size", "28px")
            .attr("font-weight", "bold")
            .attr("x", this.width / 2 + this.margin.left + this.margin.right)
            .attr("y", this.height + 55)
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
            .call(d3.axisLeft(this.y).ticks(50))
            .style("font-size", "12px")
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
        let selectedAnime = JSON.parse(d3.select("#anime_selector").property("value"));

        // highlight selected and unselect all else
        d3.selectAll(".circ")
            .attr("stroke", (d) => {
                return (d.data.anime == selectedAnime.anime) ? "#CC5500" : "black"
            })
            .attr("stroke-width", (d) => {
                return (d.data.anime == selectedAnime.anime) ? 4 : 1
            })

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
            .attr("transform", "translate(0," + 40 + ")")
            .call(d3.axisBottom(this.x))
            .style("font-size", "12px")
            .call(g => g.select(".domain").remove())

        // axis labels
        this.svg.append("g")
            .attr("class", "axis1D")
            .append("text")
            .attr("x", 10)
            .attr("y", 15)
            .attr("font-weight", "bold")
            .text("Low Rated Animes");

        this.svg.append("g")
            .attr("class", "axis1D")
            .append("text")
            .style("font-size", "34px")
            .attr("text-anchor", "end")
            .attr("x", this.width / 2 + 110)
            .attr("y", 15)
            .attr("font-weight", "bold")
            .text("Anime Ratings");

        this.svg.append("g")
            .attr("class", "axis1D")
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", this.width - 20)
            .attr("y", 15)
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
            .attr("cy", d => d.y + 70)
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
        let click = function(event, d) {

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
            .attr("class", "circ")
            .attr("stroke", "black")
            .attr("fill", d => this.color(+d.data.votes))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y + 70)
            .attr("r", d => d.r)
            .on("click", click)
            .on("mouseover", function(event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<h3>" + d.data.anime + "</h3>\n<h5>Rating: " + d.data.rate +
                        "</h5>\n<h5>Votes: " + d.data.votes +
                        "</h5>\n<h5>Episodes: " + (d.data.episodes > 0 ? d.data.episodes : 1) + "</h5>\n")
                    .style("left", (event.pageX + 20) + "px")
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

        this.removeAll(".axis2D")
        this.DrawAxis1D();
        this.DrawCircle1D();
    }

    // draws 2D graph
    draw2D() {

        this.removeAll(".axis1D")
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

    // remove all of given selector string
    removeAll(str) {
        d3.selectAll(str)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1)
            .transition()
            .duration(400)
            //change fill and stroke opacity to avoid CSS conflicts
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0).remove();
    }


    legend() {
        //Append a defs (for definition) element to your SVG
        var defs = d3.select(".scatter").append("defs");

        //Append a linearGradient element to the defs and give it a unique id
        var linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        //Horizontal gradient
        linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        linearGradient.selectAll("stop")
            .data(this.color.range())
            .enter().append("stop")
            .attr("offset", function(d, i) { return i / 2; })
            .attr("stop-color", function(d) { return d; });

        let y = this.height + 130;
        let x = this.width - 250;

        //Draw the rectangle and fill with gradient
        d3.select(".scatter").append("svg")
            .attr("class", "legendSvg")
            .attr("height", 2000)
            .append("rect")
            .attr("class", "legend")
            .attr("width", 300)
            .attr("height", 20)
            .attr("x", x)
            .attr("y", y)
            .style("fill", "url(#linear-gradient)")

        // label for the gradients
        d3.select(".legendSvg").append("text")
            .style("font-size", "11x")
            .attr("font-weight", "bold")
            .attr("x", x)
            .attr("y", y - 6)
            .text(this.votes[0] + " votes");

        d3.select(".legendSvg").append("text")
            .style("font-size", "11x")
            .attr("font-weight", "bold")
            .attr("x", x + 220)
            .attr("y", y - 6)
            .text(this.votes[1] + " votes");

    }
}