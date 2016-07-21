#!/bin/bash
REPO="test-repo.git"
echo $REPO
mkdir $REPO
cd $REPO
git init --bare
cd ..
git clone -l $REPO test-repo-clone
cd test-repo-clone
git config --local user.email "you@example.com"
git config --local user.name "Your Name"

for i in {1..17}
  do
    FILE=$i-file
    touch $FILE
    git add $FILE

    git commit -m "$i commit"
  done

mv 1-file 1-fileRename
mv 2-file 2-fileRename
git add .

git commit -m "$2 files renamed"

rm -rf 1-fileRename
git add -A 1-fileRename

git commit -m "1 file removed"

chmod 744 2-fileRename
chmod 744 3-file
git add .

git commit -m "1 file modified"

# git symbolic-ref HEAD refs/heads/test-branch
# rm .git/index
# git clen -fdx

# for x in {1..15}
#   do
#     FILE=$x-file-$x
#     touch $FILE
#     git add $FILE

#     git commit -m "$x commit"
#   done