class Anime_Utils {
    constructor() {}
    getAllAnime(data) {
        return data.map(d => d.anime);
    }
    getAllInGenres(data, genre) {
        return data.filter(d => d[genre] === "1.0");
    }
    getGeners(anime) {
        if (anime == null)
            return this.getAllGenres();

        let geners = [];
        if (anime.genre_action === '1.0') {
            geners.push("genre_action");
        }
        if (anime.genre_adventure === '1.0') {
            geners.push("genre_adventure");
        }
        if (anime.genre_comedy === '1.0') {
            geners.push("genre_comedy");
        }
        if (anime.genre_drama === '1.0') {
            geners.push("genre_drama");
        }
        if (anime.genre_family === '1.0') {
            geners.push("genre_family");
        }
        if (anime.genre_fantasy === '1.0') {
            geners.push("genre_fantasy");
        }
        if (anime.genre_food === '1.0') {
            geners.push("genre_food");
        }
        if (anime.genre_harem === '1.0') {
            geners.push("genre_harem");
        }
        if (anime.genre_historical === '1.0') {
            geners.push("genre_historical");
        }
        if (anime.genre_horror === '1.0') {
            geners.push("genre_horror");
        }
        if (anime.genre_idols === '1.0') {
            geners.push("genre_idols");
        }
        if (anime.genre_isekai === '1.0') {
            geners.push("genre_isekai");
        }
        if (anime.genre_jdrama === '1.0') {
            geners.push("genre_jdrama");
        }
        //genre_magical girls
        //genre_martial arts
        if (anime.genre_mecha === '1.0') {
            geners.push("genre_mecha");
        }
        if (anime.genre_music === '1.0') {
            geners.push("genre_music");
        }
        if (anime.genre_mystery === '1.0') {
            geners.push("genre_mystery");
        }
        //genre_post-apocalyptic
        if (anime.genre_romance === '1.0') {
            geners.push("genre_romance");
        }
        //genre_sci-fi
        if (anime.genre_seinen === '1.0') {
            geners.push("genre_seinen");
        }
        if (anime.genre_sgdrama === '1.0') {
            geners.push("genre_sgdrama");
        }
        if (anime.genre_shojo === '1.0') {
            geners.push("genre_shojo");
        }
        if (anime.genre_shonen === '1.0') {
            geners.push("genre_shonen");
        }
        //genre_slice of life
        if (anime.genre_sports === '1.0') {
            geners.push("genre_sports");
        }
        if (anime.genre_supernatural === '1.0') {
            geners.push("genre_supernatural");
        }
        if (anime.genre_thriller === '1.0') {
            geners.push("genre_thriller");
        }

        if (geners.length == 0) {

            geners = this.getAllGenres();

        }
        return geners;
    }

    getAllGenres() {

        let geners = [];
        geners.push("genre_action");
        geners.push("genre_adventure");
        geners.push("genre_comedy");
        geners.push("genre_drama");
        geners.push("genre_family");
        geners.push("genre_fantasy");
        geners.push("genre_food");
        geners.push("genre_harem");
        geners.push("genre_historical");
        geners.push("genre_horror");
        geners.push("genre_idols");
        geners.push("genre_isekai");
        geners.push("genre_jdrama");
        geners.push("genre_mecha");
        geners.push("genre_music");
        geners.push("genre_mystery");
        geners.push("genre_romance");
        geners.push("genre_seinen");
        geners.push("genre_sgdrama");
        geners.push("genre_shojo");
        geners.push("genre_shonen");
        geners.push("genre_sports");
        geners.push("genre_supernatural");
        geners.push("genre_thriller");
        return geners;
    }
}