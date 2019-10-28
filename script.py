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

# Dowanload Hotspot as Json
response = requests.request("GET", "https://ebird.org/ws2.0/ref/hotspot/KE", headers={'X-eBirdApiToken': 'vcs68p4j67pt'}, params={"fmt":"json"})
KE  = json.loads(response.text)

# Download specie list
response = requests.request("GET", "https://ebird.org/barchartData?r=KE", params={"fmt":"json"})
tmp = json.loads(response.text)
KE_list = [i['taxon'] for i in tmp['dataRows']]
# Writing 
keys = KE_list[0].keys()
with open('KE_list.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(KE_list)


# Dowload Barchart KE for all hotspots
for ke in KE:
	url = 'http://ebird.org/ebird/barchartData?r={code_loc}&bmo={bmonth}&emo={emonth}&byr={byear}&eyr={eyear}&fmt=json'.format(
		code_loc=ke['locId'], byear=1900, eyear=2020, bmonth=1, emonth=12)
	r = requests.get(url)
	f = open('barchart/barchart_'+ke['locId']+'.json', 'wb')
	f.write(r.content)
	f.close()

# read KE of rht Book '50 Top Bird Sites in Kenya'
with open('50TopBirdingSites.csv') as f:
    top50 = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

# Add checklist Add KE to list

for ke in KE:
    tmp = [item for item in top50 if item['code_loc'] == ke['locId']]
    if len(tmp)>0:
        ke['top50'] = tmp[0]['#']
    else:
        ke['top50'] = ''
    with open('barchart/barchart_'+ke['locId']+'.json') as json_file:
        BA = json.load(json_file)
        ke['numSpecies'] = BA['numSpecies'] 
        if len(BA['dataRows'])>0:
            ke['numChecklists'] = sum(BA['dataRows'][0]['values_N'])
        else:
            ke['numChecklists'] = 0
        ke['data']=[ [sp['speciesCode'], sp['values']] for sp in BA['dataRows'] ]

# Writing the file
with open('KE_enhanced.json', 'w') as f:
    json.dump(KE, f)

# filter














