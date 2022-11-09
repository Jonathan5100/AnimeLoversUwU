class Pies {
    constructor(globalApplicationState){
        this.globalApplicationState = globalApplicationState;
        console.log('yo from pies');
    }
    update() {
        this.selected_genre = this.globalApplicationState.anime_utils.getGeners(this.globalApplicationState.selected_anime)[0] ?? 'genre_shonen'
        console.log("all in genre " + this.selected_genre + " are ")
        console.log(this.globalApplicationState.anime_utils.getAllInGenres(this.globalApplicationState.anime_data, this.selected_genre));
    }
}