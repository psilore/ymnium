
const endpoint = 'http://localhost:8080'
const path = '/movies'
const moviesUrl = `${endpoint}${path}`



// Might use an endpoint, must figure out how to hide API key in request

let currentMovie;

function getMovieByName(string) {
  //let url = '${endpoint}${path}' + name;
  const endpoint = 'http://localhost:8080'
  const path = '/movies'
  const url = new URL(endpoint + path + '/' + string);
  console.log(url)
  fetch(url)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      currentMovie = {
        "description": data.description,
        "genre": data.genre,
        "hasSeen": data.hasSeen,
        "isFavourite": data.isFavourite,
        "length": data.length,
        "title": data.title,
        "year": data.year
      }
      window.localStorage.setItem('current', JSON.stringify(currentMovie))
    })
    .catch((err) => {
    })
} 

/* fetch(moviesUrl)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      response.json().then(function(data) {
        console.log(data);
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  }); 

async function getMovies() {
    let response = await fetch(moviesUrl);

    console.log(response.status); // 200
    console.log(response.statusText); // OK

    if (response.status === 200) {
        let data = await response.text();
        // handle data
        return data
    }
} */

//getMovies();


const modal = document.querySelector('.modal');
const modalButton = document.querySelectorAll('.modal-button');
const modalForm = document.querySelector('form');
const title = modalForm[0];
const length = modalForm[1];
const year = modalForm[2];
const genre = modalForm[3];
const description = modalForm[4];
const hasSeen = modalForm[5];
const isFavourite = modalForm[6];

function handleForm(event) { 
  event.preventDefault(); 
  const data = Object.fromEntries(new FormData(event.target).entries());

  
  const endpoint = 'http://localhost:8080'
  const path = '/movies/update'
  const updateUrl = new URL(endpoint + path);

  fetch(updateUrl, {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        data: data
      })
    })
    .then((response) => {
      return response.json()
    })
    .then((data) => {

    })
    .catch((err) => {
    })
  
} 
modalForm.addEventListener('submit', handleForm);

hasSeen.addEventListener('change', function() {
  if (this.checked) {
    this.value = 'true';
  } else {
    this.value = 'false';
  }
});

isFavourite.addEventListener('change', function() {
  if (this.checked) {
    this.value = 'true';
  } else {
    this.value = 'false'
  }
});

if(modalButton) {
  for (var i = 0; i < modalButton.length; i++) {
    modalButton[i].addEventListener('click', function(event) {
      //console.log(event.currentTarget.getAttribute('data-name'))
      modal.classList.add('active');
      window.localStorage.setItem('active', true);
      modalForm.getElementsByTagName('input')[0].focus();
      event.preventDefault();
    });
  }
}

document.querySelector('.close-button')
  .addEventListener("click", (event) => {
  window.localStorage.setItem('active', false);
  window.localStorage.removeItem('current');
  modal.classList.remove('active');
  event.preventDefault();
});


const details = document.querySelectorAll('details');
const firstNodeInDetail = details[0]; 


if(details) {

  for (let index = 0; index < details.length; index++) {
    details[index].addEventListener('click', (event) => {
      const currentŃame = event.currentTarget.getAttribute('data-name');
      getMovieByName(currentŃame)
      const currentMovie = JSON.parse(window.localStorage.getItem('current'));
      console.log('Setting current')
      if(modalForm) {
        if(currentMovie) {
          title.value = currentMovie.title
          description.value = currentMovie.description
          length.value = currentMovie.length
          year.value = currentMovie.year
          genre.value = currentMovie.genre
          if(currentMovie.hasSeen == 'true') {
            document.getElementById('formHasSeen').checked = true
          } else {
            document.getElementById('formHasSeen').checked = false
          }

          if(currentMovie.isFavourite == 'true') {
            document.getElementById('formIsFavourite').checked = true
          } else {
            document.getElementById('formIsFavourite').checked = false
          }
        }
      } 
    });
  }
}
 

if(details) {

  details.forEach((targetDetail) => {
    targetDetail.addEventListener('click', (event) => {
      details.forEach((detail) => {
        if (detail !== targetDetail) {
          detail.removeAttribute('open');
        }
      });
    });
  }); 
}

function openFirstItemDetailOnLoad() {
  firstNodeInDetail.setAttribute('open', true);
  firstNodeInDetail.focus();
  const isModalActive = window.localStorage.getItem('active');

  if(isModalActive != 'false') {
    modal.classList.add('active');
  } else {
    window.localStorage.setItem('active', false);
    modal.classList.remove('active');
  }

  

}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    console.log('from New York')

    const isModalActive = window.localStorage.getItem('active');
    if(modalForm) {
      if(isModalActive == 'true') {
        modal.classList.remove('active');
      }
    }
  }
});

function populateModalWithCurrentMovie() {
  if(modalForm) {
    const currentMovie = JSON.parse(window.localStorage.getItem('current'));
    if(currentMovie) {
      title.value = currentMovie.title
      description.value = currentMovie.description
      length.value = currentMovie.length
      year.value = currentMovie.year
      genre.value = currentMovie.genre
      if(currentMovie.hasSeen == 'true') {
        document.getElementById('formHasSeen').checked = true
      } else {
        document.getElementById('formHasSeen').checked = false
      }
      if(currentMovie.isFavourite == 'true') {
        document.getElementById('formIsFavourite').checked = true
      } else {
        document.getElementById('formIsFavourite').checked = false
      }
    }
  } 
}

function handleNavigation() {
  let navigation = window.performance.getEntriesByType("navigation")[0].type;

  if (window.performance) {

    if (navigation == 'reload' || navigation == 'navigate') {
      console.log(navigation);
      populateModalWithCurrentMovie()
    } else {
    
    }
    
  } else {
    console.log('What browser?');
  }

}

document.addEventListener("DOMContentLoaded", function(event) {
  openFirstItemDetailOnLoad();
  
  const firstMovieInList = document.querySelectorAll('details')[0].getAttribute('data-name');
  getMovieByName(firstMovieInList);
  handleNavigation()
});

