#!/usr/bin/env python
import csv
import os
import requests
#import unidecode
#import time
import json
import numpy


# Define region
re = 'KE'
re = 'ES'

# download list of hotspot for region
response = requests.request("GET", "https://ebird.org/ws2.0/ref/hotspot/"+re, headers={'X-eBirdApiToken': 'vcs68p4j67pt'}, params={"fmt":"csv"})
file = open(re+"/hotspots.csv", "w")
file.write(response.text)
file.close()

####################################################
# PART 1: READ/GET DATA
# Dowanload Hotspot as Json
response = requests.request("GET", "https://ebird.org/ws2.0/ref/hotspot/"+re, headers={'X-eBirdApiToken': 'vcs68p4j67pt'}, params={"fmt":"json"})
hotspots  = json.loads(response.text)

# Download specie list
response = requests.request("GET", "https://ebird.org/barchartData?r="+re, params={"fmt":"json"})
tmp = json.loads(response.text)
species = [i['taxon'] for i in tmp['dataRows']]

# read KE of rht Book '50 Top Bird Sites in Kenya'
if re=="KE":
    with open('50TopBirdingSites.csv') as f:
        top50 = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

# Dowload Barchart KE for all hotspots
# Filter for hotspot having at leat 80 species recorded.
for hot in hotspots:
    if 'numSpeciesAllTime' in hot:
        if hot['numSpeciesAllTime']>80:
        	url = 'http://ebird.org/ebird/barchartData?r={code_loc}&bmo={bmonth}&emo={emonth}&byr={byear}&eyr={eyear}&fmt=json'.format(
        		code_loc=hot['locId'], byear=1900, eyear=2020, bmonth=1, emonth=12)
        	r = requests.get(url)
        	f = open(re+'/barchart/barchart_' + hot['locId']+'.json', 'wb')
        	f.write(r.content)
        	f.close()

####################################################
# PART 2: Build the structure
# hotspots -> species -> data

hotspots_enhanced = []

for bc in os.listdir(path=re+'/barchart/'):
    with open(re+'/barchart/'+bc) as json_file:
        BC = json.load(json_file)
        
        hot = [item for item in hotspots if item["locId"] == bc.replace('.json','').replace('barchart_','')][0]
        
        # hot.pop("countryCode", None)
        # hot.pop("subnational1Code", None)
        hot.pop("locID", None)
        
        if re=="KE":
            tmp = [item for item in top50 if item['code_loc'] == hot['locId']]
            if len(tmp)>0:
                hot['top50'] = tmp[0]['#']
            else:
                hot['top50'] = ''
        
        hot['numSpecies'] = BC['numSpecies'] 
        
        if len(BC['dataRows'])>0:
            hot['numChecklists'] = sum(BC['dataRows'][0]['values_N'])
            hot['values_N'] = [ sum(BC['dataRows'][0]['values_N'][i*4:(i*4+1*4)]) for i in range(0,12)] 
        else:
            hot['numChecklists'] = 0
            hot['values_N'] = []
        
        hot['values'] = {}
        
        for sp in BC['dataRows']:
            sp['values'] = numpy.multiply(sp['values'], BC['dataRows'][0]['values_N'])
            hot['values'].update({sp['speciesCode']: [ round(sum(sp['values'][i*4:(i*4+1*4)]),2) for i in range(0,12)] })
        
        hotspots_enhanced.append(hot)
        
    
            
    
# Filter minimum checklist
hotspots_enhanced = list(filter(lambda x: x['numChecklists'] > 4, hotspots_enhanced))

# Writing the file
tmp = json.dumps(hotspots_enhanced)
tmp = tmp.replace(', ',',').replace(',0.0,',',0,').replace('.0,',',').replace('.0]',']')

text_file = open(re+"/hotspots_enhanced.json", "w")
text_file.write(tmp)
text_file.close()

