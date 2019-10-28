var KE = [];

$(document).ready(function () {
    //jQuery('#mymodal').modal('show')
    map = new L.Map('map');
    map.fitWorld().zoomIn();
    control = L.control.layers({
        'MapBox': L.tileLayer.provider('MapBox', { id: 'rafnuss.npl3amec', accessToken: token.mapbox }).addTo(map),
        'OpenStreetMap': L.tileLayer.provider('OpenStreetMap.Mapnik'),
        'Satellite': L.tileLayer.provider('Esri.WorldImagery')
    }, null, { collapsed: false }).addTo(map);

    L.MakiMarkers.accessToken = token.mapbox;
    markers = L.markerClusterGroup({
        showCoverageOnHover: 1,
        maxClusterRadius: 50,
        iconCreateFunction: function (cluster) {
            return L.icon({
                iconUrl: "https://zoziologie.raphaelnussbaumer.com/assets/Merge2Hotspot/images/hotspot-icon-hotspot-plus_small.png",
                iconAnchor: [12, 30],
                popupAnchor: [0, -12],
            })
        }
    }).addTo(map);


    jQuery('input[name="selectDate"]').on('click', function(){
        jQuery(this).parent().toggleClass('active')
        jQuery('#nb-hotspot').html(checklistFilter().length+' Hotspots');
    })
    jQuery('#number-species').on('change',function(){
        jQuery('#nb-hotspot').html(checklistFilter().length+' Hotspots');
    })
    jQuery('#number-checklists').on('change',function(){
        console.log('ee')
        jQuery('#nb-hotspot').html(checklistFilter().length+' Hotspots');
    })
});



let runTable = function () {
    tmp = checklistFilter()
    tmp.forEach(function (t) {
        Object.keys(t.values).forEach(function (key) {
            t.values[key] = t.values[key].reduce(function (acc, cur, idx) {
                return Math.round(acc + cur * t.values_N[idx])
            });
        });
        t.values.name = t.locName;
        app.data.push(t.values);
    })
}

let checklistFilter = function () {
    numChecklists = jQuery('#number-species').val();
    numSpecies = jQuery('#number-checklists').val();
    selectedDate = [];
    jQuery('#select-Date > label').toArray().forEach(function(i){
        if (jQuery(i).hasClass('active')){
            selectedDate.push(jQuery(i).children()[0].value*4)
            selectedDate.push(jQuery(i).children()[0].value*4+1)
            selectedDate.push(jQuery(i).children()[0].value*4+2)
            selectedDate.push(jQuery(i).children()[0].value*4+3)
        }
    })

    tmp = KE.filter(ke => ke.numChecklists > numChecklists && ke.numSpecies > numSpecies);
    return tmp.filter(function (ke) {
        sum = ke.values_N.reduce( (acc, cur, idx) => selectedDate.indexOf(Math.floor(idx)) > -1 ? acc + cur : acc, 0);
        return sum > numChecklists
    })
}


/*
jQuery.getJSON('https://zoziologie.raphaelnussbaumer.com/assets/BirdingKenyaWitheBird/KE_enhanced.json', function (data) {
    KE = data;

    KE.forEach(function (ke, _idx, _array) {
        var pop = '<a href="https://ebird.org/hotspot/' + ke.locId + '" target="_blank"><h6>' + ke.locName + '</h6></a>';
        if (ke.top50.length > 0) {
            pop += '<b>top50:</b> #' + ke.top50 + '<br>';
        }
        pop += '<b>Number of checklists:</b> ' + ke.numChecklists;
        pop += '<br><b>Number of species:</b> ' + ke.numSpecies;
        var m = L.marker([ke.lat, ke.lng], {
            title: ke.locName,
            id: ke.locId,
            icon: L.icon({
                iconUrl: "https://zoziologie.raphaelnussbaumer.com/assets/Merge2Hotspot/images/hotspot-icon-hotspot_small.png",
                iconAnchor: [12, 30],
                popupAnchor: [0, -30],
            })
        }).bindPopup(pop).addTo(markers)


        if (_idx === _array.length - 1) {
            map.fitBounds(markers.getBounds());
            setTimeout(function () {
                jQuery('#mymodal').modal('hide');
            }, 1000);
        }
    })
})*/

jQuery.getJSON('https://zoziologie.raphaelnussbaumer.com/assets/BirdingKenyaWitheBird/KE_list.json', function (data) {
    let columns = '<thead><tr>';
    columns += '<th data-field="name">Hotspot</th>';
    data.forEach(function (sp, _idx, _array) {
        columns += '<th data-field="'+sp.speciesCode+'" data-visible="'+(sp.category=='species' ? true : false)+'">'+sp.displayName+'</th>';
        if (_idx === _array.length - 1) {
            columns += '</tr></thead>';
            jQuery('#table').append(columns)
            jQuery('#table').bootstrapTable()
        }
    })
})