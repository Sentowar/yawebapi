ymaps.ready(init);

const points = [
        {'coords':[55.831903,37.411961],
         'name':'test1',
         'review':'review1'},
        {'coords':[55.831903,37.411961],
         'name':'test11',
         'review':'review11'},
        {'coords':[55.831903,37.411961],
         'name':'test111',
         'review':'review111'},
        {'coords': [55.763338,37.565466],
        'name':'test2',
        'review': 'review2'},
        {'coords':[55.763338,37.565466],
         'name':'test3',
         'review':'reiew3'},
        {'coords':[55.744522,37.616378],
         'name':'test4',
         'review':'review4'},
        {'coords':[55.780898,37.642889],
         'name':'test5',
         'review':'review5'},
        {'coords':[55.793559,37.435983],
         'name':'test6',
         'review':'review6'},
        {'coords':[55.800584,37.675638],
         'name':'test7',
         'review':'review7'}
    ]

function init(){ 
    var myMap = new ymaps.Map("map", {
	center: [55.76, 37.64],
        zoom: 12
    }); 

    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.address|raw }}</h2>' +
        '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );
    
    var customBaloonContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h3 class=ballon_header>{{ properties.address|raw }}</h3>' +
        '<div class=ballon_body>{{ properties.reviews|raw }}</div>' +
        '<input type="text">' +
        '<div><input type="button" class="add_review" value="Добавить отзыв"></div>'
    );

    myMap.events.add('click', function (e) {
        if (!myMap.balloon.isOpen()) {
            var coords = e.get('coords');;
            myMap.balloon.open(coords, {
                test: '123',
                address: getAddress(coords),
                contentBody:'<p>Кто-то щелкнул по карте.</p>' +
                    '<p>Координаты щелчка: ' + [
                    coords[0].toPrecision(6),
                    coords[1].toPrecision(6)
                    ].join(', ') + '</p>',
                contentFooter:'<sup>Щелкните еще раз</sup>'
                });
            myMap.balloon    
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
        clusterBalloonItemContentLayout: customItemContentLayout,
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
                reviews : [points[i].name + ': ' + points[i].review + '<br>']
                },
                {balloonContentLayout: customBaloonContentLayout}
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