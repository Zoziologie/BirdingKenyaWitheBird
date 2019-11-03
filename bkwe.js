//var KE = [];
//var SP = [];
var tag_list = [ ['EN','EN_ssp','NE','INT','END',], ['Endemic','Endemic subspecie','Near-endemic (including subspecie)','Introduced','Endangered']];
var selectedDate = [true, true, true, true, true, true, true, true, true, true, true, true];
var selectedRegion = ['KE-110'];
var mm = [];

$(document).ready(function () {
    jQuery('#mymodal').modal('show')
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
        selectedDate = [];
        jQuery('#select-Date > label').toArray().forEach(function(i){
            if (jQuery(i).hasClass('active')){
                selectedDate.push(jQuery(i).children()[0].value)
            }
        })
        hot.updateSettings({ data: buildData() });
        //jQuery('#nb-hotspot').html(checklistFilter().length+' Hotspots');
    })

    jQuery('#select-Region').multiselect();
    jQuery('#select-Region').on('change',function(){
        hot.updateSettings({ data: buildData() });
    })

    jQuery('#number-checklists').on('change',function(){
        hot.updateSettings({ data: buildData() });
    })

    jQuery('#NbProbSwitches').on('change',function(){
        hot.updateSettings({ data: buildData() });
    })
    
    jQuery(window).resize(function(){
        hot.updateSettings({
            height: window.innerHeight - $('.form-inline').outerHeight()-40
        });
    });

    jQuery('#select-Species').append('<option value="all" selected>All Species</option>');
    for (i = 0; i < tag_list[0].length; i++){
        jQuery('#select-Species').append('<option value="' + tag_list[0][i] +'" selected>' + tag_list[1][i] +'</option>');
    }
    jQuery('#select-Species').multiselect();
    jQuery('#select-Species').on('change',function(){
        var col = buildColumns();
        hot.updateSettings({ columns: col[0] , colHeaders: col[1]});
    })
    

});

function buildColumns(){
    var SP_d = []
    var colHeaders = [];
    SP.forEach( function(sp, idx){
        if (jQuery('#select-Species').val().indexOf('all') >-1) {
            SP_d.push({data: sp.speciesCode})
            colHeaders.push(sp.displayName+'|'+idx)
        } else if ( sp.class !== undefined) {
            if ( jQuery('#select-Species').val().some(r=> sp.class.indexOf(r) >= 0) ){
                SP_d.push({data: sp.speciesCode})
                colHeaders.push(sp.displayName+'|'+idx)
            }
        }
    });
    SP_d.unshift({data: 'numChecklists'});
    //SP_d.unshift({data: 'eBird', renderer: "html"});
    SP_d.unshift({data: 'locName', renderer: "html"});

    colHeaders.unshift("Number of Checklist")
    //colHeaders.unshift("eBird")
    colHeaders.unshift("Hotspot name")

    return [SP_d, colHeaders]
}

function buildData(){
    markers.clearLayers();
    var KE_d = []
    KE.forEach( function(ke,i_ke){
        ke_d = {};
        ke_d.locName = ke.locName + '<img src="https://zoziologie.raphaelnussbaumer.com/assets/Merge2Hotspot/images/hotspot-icon-hotspot_small.png" class="iconToClick" onclick="iconToClick('+i_ke+')">';
        ke_d.eBird = '<a href="https://ebird.org/hotspot/' + ke.locId + '" target="_blank">' + ke.locId + '</a>'
        
        ke_d.numChecklists = ke.values_N.reduce( function(acc,val,idx){
            if (selectedDate[idx]){
                return acc += val;
            } else {
                return acc
            }
        },0)

        Object.keys(ke.values).forEach( key=>{
            var tmp = ke.values[key].reduce( function(acc,val,idx){
                if (selectedDate[idx]){
                    return acc += val;
                } else {
                    return acc
                }
            },0)
            if (jQuery('#NbProbSwitches').is(":checked")){
                ke_d[key] = Math.round(tmp)
            } else {
                ke_d[key] = Math.round(tmp/ke_d.numChecklists*100)
            }
            
        });

        if (ke_d.numChecklists > jQuery('#number-checklists').val() && jQuery('#select-Region').val().indexOf(ke.subnational1Code) >-1){
            KE_d.push(ke_d)
            mm[i_ke].addTo(markers)
        }
        
    })
    return KE_d
}

