let searchOptions={
    method: 'flickr.photos.search', // endpoint
    api_key: '',// stored in js/keys.js
    tags:'landscape',
    media: 'photos',
    lat: '',
    lon: '',
    radius: 10,
    radius_units: 'mi',
    format: 'json',
    nojsoncallback: 1,

    extras: 'url_n',
    content_type: 1,
    safe_search: 1,
    sort: 'relevance',
};