## Export as xls
ct = [8];
hotspots_table=hotspots_enhanced
for h in hotspots_table:
    h['values_N'] = sum([h['values_N'][i] for i in ct])
    for v in  h['values']:
        h[v] = sum([h['values'][v][i] for i in ct])
    h.pop("values", None)
    
keys = ['locId', 'locName', 'countryCode', 'subnational1Code', 'subnational2Code', 'lat', 'lng', 'latestObsDt', 'numSpeciesAllTime', 'numSpecies', 'numChecklists'];
keys.extend([sp['speciesCode'] for sp in species])

with open(re+'/hotspots_table.csv', 'w', newline='') as output_file:
    dict_writer = csv.DictWriter(output_file,keys,extrasaction='ignore')
    dict_writer.writeheader()
    dict_writer.writerows(hotspots_table)
    
    
####################################################
# PART 3: Export species list

# Keep only species
species = list(filter(lambda x: x['category'] in 'species', species))

# Remove unsued field
for sp in species:
    sp.pop('commonName', None)
    sp.pop('reportAsSpeciesCode', None)
    sp.pop('reportAsCategory', None)
    sp.pop('showSpeciesPageLink', None)
    sp.pop('category', None)
    

# Add Endemic or near-endemic species
EN = ["Jackson's Francolin","Williams's Lark","Taita Apalis","Tana River Cisticola","Aberdare Cisticola","Kikuyu White-eye","Taita White-eye","Hinde's Pied-Babbler","Taita Thrush","Clarke's Weaver","Sharpe's Longclaw"]
EN_ssp = ["White-headed Barbet","Heuglin's White-eye","Violet Woodhoopoe","Turner's Eremomela"]
NE = ["Friedmann's Lark","Golden-winged Sunbird","Donaldson-Smith's Sparrow-Weaver","Parrot-billed Sparrow","Fire-fronted Bishop","Parrot-billed Sparrow","Sokoke Pipit"]
INT = ["House Crow","House Sparrow","Yellow-collared Lovebird"]
END = ["Turner's Eremomela","Grey Crowned-Crane","Madagascar Pond Heron","Egyptian Vulture","White-headed Vulture","Lappet-faced Vulture","Hooded Vulture","White-backed Vulture","Rüppell's Griffon","Steppe Eagle","Sokoke Scops Owl","Saker Falcon","Turner's Eremomela","Taita Apalis","Basra Reed Warbler","Taita White-eye","Spotted Ground-Thrush","Taita Thrush","Amani Sunbird","Clarke's Weaver","Sokoke Pipit","Sharpe's Longclaw"]


for sp in species:
    for i in EN:
        if sp['displayName'] == i:
            sp['class'] = ['EN']
            print(sp)
    for i in EN_ssp:
        if sp['displayName'] == i:
            try:
                sp['class'].append('EN_ssp')
            except :
                sp['class'] = ['EN_ssp']
            print(sp)
    for i in NE:
        if sp['displayName'] == i:
            try:
                sp['class'].append('NE')
            except :
                sp['class'] = ['NE']
            print(sp)
    for i in INT:
        if sp['displayName'] == i:
            try:
                sp['class'].append('INT')
            except :
                sp['class'] = ['INT']
            print(sp)
    for i in END:
        if sp['displayName'] == i:
            try:
                sp['class'].append('END')
            except :
                sp['class'] = ['END']
            print(sp)
            
# Keep only field with specie in the data
tmp = []
for hot in hotspots_enhanced:
    tmp += list(hot['values'].keys())

myset = set(tmp)
species_export = list(filter(lambda x: x['speciesCode'] in myset, species))

# Export
with open(re+'/species.json', 'w') as f:
    json.dump(species_export, f)


with open(re+'/species_table.csv', 'w', newline='') as output_file:
    dict_writer = csv.DictWriter(output_file,[*species_export[0]],extrasaction='ignore')
    dict_writer.writeheader()
    dict_writer.writerows(species_export)
    
   










