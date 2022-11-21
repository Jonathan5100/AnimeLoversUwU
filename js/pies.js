//used this as help https://observablehq.com/@analyzer2004/waffle-chart 
class Pies {
    radius = 300;
    width = 450;
    waffleSize = 40;
    padding= {x:0, y:0};
    colors = ['#ffd384','#94ebcd','#fbaccc','#d3e0ea','#fa7f72'];
    ratings = ["Five Star","Four Star","Three Star","Two Star","One Star"];
    constructor(globalApplicationState){
        this.globalApplicationState = globalApplicationState;
        this.svg_anime =  d3.select('#pie-chart-anime-div').append('svg')
        .attr('class', "pieSvg")
        .attr('width', this.width)
        .attr('height', this.width)
        .attr('id', "pie-chart-anime");
        this.svg_genre =  d3.select('#pie-chart-genre-div').append('svg')
        .attr('class', "pieSvg")
        .attr('width', this.width)
        .attr('height', this.width)
        .attr('id', "pie-chart-anime");

        let svg_key =  d3.select('#pie-chart-key-div').append('svg')
        .attr('width', this.width)
        .attr('height', 310)
        .attr('id', "pie-chart-key");

        let offsetX = 115;
        this. ordScale = d3.scaleOrdinal()
        .domain(this.ratings)
        .range(this.colors);
        svg_key.append('text')
        .text("Key")
        .attr("fill", "black")
        .attr('x', 70 + offsetX)
        .attr('y', 25)
        .style("font-size", "34px")
        .attr("font-weight", "bold");
        svg_key.selectAll('rect')
        .data(this.ratings)
        .join('rect')
        .text(d=> d)
        .attr("fill", d => this.ordScale(d))
        .attr('x', 50 + offsetX)
        .attr('y', (d,i) => i * 55 + 35)
        .attr("rx", 3).attr("ry", 3)
        .attr("width", 100)
        .attr("height", 50) ;

        svg_key.selectAll('.keyText')
        .data(this.ratings)
        .join('text')
        .text(d=> d)
        .attr("fill", "black")
        .attr('x', 70 + offsetX)
        .attr('y', (d,i) => i * 55 + 65)
        .attr("rx", 3).attr("ry", 3);
    }
    update() {
       
        // this.drawPie(this.svg_anime, data_anime);
        
        if(this.globalApplicationState.selected_anime === null)
            return;
        this. data_anime = this.getRatingsPerAnime(this.globalApplicationState.selected_anime);
        this.updateGenre();
        
            // + ' '
            // + 
            // + ' '
            // + Math.round(data_anime[0].rate_count  * 100) / 100 
            // + '% vs '
            // + Math.round(data_genre[0].rate_count  * 100) / 100 
            // +'%)'
            // + ' When comparing one stars, "'
            // + this.globalApplicationState.selected_anime.anime 
            // + (data_anime[4].rate_count <= data_genre[4].rate_count ? '"has better' :  '"has worst')
            // + ' then average percentage of 1 stars. ('
            // + Math.round(data_anime[4].rate_count  * 100) / 100 
            // + '% vs '
            // + Math.round(data_genre[4].rate_count  * 100) / 100 
            // +'%)'
        this.drawWaffle(this.svg_anime, this.data_anime);
    }
    storyTelling(){
        d3.select('#info-text').attr('class', '');
        d3.select("#anime_header").text('' + this.globalApplicationState.selected_anime.anime);
        d3.selectAll('.genre_name').text('' + this.globalApplicationState.selected_genre.replaceAll('_', ' '));
        d3.selectAll('.anime_name').text(this.globalApplicationState.selected_anime.anime );
        d3.select('#BW5').text((this.data_anime[0].rate_count >= this.data_genre[0].rate_count ? 'better' :  'worst'));
        d3.select('#A5').text(Math.round(this.data_anime[0].rate_count  * 100) / 100 );
        d3.select('#G5').text(Math.round(this.data_genre[0].rate_count  * 100) / 100 );
        d3.select('#BW1').text((this.data_anime[4].rate_count <= this.data_genre[4].rate_count ? 'better' :  'worst'));
        d3.select('#A1').text(Math.round(this.data_anime[4].rate_count  * 100) / 100);
        d3.select('#G1').text(Math.round(this.data_genre[4].rate_count  * 100) / 100 );
    }
    updateGenre(){
        this.data_genre = this.getRatingsPerGenre(this.globalApplicationState.selected_genre);
        d3.select("#genre_header").text('' + this.globalApplicationState.selected_genre.replaceAll('_', ' ') );
        if(this.data_anime !== null)
            this.storyTelling();
        this.drawWaffle(this.svg_genre, this.data_genre);
        // this.drawPie(this.svg_genre, data_genre);
    }
    getRatingsPerAnime(anime){
        let data = [];
        data.push({"stars": "Five Star", "rate_count": (parseInt(anime.rate_5) / parseInt (anime.votes) ) * 100, "order" : 1, "total" :anime.rate_5});
        data.push({"stars": "Four Star", "rate_count": (parseInt(anime.rate_4) / parseInt (anime.votes) ) * 100, "order" : 2, "total" :anime.rate_4});
        data.push({"stars": "Three Star", "rate_count": (parseInt(anime.rate_3) / parseInt (anime.votes) ) * 100, "order" : 3, "total" :anime.rate_3} );
        data.push({"stars": "Two Star", "rate_count": (parseInt(anime.rate_2) / parseInt (anime.votes) ) * 100, "order" : 4 , "total" :anime.rate_2});
        data.push({"stars": "One Star", "rate_count": (parseInt(anime.rate_1) / parseInt (anime.votes) ) * 100, "order" : 5, "total" :anime.rate_1});
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
        data.push({"stars": "Five Star", "rate_count": (total5 /votes ) * 100, "order" : 1, "total" : total5});
        data.push({"stars": "Four Star", "rate_count": (total4 /votes ) * 100, "order" : 2, "total" : total4});
        data.push({"stars": "Three Star", "rate_count": (total3 /votes ) * 100, "order" : 3, "total" : total3} );
        data.push({"stars": "Two Star", "rate_count": (total2 /votes ) * 100, "order" : 4, "total" : total2});
        data.push({"stars": "One Star", "rate_count": (total1 /votes ) * 100, "order" : 5, "total" : total1});
        return data;
    }
    drawPie(svg, data){
        let ordScale = d3.scaleOrdinal()
        .domain(data)
        .range(['#ffd384','#94ebcd','#fbaccc','#d3e0ea','#fa7f72']);
        let pie = d3.pie().value(function(d) { 
            return d.rate_count; 
        }).sort(function (a, b) {
            return b.order - a.order
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
            .outerRadius(this.radius + 100)
            .innerRadius(0);
  
            arc.append("text")
            .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
            })
            .text(function(d) { return d.data.stars; })
            .style("font-family", "arial")
            .style("font-size", 15);
    }
    drawWaffle(svg, data){
        let waffles = this.waffleMyData(data);
        
        let g = svg.selectAll(".waffle")  
        .data(waffles)
        .join("g")
        .attr("class", "waffle");

        let numPerRow = 10;
        g.attr("transform", (d, i) => {
        let r = Math.floor(i / numPerRow);
        let c = i - r * numPerRow;
        return `translate(${c * (this.waffleSize + this.padding.x)},${r * (this.waffleSize + this.padding.y)})`
        });
        g.selectAll('rect').remove();
        let cellSize = this.waffleSize -5;
        let cells = g
          .selectAll('rect')
          .data(d => [d])
          .join('rect')
          .on('mouseover', (event, d) => this.updateHoverOn(event, d))
          .on('mouseout', (event, d) => this.updateHoverOff(event, d))
          .transition()
            .duration(1200)
          .attr("fill", d => this.ordScale(d.stars));

        cells
          .attr("rx", 3).attr("ry", 3)
          .attr("width", cellSize).attr("height", cellSize) ;
          
    }
    waffleMyData(data){
        data = this.forceTotal(data);
        let waffle = [];
        let x =0 ,y =0, index =0;

        for(let d of data){
            let i =0;
            let num = d.rate_count;
            for(let i = 0; i < num; i++){
                waffle.push({x : x, y:y, stars:d.stars, total:d.total, rate_count: d.un_rounded});
                if (x === 9){
                    x = 0;
                    y ++;
                }else{
                   x++;
                }
            }
            index++;
        }
        return waffle;
    }
    forceTotal(data){
        let max = {rate_count: -1};
        let maxI = 0;
        let I =0;
        // let min = {rate_count: 101};
        let total = 0;
        let ret = JSON.parse(JSON.stringify(data));;
        for(let d of ret){
            d.un_rounded = d.rate_count;
            d.rate_count = Math.ceil(d.rate_count);
            if(max.rate_count > d.rate_count){
                max = d;
                maxI = I;
            }
            // if(min.rate_count < d.rate_count)
            //     min = d;
            total += d.rate_count;
            I++;
        }
        ret[maxI].rate_count =( ret[maxI].rate_count + 100 - total);
        return ret;
    }

