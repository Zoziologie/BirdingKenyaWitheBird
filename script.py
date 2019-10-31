#!/usr/bin/env python
import csv
import os
import requests
import unidecode
import time
import json


# download list of hotspot for region
#response = requests.request("GET", "https://ebird.org/ws2.0/ref/hotspot/KE", headers={'X-eBirdApiToken': 'vcs68p4j67pt'}, params={"fmt":"csv"})
#file = open("KE/KE.csv", "w")
#file.write(response.text)
#file.close()

####################################################
# PART 1: READ/GET DATA
# Dowanload Hotspot as Json
response = requests.request("GET", "https://ebird.org/ws2.0/ref/hotspot/KE", headers={'X-eBirdApiToken': 'vcs68p4j67pt'}, params={"fmt":"json"})
hotspots  = json.loads(response.text)

# Download specie list
response = requests.request("GET", "https://ebird.org/barchartData?r=KE", params={"fmt":"json"})
tmp = json.loads(response.text)
species = [i['taxon'] for i in tmp['dataRows']]

# read KE of rht Book '50 Top Bird Sites in Kenya'
with open('50TopBirdingSites.csv') as f:
    top50 = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

# Dowload Barchart KE for all hotspots
for hot in hotspots:
	url = 'http://ebird.org/ebird/barchartData?r={code_loc}&bmo={bmonth}&emo={emonth}&byr={byear}&eyr={eyear}&fmt=json'.format(
		code_loc=hot['locId'], byear=1900, eyear=2020, bmonth=1, emonth=12)
	r = requests.get(url)
	f = open('barchart/barchart_' + hot['locId']+'.json', 'wb')
	f.write(r.content)
	f.close()

####################################################
# PART 2: Build the structure
# hotspots -> species -> data

for hot in hotspots:
    hot.pop("countryCode", None)
    hot.pop("subnational1Code", None)
    hot.pop("locID", None)
    tmp = [item for item in top50 if item['code_loc'] == hot['locId']]
    if len(tmp)>0:
        hot['top50'] = tmp[0]['#']
    else:
        hot['top50'] = ''
    with open('barchart/barchart_'+hot['locId']+'.json') as json_file:
        BC = json.load(json_file)
        hot['numSpecies'] = BC['numSpecies'] 
        if len(BC['dataRows'])>0:
            hot['numChecklists'] = sum(BC['dataRows'][0]['values_N'])
            hot['values_N'] = [ sum(BC['dataRows'][0]['values_N'][i*4:(i*4+1*4)]) for i in range(0,12)] 
        else:
            hot['numChecklists'] = 0
            hot['values_N'] = []
        hot['values'] = {}
        for sp in BC['dataRows']:
            hot['values'].update({sp['speciesCode']: [ round(sum(sp['values'][i*4:(i*4+1*4)]),2) for i in range(0,12)] })
        
# Filter minimum checklist
hotspots_export = list(filter(lambda x: x['numChecklists'] > 4, hotspots))


# Writing the file
tmp = json.dumps(hotspots_export)
tmp = tmp.replace(' ','').replace('0.0','0')

text_file = open("KE_enhanced.json", "w")
text_file.write(tmp)
text_file.close()

####################################################
# PART 3: Export species list

# Remove unsued field
for sp in species:
    sp.pop('commonName', None)
    sp.pop('reportAsSpeciesCode', None)
    sp.pop('reportAsCategory', None)
    sp.pop('showSpeciesPageLink', None)

# Keep only field with specie in the data
for hot in hotspots_export:
    tmp += list(hot['values'].keys())

myset = set(tmp)

species_export = list(filter(lambda x: x['speciesCode'] in myset, species))

# Export
with open('KE_species.json', 'w') as f:
    json.dump(species_export, f)













