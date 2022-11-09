class Pies {
    radius = 450;
    constructor(globalApplicationState){
        this.globalApplicationState = globalApplicationState;
        this.svg_anime =  d3.select('#pie-chart-anime-div').append('svg')
        .attr('width', 900)
        .attr('height', 900)
        .attr('id', "pie-chart-anime");
        this.svg_genre =  d3.select('#pie-chart-genre-div').append('svg')
        .attr('width', 900)
        .attr('height', 900)
        .attr('id', "pie-chart-anime");
        console.log('yo from pies');
    }
    update() {
        this.selected_genre = this.globalApplicationState.anime_utils.getGeners(this.globalApplicationState.selected_anime)[0] ?? 'genre_shonen'
        let data_anime = this.getRatingsPerAnime(this.globalApplicationState.selected_anime);
        let data_genre = this.getRatingsPerGenre(this.selected_genre);

        this.drawPie(this.svg_anime, data_anime);
        this.drawPie(this.svg_genre, data_genre);
        // console.log("all in genre " + this.selected_genre + " are ")
        // console.log(this.globalApplicationState.anime_utils.getAllInGenres(this.globalApplicationState.anime_data, this.selected_genre));
        // var ordScale = d3.scaleOrdinal()
        //                     .domain()
        //                     .range(['#ffd384','#94ebcd','#fbaccc','#d3e0ea','#fa7f72']);
        // d3.select("#pie-chart-anime")
        // .join()
        // .append('svg')
    }
    getRatingsPerAnime(anime){
        let data = [];
        data.push({"stars": "Five Star", "rate_count": (parseInt(anime.rate_5) / parseInt (anime.votes) ) * 100});
        data.push({"stars": "Four Star", "rate_count": (parseInt(anime.rate_4) / parseInt (anime.votes) ) * 100});
        data.push({"stars": "Three Star", "rate_count": (parseInt(anime.rate_3) / parseInt (anime.votes) ) * 100} );
        data.push({"stars": "Two Star", "rate_count": (parseInt(anime.rate_2) / parseInt (anime.votes) ) * 100});
        data.push({"stars": "One Star", "rate_count": (parseInt(anime.rate_1) / parseInt (anime.votes) ) * 100});
        return data;
    }
    getRatingsPerGenre(genre){
        let animes = this.globalApplicationState.anime_utils.getAllInGenres(this.globalApplicationState.anime_data, genre);
        let data = [];
        let total5 = animes.reduce((sum, anime) => {
            return sum + parseInt(anime.rate_5)
          }, 0);
        let total4 = animes.reduce((sum, anime) => {
            return sum + parseInt(anime.rate_4)
          }, 0);
          let total3 = animes.reduce((sum, anime) => {
            return sum + parseInt(anime.rate_3)
          }, 0);
          let total2 = animes.reduce((sum, anime) => {
            return sum + parseInt(anime.rate_2)
          }, 0);
          let total1 = animes.reduce((sum, anime) => {
            return sum + parseInt(anime.rate_1)
          }, 0);
        let votes = total5 + total4 + total3 + total2 + total1;
        data.push({"stars": "Five Star", "rate_count": (total5 /votes ) * 100});
        data.push({"stars": "Four Star", "rate_count": (total4 /votes ) * 100});
        data.push({"stars": "Three Star", "rate_count": (total3 /votes ) * 100} );
        data.push({"stars": "Two Star", "rate_count": (total2 /votes ) * 100});
        data.push({"stars": "One Star", "rate_count": (total1 /votes ) * 100});
        return data;
    }
    drawPie(svg, data){
        let ordScale = d3.scaleOrdinal()
        .domain(data)
        .range(['#ffd384','#94ebcd','#fbaccc','#d3e0ea','#fa7f72']);
        let pie = d3.pie().value(function(d) { 
            return d.rate_count; 
        });
        let g = svg.append("g").attr("transform", "translate(" + 450 + "," + 450 + ")");
        let arc = g.selectAll("arc")
                .data(pie(data))
                .enter();
        let path = d3.arc()
        .outerRadius(this.radius)
        .innerRadius(0);

        arc.append("path")
            .attr("d", path)
            .attr("fill", function(d) { return ordScale(d.data.stars); });

            let label = d3.arc()
            .outerRadius(this.radius)
            .innerRadius(0);
  
            arc.append("text")
            .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
            })
            .text(function(d) { return d.data.stars; })
            .style("font-family", "arial")
            .style("font-size", 15);
    }
}