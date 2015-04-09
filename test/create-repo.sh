#!/bin/bash
REPO="test-repo.git"
echo $REPO
mkdir $REPO
cd $REPO
git init --bare
cd ..
if ! git config --get user.email
then
  git config --local user.email "you@example.com"
fi

if ! git config --get user.name
then
  git config --local user.name "Your Name"
fi
git clone -l $REPO test-repo-clone
cd test-repo-clone

for i in {1..20}
  do
    FILE=$i-file
    touch $FILE
    git add $FILE

    git commit -m "$i commit"
  done

git symbolic-ref HEAD refs/heads/test-branch
rm .git/index
git clen -fdx

for x in {1..15}
  do
    FILE=$x-file-$x
    touch $FILE
    git add $FILE

    git commit -m "$x commit"
  done
