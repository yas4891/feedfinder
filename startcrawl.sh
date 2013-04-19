#!/bin/sh
rm out/*
#mkdir out
#mkdir logs
node crawl.js xaa > logs/run.xaa.txt&
node crawl.js xab > logs/run.xab.txt&
node crawl.js xac > logs/run.xac.txt
node crawl.js xad > logs/run.xad.txt&
node crawl.js xae > logs/run.xae.txt&
node crawl.js xaf > logs/run.xaf.txt&
node crawl.js xag > logs/run.xag.txt
node crawl.js xah > logs/run.xah.txt&
node crawl.js xai > logs/run.xai.txt&
node crawl.js xaj > logs/run.xaj.txt
node crawl.js xak > logs/run.xak.txt