jQuery.getJSON('https://zoziologie.raphaelnussbaumer.com/assets/BirdingKenyaWitheBird/KE_enhanced.json', function (data) {
KE = data;
jQuery.getJSON('https://zoziologie.raphaelnussbaumer.com/assets/BirdingKenyaWitheBird/KE_species.json', function (data) {
SP = data;

SP_tag = [[],[]];
SP.forEach( function(sp){
    if ('class' in sp){
        SP_tag[0].push(sp.displayName)
        SP_tag[1].push(sp.class)
    }
});


var col = buildColumns();

hot = new Handsontable(document.getElementById('table'), {
    data: buildData(),
    columns: col[0],
    //startCols: data.length,
    colHeaders: col[1],
    rowHeaders: false,//KE.map( ke => ke.locName),
    /*dropdownMenu: true,
    filters: true,
    contexMenu: true,*/
    columnSorting: {
        sortEmptyCells: true,
        initialConfig: {
            column: 0,
            sortOrder: 'asc'
        }
    },
    /*hiddenColumns:{
        columns: data.map((e,i) => e.category=='species' ? undefined : i).filter(x => x),
    },*/
    /*hiddenRows: {
        indicators: true,
        rows: [1,2]
    },*/
    width: '100%',
    height: '300px',
    colWidths: function(i) {
        if (i === 0) {
            return 170
        } else if (i === 1){
            return 60
        } else {
            return 40
        }
    },
    afterGetColHeader: function(i, TH) {
        if ( !TH.firstElementChild.classList.contains('head') ) {
            if (i > 1){
                var index = TH.textContent.split('|')[1];
                TH.firstElementChild.firstElementChild.innerHTML = TH.textContent.split('|')[0];
                TH.firstElementChild.innerHTML += '<a href="https://ebird.org/map/'+SP[index].speciesCode+'?bmo=1&emo=12&byr=1900&eyr=2019&env.minX=33.91&env.minY=-4.72&env.maxX=41.888&env.maxY=4.634&gp=true" class="linkMap" target="_blank"><i class="fas fa-map"></i></a>';

                if ( SP[index].class !== undefined ) {
                    SP[index].class.forEach( function(classtag){
                        var z = document.createElement('span');
                        z.classList.add("tag");
                        var it = tag_list[0].indexOf(classtag)
                        z.setAttribute("title", tag_list[1][it]);
                        z.setAttribute("data-toggle", "tooltip");
                        z.innerHTML = ' (' + classtag + ')';
                        TH.firstElementChild.append(z)
                    })
                }
            }
            TH.innerHTML = '<div class="head">' + TH.innerHTML + '</div>';
        }
    },
    licenseKey: 'non-commercial-and-evaluation',
    //fixedRowsTop: 2,
    fixedColumnsLeft: 1
});

})


KE.forEach(function (ke, _idx, _array) {
    var pop = '<h6>' + ke.locName + '</h6>';
    if (ke.top50.length > 0) {
        pop += '<b>top50:</b> #' + ke.top50 + '<br>';
    }
    pop += '<b>Number of checklists:</b> ' + ke.numChecklists;
    pop += '<br><b>Number of species:</b> ' + ke.numSpecies;
    pop += '<br><b>eBird:</b> <a href="https://ebird.org/hotspot/' + ke.locId + '" target="_blank">' + ke.locId + '</a>';
    var m = L.marker([ke.lat, ke.lng], {
        title: ke.locName,
        id: ke.locId,
        icon: L.icon({
            iconUrl: "https://zoziologie.raphaelnussbaumer.com/assets/Merge2Hotspot/images/hotspot-icon-hotspot_small.png",
            iconAnchor: [12, 30],
            popupAnchor: [0, -30],
        })
    }).bindPopup(pop).addTo(markers)

    mm.push(m);
    
    
    if (_idx === _array.length - 1) {
        map.fitBounds(markers.getBounds());
        setTimeout(function () {
            jQuery('#mymodal').modal('hide');
            
            hot.updateSettings({
                height: window.innerHeight - $('.form-inline').outerHeight()-40
            });
            
            jQuery('[data-toggle="tooltip"]').tooltip();
        }, 1000);
    }
})
})

let iconToClick = function(i_ke){
    
    map.setView(mm[i_ke].getLatLng(), 13);
    mm[i_ke].openPopup()
}
