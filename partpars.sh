#!/bin/sh


for i in a b c d e f g h i j k l m n o p q r s t u v w x y z
 do
    echo "$i"

    mv out/* content/
    mv content/$i* out/
    node parse.js
done
