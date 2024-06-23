mapboxgl.accessToken = mapToken;
const obj = JSON.parse(campground)
const map = new mapboxgl.Map({
    container: 'map',
    center: obj.geometry.coordinates,
    zoom: 9
});

new mapboxgl.Marker()
    .setLngLat([obj.geometry.coordinates])
    .addTo(map)

