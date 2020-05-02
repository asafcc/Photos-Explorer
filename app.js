const auth = "563492ad6f91700001000001a6f276e789b44132ad5f9dae1f44ae17";
//563492ad6f91700001000001a6f276e789b44132ad5f9dae1f44ae17
//563492ad6f917000010000018904a50e52b94bb2929de0c2d2ebc5cf
const gallery = document.querySelector(".gallery");
const searchInput = document.querySelector(".search-input");
const form = document.querySelector(".search-form");

const loading = document.querySelector(".loader"); //loading dots

let searchValue;
let page = 1;
let fetchLink;
let currentSearch;

//typing in the seatch bar
searchInput.addEventListener("input", updateInput);

//searching event listner
form.addEventListener("submit", (e) => {
  e.preventDefault();
  currentSearch = searchValue;
  searchPhotos(searchValue);
});

//update the searchValue to current search
function updateInput(e) {
  searchValue = e.target.value;
}

//return data from given url
async function fetchApi(url) {
  const dataFetch = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: auth,
    },
  });
  const data = await dataFetch.json();

  return data;
}

//adds photos to the page
function generatePictures(data, localList, likeClass) {
  data.photos.forEach((photo) => {
    if (!localList.includes(photo.id.toString())) {
      const galleryImg = createPhotoContainer(
        photo.photographer,
        photo.src.large,
        photo.src.original,
        photo.id,
        likeClass
      );
      appendImgToGalleryAndEvents(galleryImg);
    }
  });
}

function appendImgToGalleryAndEvents(img) {
  gallery.appendChild(img);
  img.addEventListener("mouseenter", mouseEnterHover);
  img.addEventListener("mouseleave", mouseLeave);
  img.querySelector(".fa-heart").addEventListener("click", toggleLike);
}

//create a div for adding to the HTML
function createPhotoContainer(name, img, fullImg, id, likeClass) {
  const galleryImg = document.createElement("div");
  galleryImg.classList.add("photo-container");
  galleryImg.innerHTML = `<img id="${id}"
  src="${img}"
  alt=""
  />
  <i class="fas fa-heart ${likeClass}"></i>
  
  <div class="img-text">
  <h1>${name}</h1>
  <a href="${fullImg}">Download</a>
  </div>`;
  return galleryImg;
}

//get 15 first images from api
async function curatedPhotos() {
  let localList = getLocalstorage();
  let likedPhotos = [];

  if (localList) {
    //adds liked photos to page
    for (photoID of localList) {
      fetchLink = `https://api.pexels.com/v1/photos/${photoID}`;
      let likedPic = await fetchApi(fetchLink);
      likedPhotos.push(likedPic);
    }
    likedPhotos.forEach((data) => {
      const galleryImg = createPhotoContainer(
        data.photographer,
        data.src.large,
        data.src.original,
        data.id,
        "like"
      );
      appendImgToGalleryAndEvents(galleryImg);
    });
  }
  //adds photos to page
  fetchLink = "https://api.pexels.com/v1/curated?per_page=15&page=1";
  const data = await fetchApi(fetchLink);
  generatePictures(data, localList, "");
}

//half transparent affect on img text when hover
function mouseEnterHover(e) {
  e.target.querySelector(".img-text").classList.add("open");
}
//half transparent affect on img text when hover
function mouseLeave(e) {
  e.target.querySelector(".img-text").classList.remove("open");
}

//turn on/off like button
function toggleLike(e) {
  if (e.target.classList.contains("like")) {
    // the photo was disliked
    e.target.classList.remove("like");
    removePhotoFromLocalStorage(e.target.parentElement);
  } else {
    //the photo was liked
    e.target.classList.add("like");
    savePhotoToLocalStorage(e.target.parentElement);
  }
}

//load more images
async function loadMore() {
  page++;
  if (currentSearch) {
    fetchLink = `https://api.pexels.com/v1/search?query=${currentSearch}+query&per_page=15&page=${page}`;
  } else {
    fetchLink = `https://api.pexels.com/v1/curated?per_page=15&page=${page}`;
  }
  const data = await fetchApi(fetchLink);
  const localList = getLocalstorage();
  console.log(currentSearch);
  generatePictures(data, localList, "");
}

//get images based on query
async function searchPhotos(query) {
  clear();
  let localList = getLocalstorage();
  fetchLink = `https://api.pexels.com/v1/search?query=${query}+query&per_page=15&page=1`;
  const data = await fetchApi(fetchLink);
  generatePictures(data, localList, "");
}

//clear input search bar
function clear() {
  searchInput.value = "";
  gallery.innerHTML = "";
}

//saves liked photo to LS
function savePhotoToLocalStorage(photo) {
  let localList = getLocalstorage();
  localList.push(photo.children[0].id);
  localStorage.setItem("likedList", JSON.stringify(localList));
}
//removes liked photo to LS
function removePhotoFromLocalStorage(photo) {
  let localList = getLocalstorage();
  photoID = photo.children[0].id;
  localList = localList.filter((likedImg) => {
    return likedImg !== photoID;
  });

  localStorage.setItem("likedList", JSON.stringify(localList));
}

//get what's in LS
function getLocalstorage() {
  let localList;
  if (localStorage.getItem("likedList") === null) {
    localList = [];
  } else {
    localList = JSON.parse(localStorage.getItem("likedList"));
  }
  return localList;
}

//show loading dots effect and fetch more photos
function showLoading() {
  loading.classList.add("show");
  setTimeout(() => {
    loading.classList.remove("show");
    setTimeout(() => {
      loadMore();
    }, 300);
  }, 1000);
}

//loading dots event on scroll
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    showLoading();
  }
});

curatedPhotos();

// localStorage.clear();
