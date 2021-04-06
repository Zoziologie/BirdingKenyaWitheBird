var C = [];
var SP = [];
var c = ""
var hot
var tag_list = [ ['EN','EN_ssp','NE','INT','END',], ['Endemic','Endemic subspecie','Near-endemic (including subspecie)','Introduced','Endangered']];
var selectedDate = [true, true, true, true, true, true, true, true, true, true, true, true];
var selectedRegion = ['KE-110'];
var mm = [];
var markers, speciesLayer;

$(document).ready(function () {
    
    jQuery('#mymodal').modal('show')
    
    map = new L.Map('map',{maxZoom: 20});
    map.fitWorld().zoomIn();
    
    L.MakiMarkers.accessToken = token.mapbox;
    markers = L.markerClusterGroup({
        showCoverageOnHover: 1,
        maxClusterRadius: 50,
        iconCreateFunction: function (cluster) {
            return L.icon({
                iconUrl: "/assets/hotspot-icon-hotspot-plus_small.png",
                iconAnchor: [12, 30],
                popupAnchor: [0, -12],
            })
        }
    }).addTo(map);
    
    speciesLayer = L.featureGroup().addTo(map);
    
    control = L.control.layers({
        'MapBox': L.tileLayer.provider('MapBox', { id: 'mapbox/streets-v11', accessToken: token.mapbox }).addTo(map),
        'OpenStreetMap': L.tileLayer.provider('OpenStreetMap.Mapnik'),
        'Satellite': L.tileLayer.provider('Esri.WorldImagery')
    },  {
        "Hotspot <img src='/assets/hotspot-icon-hotspot_small.png' style='height: 1.5rem;'></img>": markers,
        'Species <i class="fas fa-map"></i><br><canvas id="canvas_viridis" width="100" height="10"></canvas><p id="canvas-range"><span id="canvas-min">0</span><span id="canvas-max">100</span></p>': speciesLayer
    }, { collapsed: false }).addTo(map);
    
    
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
    
    /*jQuery('#select-Region').multiselect({
        includeSelectAllOption: true
    });*/
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
    /*jQuery('#select-Species').multiselect();*/
    jQuery('#select-Species').on('change',function(){
        var col = buildColumns();
        hot.updateSettings({ columns: col[0] , colHeaders: col[1]});
    })
    
    var canvas = document.getElementById('canvas_viridis');
    var ctx = canvas.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 100, 0);
    viridis=[[0.2670, 0.0049, 0.3294], [0.2685, 0.0096, 0.3354], [0.2700, 0.0147, 0.3414], [0.2713, 0.0200, 0.3473], [0.2726, 0.0257, 0.3532], [0.2738, 0.0316, 0.3590], [0.2750, 0.0379, 0.3647], [0.2760, 0.0443, 0.3703], [0.2770, 0.0505, 0.3759], [0.2780, 0.0565, 0.3814], [0.2788, 0.0624, 0.3868], [0.2796, 0.0681, 0.3921], [0.2803, 0.0737, 0.3974], [0.2809, 0.0792, 0.4026], [0.2815, 0.0846, 0.4077], [0.2819, 0.0900, 0.4127], [0.2823, 0.0953, 0.4176], [0.2827, 0.1005, 0.4225], [0.2829, 0.1058, 0.4272], [0.2831, 0.1109, 0.4319], [0.2832, 0.1161, 0.4365], [0.2832, 0.1212, 0.4409], [0.2832, 0.1263, 0.4453], [0.2831, 0.1313, 0.4496], [0.2829, 0.1364, 0.4538], [0.2826, 0.1414, 0.4579], [0.2822, 0.1464, 0.4619], [0.2818, 0.1514, 0.4658], [0.2813, 0.1564, 0.4696], [0.2808, 0.1613, 0.4733], [0.2802, 0.1663, 0.4769], [0.2795, 0.1712, 0.4804], [0.2787, 0.1761, 0.4838], [0.2779, 0.1810, 0.4871], [0.2770, 0.1859, 0.4903], [0.2760, 0.1907, 0.4934], [0.2750, 0.1956, 0.4964], [0.2740, 0.2004, 0.4993], [0.2728, 0.2052, 0.5021], [0.2716, 0.2100, 0.5048], [0.2704, 0.2148, 0.5074], [0.2691, 0.2196, 0.5100], [0.2677, 0.2243, 0.5124], [0.2663, 0.2291, 0.5147], [0.2649, 0.2338, 0.5170], [0.2634, 0.2385, 0.5191], [0.2618, 0.2431, 0.5212], [0.2603, 0.2478, 0.5232], [0.2586, 0.2524, 0.5251], [0.2560, 0.2560, 0.5269], [0.2553, 0.2616, 0.5286], [0.2536, 0.2662, 0.5303], [0.2518, 0.2707, 0.5319], [0.2501, 0.2752, 0.5334], [0.2482, 0.2797, 0.5349], [0.2464, 0.2842, 0.5362], [0.2446, 0.2886, 0.5375], [0.2427, 0.2931, 0.5388], [0.2408, 0.2975, 0.5400], [0.2389, 0.3019, 0.5411], [0.2370, 0.3062, 0.5422], [0.2351, 0.3106, 0.5432], [0.2331, 0.3149, 0.5441], [0.2312, 0.3192, 0.5451], [0.2293, 0.3234, 0.5459], [0.2273, 0.3277, 0.5467], [0.2254, 0.3319, 0.5475], [0.2234, 0.3361, 0.5482], [0.2215, 0.3403, 0.5489], [0.2195, 0.3444, 0.5496], [0.2176, 0.3486, 0.5502], [0.2157, 0.3527, 0.5508], [0.2138, 0.3568, 0.5513], [0.2119, 0.3608, 0.5519], [0.2100, 0.3649, 0.5523], [0.2081, 0.3689, 0.5528], [0.2062, 0.3729, 0.5532], [0.2043, 0.3769, 0.5537], [0.2025, 0.3809, 0.5540], [0.2007, 0.3849, 0.5544], [0.1989, 0.3888, 0.5547], [0.1971, 0.3928, 0.5551], [0.1953, 0.3967, 0.5554], [0.1935, 0.4006, 0.5557], [0.1918, 0.4045, 0.5559], [0.1901, 0.4083, 0.5562], [0.1883, 0.4122, 0.5564], [0.1867, 0.4161, 0.5566], [0.1850, 0.4199, 0.5568], [0.1833, 0.4237, 0.5570], [0.1817, 0.4275, 0.5572], [0.1801, 0.4313, 0.5573], [0.1784, 0.4351, 0.5575], [0.1768, 0.4389, 0.5576], [0.1753, 0.4427, 0.5577], [0.1737, 0.4464, 0.5578], [0.1721, 0.4502, 0.5579], [0.1706, 0.4540, 0.5580], [0.1691, 0.4577, 0.5581], [0.1675, 0.4614, 0.5581], [0.1660, 0.4652, 0.5581], [0.1645, 0.4689, 0.5581], [0.1630, 0.4726, 0.5581], [0.1615, 0.4763, 0.5581], [0.1601, 0.4801, 0.5581], [0.1586, 0.4838, 0.5580], [0.1571, 0.4875, 0.5580], [0.1557, 0.4912, 0.5579], [0.1542, 0.4949, 0.5578], [0.1527, 0.4986, 0.5577], [0.1513, 0.5023, 0.5575], [0.1498, 0.5060, 0.5574], [0.1484, 0.5097, 0.5572], [0.1470, 0.5134, 0.5569], [0.1455, 0.5171, 0.5567], [0.1441, 0.5208, 0.5564], [0.1427, 0.5245, 0.5562], [0.1413, 0.5281, 0.5558], [0.1399, 0.5318, 0.5555], [0.1385, 0.5355, 0.5551], [0.1371, 0.5392, 0.5547], [0.1358, 0.5429, 0.5543], [0.1344, 0.5466, 0.5538], [0.1331, 0.5503, 0.5533], [0.1318, 0.5544, 0.5532], [0.1306, 0.5577, 0.5522], [0.1293, 0.5614, 0.5516], [0.1282, 0.5651, 0.5509], [0.1270, 0.5688, 0.5502], [0.1259, 0.5725, 0.5495], [0.1249, 0.5762, 0.5487], [0.1239, 0.5799, 0.5479], [0.1230, 0.5836, 0.5470], [0.1222, 0.5873, 0.5461], [0.1215, 0.5910, 0.5451], [0.1208, 0.5947, 0.5441], [0.1203, 0.5984, 0.5430], [0.1199, 0.6021, 0.5419], [0.1196, 0.6058, 0.5408], [0.1195, 0.6095, 0.5395], [0.1195, 0.6132, 0.5383], [0.1196, 0.6169, 0.5370], [0.1199, 0.6205, 0.5356], [0.1204, 0.6242, 0.5341], [0.1211, 0.6279, 0.5326], [0.1219, 0.6316, 0.5311], [0.1230, 0.6353, 0.5295], [0.1242, 0.6389, 0.5278], [0.1257, 0.6426, 0.5260], [0.1274, 0.6462, 0.5242], [0.1293, 0.6499, 0.5224], [0.1314, 0.6535, 0.5205], [0.1337, 0.6572, 0.5185], [0.1363, 0.6608, 0.5164], [0.1391, 0.6644, 0.5143], [0.1421, 0.6681, 0.5121], [0.1453, 0.6717, 0.5098], [0.1488, 0.6753, 0.5075], [0.1525, 0.6789, 0.5051], [0.1564, 0.6824, 0.5026], [0.1605, 0.6860, 0.5001], [0.1648, 0.6896, 0.4975], [0.1693, 0.6931, 0.4948], [0.1740, 0.6966, 0.4920], [0.1789, 0.7002, 0.4892], [0.1840, 0.7037, 0.4863], [0.1892, 0.7072, 0.4833], [0.1947, 0.7106, 0.4803], [0.2003, 0.7141, 0.4771], [0.2061, 0.7176, 0.4739], [0.2120, 0.7210, 0.4707], [0.2181, 0.7244, 0.4673], [0.2244, 0.7278, 0.4639], [0.2308, 0.7312, 0.4604], [0.2373, 0.7345, 0.4568], [0.2440, 0.7379, 0.4531], [0.2508, 0.7412, 0.4494], [0.2577, 0.7445, 0.4456], [0.2648, 0.7478, 0.4417], [0.2720, 0.7510, 0.4378], [0.2793, 0.7543, 0.4337], [0.2868, 0.7575, 0.4296], [0.2943, 0.7607, 0.4254], [0.3020, 0.7638, 0.4211], [0.3098, 0.7670, 0.4168], [0.3177, 0.7701, 0.4123], [0.3257, 0.7732, 0.4078], [0.3337, 0.7762, 0.4032], [0.3419, 0.7792, 0.3986], [0.3502, 0.7822, 0.3938], [0.3586, 0.7852, 0.3890], [0.3671, 0.7882, 0.3841], [0.3757, 0.7911, 0.3791], [0.3843, 0.7940, 0.3741], [0.3931, 0.7968, 0.3690], [0.4019, 0.7996, 0.3638], [0.4108, 0.8024, 0.3585], [0.4199, 0.8052, 0.3531], [0.4289, 0.8079, 0.3477], [0.4381, 0.8106, 0.3422], [0.4474, 0.8132, 0.3366], [0.4567, 0.8158, 0.3309], [0.4661, 0.8184, 0.3252], [0.4756, 0.8209, 0.3194], [0.4851, 0.8234, 0.3135], [0.4947, 0.8259, 0.3075], [0.5044, 0.8283, 0.3015], [0.5142, 0.8307, 0.2954], [0.5240, 0.8331, 0.2892], [0.5339, 0.8354, 0.2830], [0.5438, 0.8376, 0.2767], [0.5538, 0.8399, 0.2704], [0.5638, 0.8421, 0.2639], [0.5739, 0.8442, 0.2575], [0.5841, 0.8463, 0.2509], [0.5943, 0.8484, 0.2443], [0.6045, 0.8504, 0.2377], [0.6148, 0.8524, 0.2310], [0.6251, 0.8544, 0.2243], [0.6355, 0.8563, 0.2175], [0.6459, 0.8582, 0.2108], [0.6563, 0.8600, 0.2040], [0.6667, 0.8618, 0.1972], [0.6772, 0.8635, 0.1903], [0.6877, 0.8652, 0.1835], [0.6982, 0.8669, 0.1767], [0.7087, 0.8686, 0.1700], [0.7193, 0.8702, 0.1633], [0.7298, 0.8718, 0.1567], [0.7403, 0.8733, 0.1502], [0.7509, 0.8748, 0.1438], [0.7614, 0.8763, 0.1376], [0.7719, 0.8777, 0.1316], [0.7824, 0.8792, 0.1259], [0.7929, 0.8806, 0.1204], [0.8034, 0.8819, 0.1153], [0.8138, 0.8833, 0.1107], [0.8242, 0.8846, 0.1065], [0.8346, 0.8859, 0.1029], [0.8450, 0.8872, 0.0999], [0.8552, 0.8885, 0.0976], [0.8655, 0.8898, 0.0960], [0.8757, 0.8911, 0.0953], [0.8858, 0.8923, 0.0954], [0.8962, 0.8938, 0.0963], [0.9060, 0.8948, 0.0981], [0.9159, 0.8961, 0.1006], [0.9258, 0.8973, 0.1040], [0.9357, 0.8985, 0.1080], [0.9454, 0.8998, 0.1127], [0.9551, 0.9010, 0.1180], [0.9648, 0.9023, 0.1239], [0.9743, 0.9036, 0.1302], [0.9838, 0.9049, 0.1369], [0.9932, 0.9062, 0.1439]];
    viridis.forEach(function(elmt,i){
        gradient.addColorStop( parseFloat(i/viridis.length), "rgb("+parseFloat(elmt[0]*255)+","+parseFloat(elmt[1]*255)+","+parseFloat(elmt[2]*255)+")");
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 10);
    
    
    
    
    
    $('#selectCountry a').click(function () {
        
        jQuery('#loading').show()
        jQuery('#selectCountry').hide()
        
        if ( $(this).attr('value') == "ES"){
            c = "ES"
            options = [
                {value:"KE-200", txt:"Central"},
                {value:"KE-300", txt:"Coast"},
                {value:"KE-400", txt:"Eastern"},
                {value:"KE-500", txt:"North-Eastern"},
                {value:"KE-600", txt:"Nyanza"},
                {value:"KE-700", txt:"Rift Valley"},
                {value:"KE-800", txt:"Western"},
            ]
        } else if ( $(this).attr('value') == "KE"){
            c = "KE"
            options = [
                {value:"KE-200", txt:"Central"},
                {value:"KE-300", txt:"Coast"},
                {value:"KE-400", txt:"Eastern"},
                {value:"KE-500", txt:"North-Eastern"},
                {value:"KE-600", txt:"Nyanza"},
                {value:"KE-700", txt:"Rift Valley"},
                {value:"KE-800", txt:"Western"},
            ]
        }

        // Add option to sub-region selection
        jQuery.getJSON('https://api.ebird.org/v2/ref/region/list/subnational1/'+c+'.json?key=vcs68p4j67pt', function (data) {
            console.log(data)
            options=[]
            data.forEach(function (item) {
                var option = "<option value='"+item.code+"' selected>" + item.name + "</option>"
                options.push(option);
            });
            $('#select-Region').html(options);
            $('#select-Region').selectpicker('refresh');
        })
        
        
        
        
        //var l = 'assets/BirdingWitheBird/'+c;
        
        jQuery.getJSON(c+'/hotspots_enhanced.json', function (data) {
            C = data;
            C.forEach(c => {
                //c.sel = false
                var numChecklists = c.values_N.reduce( (acc,val) => acc += val, 0);
                
                var prob=[]
                Object.keys(c.values).forEach( key=>{
                    prob.push(c.values[key].reduce( (acc,val) => acc += val ,0)/numChecklists);
                });
                
                c.R = Math.round(prob.reduce( (acc,val) => acc += val ,0));
            });
            
            
            C.forEach(function (c2, _idx, _array) {
                var pop = '<h6>' + c2.locName + '</h6>';
                if ('top50' in c2 && c2.top50.length > 0) {
                    pop += '<b>top50:</b> #' + c.top50 + '<br>';
                }
                pop += '<b>Number of checklists:</b> ' + c2.numChecklists;
                pop += '<br><b>Number of species:</b> ' + c2.numSpecies;
                pop += '<br><b>eBird:</b> <a href="https://ebird.org/hotspot/' + c2.locId + '" target="_blank">' + c2.locId + '</a>';
                var m = L.marker([c2.lat, c2.lng], {
                    title: c2.locName,
                    id: c2.locId,
                    icon: L.icon({
                        iconUrl: "/assets/hotspot-icon-hotspot_small.png",
                        iconAnchor: [12, 30],
                        popupAnchor: [0, -30],
                    })
                }).bindPopup(pop).addTo(markers)
                
                mm.push(m);
                
                
                if (_idx === _array.length - 1) {
                    map.fitBounds(markers.getBounds());
                    jQuery.getJSON(c+'/species.json', function (data) {
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
                            rowHeaders: false,//C.map( c => c.locName),
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
                                } else {
                                    return 30
                                }
                            },
                            afterGetColHeader: function(i, TH) {
                                if ( !TH.firstElementChild.classList.contains('head') ) {
                                    if (i > 5){
                                        var index = TH.textContent.split('|')[1];
                                        TH.firstElementChild.firstElementChild.innerHTML = TH.textContent.split('|')[0];
                                        TH.firstElementChild.innerHTML += '<a href="https://ebird.org/map/'+SP[index].speciesCode+'?env.minX=33.91&env.minY=-4.72&env.maxX=41.888&env.maxY=4.634&zh=true&gp=true" class="linkMap" target="_blank"><img src="/assets/faviconeBird16.png"></i></a>';
                                        TH.firstElementChild.innerHTML +=  '<span class="iconToClick" onclick="DisplayMap(\'+SP[index].speciesCode+\',\''+SP[index].displayName+'\')"><i class="fas fa-map"></i></span>'
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
                            fixedColumnsLeft: 3
                        });
                        
                        jQuery('#mymodal').modal('hide');
                                
                        hot.updateSettings({
                            height: window.innerHeight - $('.form-inline').outerHeight()-40
                        });
                        
                        jQuery('[data-toggle="tooltip"]').tooltip();
                        
                    }) 
                }
            })

             
        })       
        
         
    });
    
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
    //SP_d.unshift({data: 'sel',  renderer: "html"});
    SP_d.unshift({data: 'R'});
    SP_d.unshift({data: 'numChecklists'});
    SP_d.unshift({data: 'eBird', renderer: "html"});
    SP_d.unshift({data: 'iconToClick', renderer: "html"});
    SP_d.unshift({data: 'locName', renderer: "html"});
    
    //colHeaders.unshift("Selected")
    colHeaders.unshift('Expected Number of Sp.<span class="iconToClick" onclick="DisplayMap(\'R\',\'\')"><i class="fas fa-map"></i></span>')
    colHeaders.unshift('Number of Checklist <span class="iconToClick" onclick="DisplayMap(\'numChecklists\',\'\')"><i class="fas fa-map"></i></span>')
    colHeaders.unshift("eBird")
    colHeaders.unshift("View on Map")
    colHeaders.unshift("Hotspot Name")
    
    return [SP_d, colHeaders]
}

