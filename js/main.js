import { NetworkError } from "./utils.js";

const APP = {
  baseUrl: "https://api.themoviedb.org",
  movieSearchURL: `/3/search/movie?api_key=`,
  tvSearchURL: `/3/search/tv?api_key=`,
  movieCreditsURL: `/3/movie/`,
  tvCreditsURL: `/3/tv/`,
  creditsApiKey: `/credits?api_key=`,
  query: `&query=`,
  apiKey: "f7207100d92c75ab47cda6eae7af2b32",
  mediaCards: document.getElementById("movie-tv-cards"),
  pageId: document.querySelector("body"),
  userMessage: document.querySelector(".user-message"),
  searchMessage: document.querySelector(".search-message"),

  API: {
    imgBaseURL: `https://image.tmdb.org/t/p/`,
    backdrop_sizes: ["w300", "w780", "w1280", "original"],
    logo_sizes: ["w45", "w92", "w154", "w185", "w300", "w500", "original"],
    poster_sizes: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
    profile_sizes: ["w45", "w185", "h632", "original"],
    still_sizes: ["w92", "w185", "w300", "original"],
  },
  init: () => {
    if (APP.pageId.id === "index") {
      //we're on index.html
      APP.readURL();
      window.addEventListener("hashchange", APP.hashChange);
      document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", APP.submitForm);
      });
    } else {
      //we're on credits.html
      document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", APP.submitFormOnCredits);
      });
      const url = new URL(location.href);

      let hash = location.hash;

      let [, media, id, title] = hash.split("/");
      console.log([, media, id, title]);

      if (media && media === "movie") {
        //we need the movie url
        if (id) {
          let mediaId = id;
          const creditsURL =
            APP.baseUrl +
            APP.movieCreditsURL +
            mediaId +
            APP.creditsApiKey +
            APP.apiKey;

          APP.processCredits(creditsURL);
        }
        if (title) {
          let movieTitle = decodeURI(title);
          APP.searchMessage.innerHTML = `<p>Displaying actor credits for Movie "<span class="movie-term">${movieTitle}</span>" `;
        }
      } else {
        if (title) {
          if (title) {
            let tvTitle = decodeURI(title);
            APP.searchMessage.innerHTML = `<p>Displaying actor credits for TV show "<span class="tv-term">${tvTitle}</span>" `;
          }
        }
        //we need the tv url
        let mediaId = id;
        const creditsURL =
          APP.baseUrl +
          APP.tvCreditsURL +
          mediaId +
          APP.creditsApiKey +
          APP.apiKey;
        console.log(url);

        APP.processCredits(creditsURL);
      }
    }
  },
  hashChange: (ev) => {
    console.log("hashchange occurred");
    console.log(ev.target.location.hash);
    let hash = ev.target.location.hash;
    if (hash === "") {
      //the user is on home ./index.html page and we need a blank regular home screen
      let page1 = "./index.html";
      location.href = page1;
    } else {
      APP.readURL();
    }
  },
  submitForm: (ev) => {
    //form submitted
    //stop the page from loading
    ev.preventDefault();
    console.log(ev);
    const movieOrTvForm = ev.target;

    const searchTerm = ev.target[0].value;

    const mediaURL = movieOrTvForm.dataset.media;

    let page1 = "./index.html#/" + mediaURL + "/" + searchTerm + "/";
    location.href = page1;
  },
  processMovieSearch: (url) => {
    if (url) {
      fetch(url)
        .then((res) => {
          if (!res.ok)
            throw new NetworkError(
              "Something went wrong. Please search for a movie or tv show.",
              res
            );

          return res.json();
        })
        .then((data) => APP.buildMovieCards(data))

        .catch((err) => {
          let otherMessages = document.querySelector(".non-error-messages");
          if (otherMessages) {
            otherMessages.innerHTML = "";
          }
          APP.showErrorMessage(err.message);
        });
    }
  },
  processTvSearch: (url) => {
    if (url) {
      fetch(url)
        .then((res) => {
          if (!res.ok)
            throw new NetworkError(
              "Something went wrong. Please search for a movie or tv show.",
              res
            );

          return res.json();
        })
        .then((data) => APP.buildTvCards(data))

        .catch((err) => {
          let otherMessages = document.querySelector(".non-error-messages");
          if (otherMessages) {
            otherMessages.innerHTML = "";
          }
          APP.showErrorMessage(err.message);
        });
    }
  },

  buildMovieCards: (titles) => {
    APP.userMessage.innerHTML = "";
    let results = titles.results;

    if (results.length === 0) {
      APP.searchMessage.innerHTML = "";
      APP.userMessage.innerHTML = `<p>Sorry there are no search results for that term. Please try again!</p>`;
    }
    APP.mediaCards.innerHTML = results
      .map((title) => {
        return `<li class="card movie-card" data-media="movie" id="${title.id}">
            <a class="credits-link" href="./credits.html#/movie/${title.id}/${
          title.title
        }">
              <div class="card__img">
                ${APP.buildMovieImage(title)}
              </div>
              <div class="card__text">
                <h3>${title.title}</h3>
                <p>
                    ${title.overview}
                </p>
                 <p>
                    ${title.release_date}
                </p>
              </div>
            </a>
        </li>`;
      })
      .join("");
  },

  buildTvCards: (titles) => {
    let results = titles.results;

    if (results.length === 0) {
      APP.searchMessage.innerHTML = "";
      APP.userMessage.innerHTML = `<p>Sorry there are no search results for that term. Please try again!</p>`;
    }

    APP.mediaCards.innerHTML = results
      .map((title) => {
        return `<li class="card tv-card" data-media="tv" id="${title.id}">
            <a class="credits-link" href="./credits.html#/tv/${title.id}/${
          title.name
        }">
              <div class="card__img">
                ${APP.buildTvImage(title)}
              </div>
              <div class="card__text" id="${title.id} data-media="tv"">
                <h3>${title.name}</h3>
                <p>
                    ${title.overview}
                </p>
                 <p>
                    ${title.first_air_date}
                </p>
              </div>
            </a>
        </li>`;
      })
      .join("");
  },

  buildMovieImage: (movie) => {
    if (movie.poster_path) {
      return `<img src=${APP.API.imgBaseURL}${APP.API.poster_sizes[4]}${movie.poster_path} alt="cover image from ${movie.title}"/>`;
    }
    return `<img class="default-media" src='./images/vhs.jpg' alt="default movie image"/>`;
  },

  buildTvImage: (tv) => {
    if (tv.poster_path) {
      return `<img src="${APP.API.imgBaseURL}${APP.API.poster_sizes[4]}${tv.poster_path}" alt="cover image from ${tv.name}"/>`;
    }
    return `<img class="default-media" src='./images/tv-static.jpg' alt="default tv image"/>`;
  },

  processCredits: (url) => {
    if (url) {
      fetch(url)
        .then((res) => {
          if (!res.ok)
            throw new NetworkError(
              "Something went wrong. Please search for a movie or tv show.",
              res
            );
          //   APP.spin(false);
          return res.json();
        })
        .then((data) => APP.showCredits(data))
        .catch((err) => {
          //   APP.spin(false);
          // document.querySelector(".choose").style.display = "none";
          let otherMessages = document.querySelector(".non-error-messages");
          if (otherMessages) {
            otherMessages.innerHTML = "";
          }
          APP.showErrorMessage(err.message);
        });
    }
  },
  showCredits: (actors) => {
    let results = actors.cast;

    if (results.length === 0) {
      APP.userMessage.innerHTML = `<p>Sorry there are no actor credits for that search. Please try again!</p>`;
    }
    const creditsCards = document.getElementById("credits-cards");

    creditsCards.innerHTML = results
      .map((actor) => {
        if (actor.profile_path === null) {
          return `<li class="card"><div class="card__img">
      <img src="./images/default-actor.jpg" alt="an image of ${actor.original_name}"/>
    </div><p>${actor.original_name}</p><p>as "${actor.character}"</li>`;
        } else {
          return `<li class="card"><div class="card__img">
        <img src=${APP.API.imgBaseURL}${APP.API.profile_sizes[2]}${actor.profile_path} alt="an image of ${actor.original_name}"/>
      </div><p>${actor.original_name}</p><p>as "${actor.character}"</p></li>`;
        }
      })
      .join("");
  },
  submitFormOnCredits: (ev) => {
    //when someone submits form from credits page
    ev.preventDefault();

    const movieOrTvForm = ev.target;

    const searchTerm = ev.target[0].value;

    const mediaURL = movieOrTvForm.dataset.media;

    let page1 = "./index.html#/" + mediaURL + "/" + searchTerm + "/";
    location.href = page1;
  },
  readURL: () => {
    APP.searchMessage.innerHTML = "";
    APP.userMessage.innerHTML = "";
    const url = new URL(location.href);

    let hash = location.hash;

    let [, media, id, title] = hash.split("/");
    console.log([, media, id, title]);
    if (media && media === "movie") {
      //we need the movie search
      if (id) {
        let mediaId = decodeURI(id);
        APP.searchMessage.innerHTML = `<p>Displaying Movie search results for "<span class="movie-term">${mediaId}</span>" `;
        console.log("displaying movie search on line 367");
        const movieURL =
          APP.baseUrl +
          APP.movieSearchURL +
          APP.apiKey +
          APP.query +
          `${mediaId}`;

        APP.processMovieSearch(movieURL);
        return;
        //get the details for userid
      }
      if (title) {
        let movieTitle = decodeURI(title);
        APP.searchMessage.innerHTML = `<p>Displaying Movie search results for "<span class="movie-term">${movieTitle}</span>" `;
      } else {
        //there is no id and someone hit enter on a movie blank search
        APP.userMessage.innerHTML = `<p>Please enter a search term for a Movie or TV show</p>`;
      }
    } else if (media && media === "tv") {
      if (id) {
        //we need the tv search

        let mediaId = decodeURI(id);
        APP.searchMessage.innerHTML = `<p>Displaying TV search results for "<span class="tv-term">${mediaId}</span>" `;
        const tvURL =
          APP.baseUrl + APP.tvSearchURL + APP.apiKey + APP.query + `${mediaId}`;
        APP.processTvSearch(tvURL);
      } else {
        //there is no id and someone hit enter on a blank tv search
        APP.userMessage.innerHTML = `<p>Please enter a search term for a Movie or TV show</p>`;
      }
    }
  },
  showErrorMessage: (message) => {
    let error = document.querySelector(".error-message");

    error.innerHTML = `<div><p class="error">${message}</p></div>`;
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
