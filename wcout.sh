#!/bin/sh

while [ 1 -lt 2 ]
do
    ps aux | grep node

    echo "twitter parsed"
    less tmp/parsed_twitter_files.txt | wc -l
    echo "technorati downloaded"
    less tmp/technorati_rank_downloaded.txt | wc -l

    echo "technorati extracted"
    less tmp/technorati_rank_extracted.txt | wc -l
    sleep 20
done