function buildData(){
    markers.clearLayers();
    var C_d = []
    C.forEach( function(c,i_c){
        c_d = {};
        c_d.R = c.R;
        c_d.locName = '<div class="long-text">'+c.locName+'</div>';
        c_d.iconToClick = '<span class="iconToClick" onclick="iconToClick('+i_c+')" ><i class="fas fa-map-marker-alt"></i></span>';
        c_d.eBird = '<a href="https://ebird.org/hotspot/' + c.locId + '" target="_blank"><img src="/assets/faviconeBird16.png"></a>';
        c_d.lat  = c.lat;
        c_d.lng  = c.lng;
        //c_d.sel = "<input type='checkbox' class='selectorLocId' value='" + c.locId + "'" + (c.sel ? ' checked="checked" ' : '') + ">";
        c_d.numChecklists = c.values_N.reduce( function(acc,val,idx){
            if (selectedDate[idx]){
                return acc += val;
            } else {
                return acc
            }
        },0)
        
        Object.keys(c.values).forEach( key=>{
            var tmp = c.values[key].reduce( function(acc,val,idx){
                if (selectedDate[idx]){
                    return acc += val;
                } else {
                    return acc
                }
            },0)
            if (jQuery('#NbProbSwitches').is(":checked")){
                c_d[key] = Math.round(tmp)
            } else {
                c_d[key] = Math.round(tmp/c_d.numChecklists*100)
            }
            
        });
        
        if (c_d.numChecklists > jQuery('#number-checklists').val() && jQuery('#select-Region').val().indexOf(c.subnational1Code) >-1){
            C_d.push(c_d)
            mm[i_c].addTo(markers)
        }
        
    })
    return C_d
}

function DisplayMap(speciesCode,spDisplayName) {
    var C_d = buildData()
    speciesLayer.clearLayers();
    var C_dd = C_d.filter( c => c[speciesCode] !== undefined);
    var max_d = C_dd.reduce( (acc,c) => c[speciesCode]>acc ? c[speciesCode] : acc,0);
    jQuery('#canvas-max').html(max_d)
    
    C_d.forEach( function(c){
        if (c[speciesCode] !== undefined){
            L.circleMarker([c.lat, c.lng], {
                radius: 8,
                color: color(c[speciesCode],max_d),
            }).bindPopup(c.locName_0 +'--'+ spDisplayName + '<br>Probability (%) / Number: '+c[speciesCode]).addTo(speciesLayer)
        }
    })
}

function color(val,max_d){
    color_gradient = ['#fff','#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];
    var r = Math.round(  (val - 0 )/max_d * (color_gradient.length-1) )+1;
    r = (r>=color_gradient.length) ? color_gradient.length-1 : r;
    return color_gradient[r]
}



let iconToClick = function(i_c){
    map.setView(mm[i_c].getLatLng(), 13);
    mm[i_c].openPopup()
}
