ymaps.ready(init);

const points = [
        {'coords':[55.831903,37.411961],
         'name':'test1',
         'place':'place1',
         'review':'review1',
         'time': '01.01.2020'
        },
        {'coords':[55.831903,37.411961],
         'name':'test11',
         'place':'place1',
         'review':'review11',
         'time': '01.01.2020'},
        {'coords':[55.831903,37.411961],
         'name':'test111',
         'place':'place1',
         'review':'review111',
         'time': '01.01.2020'},
        {'coords': [55.763338,37.565466],
        'name':'test2',
        'place':'place1',
        'review': 'review2',
         'time': '01.01.2020'},
        {'coords':[55.763338,37.565466],
         'name':'test3',
         'place':'place1',
         'review':'reiew3',
         'time': '01.01.2020'},
        {'coords':[55.744522,37.616378],
         'name':'test4',
         'place':'place1',
         'review':'review4',
         'time': '01.01.2020'},
        {'coords':[55.780898,37.642889],
         'name':'test5',
         'place':'place1',
         'review':'review5',
         'time': '01.01.2020'},
        {'coords':[55.793559,37.435983],
         'name':'test6',
         'place':'place1',
         'review':'review6',
         'time': '01.01.2020'},
        {'coords':[55.800584,37.675638],
         'name':'test7',
         'place':'place1',
         'review':'review7',
         'time': '01.01.2020'}
    ]

function init(){ 
    var myMap = new ymaps.Map("map", {
	center: [55.76, 37.64],
        zoom: 12
    }); 

    var carouselBalloonLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<div><b>{{properties.name}}</b></div>' +
        '<a href="#" id="go_to_balloon">{{properties.address|raw}}</a>' + 
        '<div>{{ properties.reviews|raw}}</div>' +
        '<div>{{properties.time|raw}}</div>'+
        '<input type="hidden" value="{{properties.coords}}" id="place_coords">',
        {
            build: function () {
                // Сначала вызываем метод build родительского класса.
                carouselBalloonLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                document.querySelector('#go_to_balloon').addEventListener('click', this.go_to_balloon)
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                document.querySelector('#go_to_balloon').removeEventListener('click', this.go_to_balloon);
                carouselBalloonLayout.superclass.clear.call(this);
            },
            
            go_to_balloon: function() { 
                const coords = document.querySelector('#place_coords').value;
                console.log(coords);
                myMap.balloon.open(coords, {},
                    {contentLayout: newReviewBalloonLayout}
                );
            }
        }
    );
    var newReviewBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div>{{address}}</div>'+
        '<div id="all_reviews" style="height: 100px; max-height: 150px; overflow: hidden">{% if properties.reviews %} {{ properties.reviews|raw }} {% else %} Отзывов пока нет {% endif %}</div>'+
        '<div>Имя: <input type="text" id="user_name"></div>'+
        '<div>Место: <input type="text" id="user_place"></div>'+
        '<div>Оставьте отзыв: <textarea id="user_review"></textarea></div>'+
        '<div><input type="button" id="add_review" value="Добавить отзыв"></div>'+
        '<input type="hidden" value="{% if properties.coords %} {{properties.coords}} {% else %} {{coords}} {% endif %}" id="user_coords">',
        {
            build: function () {
                // Сначала вызываем метод build родительского класса.
                newReviewBalloonLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                document.querySelector('#add_review').addEventListener('click', this.sendReview)
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                document.querySelector('#add_review').removeEventListener('click', this.sendReview);
                newReviewBalloonLayout.superclass.clear.call(this);
            },
            sendReview : function(){
                const newPlace = {};
                const newPlacemarks = [];
                console.log(document.querySelector('#user_coords').value);
                const coords = JSON.parse(document.querySelector('#user_coords').value);
                newPlace.coords = coords;
                newPlace.name = document.querySelector('#user_name').value;
                newPlace.place = document.querySelector('#user_place').value;
                newPlace.review = document.querySelector('#user_review').value;
                const now = new Date();
                newPlace.time = now.getDate() +'.'+ now.getMonth() + '.' + now.getFullYear()
                points.push(newPlace);
                
                newPlacemarks[newPlace.time] = new ymaps.Placemark(coords, {
                    reviews: newPlace.name + ':' + newPlace.review,
                    time: newPlace.time
                },
                {balloonContentLayout: newReviewBalloonLayout});
                getAddress(coords, newPlacemarks[newPlace.time]);
                myMap.geoObjects.add(newPlacemarks[newPlace.time]);
                
                geoObjectsFinal.push(newPlacemarks[newPlace.time])
                clusterer.add(geoObjectsFinal);
                myMap.geoObjects.add(clusterer);

                let reviews = document.querySelector('#all_reviews');
                const newReview = document.createElement('p');
                newReview.style.margin = "0";
                newReview.innerHTML = newPlace.place + ':' + newPlace.review;
                if(reviews.querySelector('p')==null){
                    reviews.innerHTML = '';
                }
                reviews.append(newReview);
                document.querySelector('#user_name').value = '';
                document.querySelector('#user_place').value = '';
                document.querySelector('#user_review').value = '';
            }
        }
    );
    
    myMap.events.add('click', function (e) {
        if (!myMap.balloon.isOpen()) {
            var coords = e.get('coords');
            myMap.balloon.open(coords, {},
                {contentLayout: newReviewBalloonLayout}
            );
            ymaps.geocode(coords, {
                }).then(function(res){
                    myMap.balloon.setData({address: res.geoObjects.get(0).getAddressLine(),
                    coords: JSON.stringify(coords)});
                });
        }
        else {
            myMap.balloon.close();
        }
    });

    // Определение кластера    
    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: carouselBalloonLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5
        // Настройка внешнего вида нижней панели.
        // Режим marker рекомендуется использовать с небольшим количеством элементов.
        // clusterBalloonPagerType: 'marker',
        // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
        // clusterBalloonCycling: false,
        // Можно отключить отображение меню навигации.
        // clusterBalloonPagerVisible: false
    });
    const geoObjects = [];
    
    let addedCoords = {};

    for (var i = 0, len = points.length; i < len; i++) {
        if(addedCoords[points[i].coords]==undefined){
            geoObjects[i] = new ymaps.Placemark(points[i].coords, {
                reviews : [points[i].name + ': ' + points[i].review + '<br>'],
                time: points[i].time,
                coords : JSON.stringify(points[i].coords)
                },
                {balloonContentLayout: newReviewBalloonLayout}
            );
            getAddress(points[i].coords, geoObjects[i]);
            addedCoords[points[i].coords]=i;
        }else{
            geoObjects[addedCoords[points[i].coords]].properties._data.reviews.push(points[i].name + ': ' + points[i].review + '<br>'); 
        }
    }
    let geoObjectsFinal = geoObjects.filter(el => el!==null);
    clusterer.add(geoObjectsFinal);
    myMap.geoObjects.add(clusterer);
}

function getAddress(coords, placemark) {
    ymaps.geocode(coords).then(function (res) {
        var firstGeoObject = res.geoObjects.get(0);
        //console.log(firstGeoObject.properties._data.name);
        //console.log(firstGeoObject.getAddressLine());
        placemark.properties.set({
            address: firstGeoObject.getAddressLine()
        });
    });   
}

export {
  init
}