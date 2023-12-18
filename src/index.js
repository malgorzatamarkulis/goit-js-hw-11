import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.querySelector('.gallery');
    const searchForm = document.getElementById('search-form');
    const loadMore = document.querySelector('.load-more');
    const searchInput = document.querySelector('input');
    const notification = Notiflix.Notify;
    let currentQuery = '';
    let page = 1;
    let lightbox;

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        currentQuery = searchInput.value.trim();
        if (!currentQuery) {
            notification.warning('Please enter a search query.');
            return;
        }

        searchImg(currentQuery, true);
    });
    loadMore.style.display = 'none';

    const apiKey = '41317555-7e3e7e9cc6b222d5e9e9f3fbc';

    function smoothScroll() {
        const { height: cardHeight } = document
            .querySelector('.gallery .photo-card')
            .getBoundingClientRect();
        window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
        });
    }

    async function searchImg(query, resetPage = false) {
        if (resetPage) {
            page = 1;
            gallery.innerHTML = '';
        }
        const URL = 'https://pixabay.com/api/';
        const params = {
            key: apiKey,
            q: query,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: 40,
            page: page,
        };
        try {
            const response = await axios.get(URL, { params });
            const { length } = response.data.hits;
            console.log('length :', length);

            if (length === 0) {
                notification.failure(
                    'Sorry, there are no images matching your search query. Please try again.'
                );
                return;
            }

            if (length < 40) {
                if (resetPage) {
                    Notiflix.Notify.warning(
                        "We're sorry, but you've reached the end of search results."
                    );
                }
                loadMore.style.display = 'none';
                processImages(response.data.hits);
                page++;
                return;
            }

            if (length === 40) {
                loadMore.style.display = 'block'
                processImages(response.data.hits);
                page++;
                return;
            }

        } catch (error) {
            console.error('Error:', error);
            Notiflix.Notify.failure('Error! Try again later!');
        }
    }
    function processImages(images) {
        images.forEach(image => {
            const {
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            } = image;
            const card = document.createElement('div');
            card.classList.add('photo-card');
            card.innerHTML = ` <a href="${largeImageURL}" data-lightbox="gallery">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="details">
    <p class="info"><b>Likes:</b> ${likes}</p>
    <p class="info"><b>Views:</b> ${views}</p>
    <p class="info"><b>Comments:</b> ${comments}</p>
    <p class="info"><b>Downloads:</b> ${downloads}</p>
  </div>
    `;
            gallery.appendChild(card);
        });
        if (!lightbox) {
            lightbox = new SimpleLightbox('.gallery a', {
                captions: true,
                captionDelay: 250,
                captionSelector: 'img',
                captionsData: 'alt',
                captionPosition: 'bottom',
            });
        }
        lightbox.refresh();
        smoothScroll();
    }
    loadMore.addEventListener('click', () => {

        searchImg(currentQuery);
    });
});