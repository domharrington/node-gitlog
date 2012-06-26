#!/bin/bash
REPO="test-repo.git"
echo $REPO
mkdir $REPO
cd $REPO
git init --bare
cd ..
git clone -l $REPO test-repo-clone
cd test-repo-clone

for i in {1..20}
  do
    FILE=$i-file
    touch $FILE
    git add $FILE

    git commit -m "$i commit"
  done