    updateHoverOn(event, data){
        let i = (data.y * 10) + data.x;
        let r = Math.floor(i / 10);
        let c = i - r * 10;
        let x = c * (this.waffleSize + this.padding.x); 
        let y = r * (this.waffleSize + this.padding.y);
        d3.select("#genre-tooltip")
        .attr('style',
            "left: " + (x + 65) + "px; top : " + (y -20 )+ "px; visibility: visible")
        let gen = this.data_genre.find(({ stars }) => stars === data.stars);
        
        d3.select("#genre-tooltip-header").text('' + this.globalApplicationState.selected_genre.replaceAll('_', ' '));
        d3.select("#genre-tooltip-top").text("Number of Votes: " + gen.total);
        d3.select("#genre-tooltip-bottom").text("Percentage of Votes: " + gen.rate_count.toFixed(3) + "%");
        let ani = this.data_anime.find(({ stars }) => stars === data.stars);
        d3.select("#anime-tooltip")
        .attr('style',
            "left: " + (x + 65) + "px; top : " +( y -20 ) + "px; visibility: visible")
        d3.select("#anime-tooltip-header").text('' + this.globalApplicationState.selected_anime.anime.replaceAll('_', ' '));
        d3.select("#anime-tooltip-top").text("Number of Votes: " + ani.total);
        d3.select("#anime-tooltip-bottom").text("Percentage of Votes: " + ani.rate_count.toFixed(3) + "%");
    }
    updateHoverOff(event, data){
        d3.select("#genre-tooltip")
        .attr('style',
            "left: " + 0 + "px; top : " + 0 + "px; visibility: hidden")
            d3.select("#anime-tooltip")
            .attr('style',
                "left: " + 0 + "px; top : " + 0+ "px; visibility: hidden")
    }
}