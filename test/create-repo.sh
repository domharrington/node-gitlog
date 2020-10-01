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

# Add
for i in {1..16}
  do
    FILE=$i-file
    printf "$i" > $FILE
    git add $FILE

    git commit -m "$i commit"
  done

# Rename
mv 1-file 1-fileRename
mv 2-file 2-fileRename
git add .
git commit -m "$2 files renamed"

# Remove
rm -rf 1-fileRename
git add -A 1-fileRename
git commit -m "1 file removed"

# Modify
chmod 744 2-fileRename
chmod 744 3-file
git add .
git commit -m "1 file modified"

# Copy
cp 3-file copy-file
git add copy-file
git commit -m "1 file copied"

# New branch
git checkout -b new-branch
touch new-file
git add new-file
git commit -m "Added new file on new branch"
git checkout master

# Merge commit
git checkout -b new-merge-branch
touch foo
git add foo
git commit -m "Commit to be merged"
git checkout master
git merge --no-edit --no-ff new-merge-branch
git branch -d new-merge-branch

# Modify specific lines
touch fileToModify
# Add contents large enough to break up diffs
for i in {1..20}
  do
    printf "$i\n" >> fileToModify

  done
git add fileToModify
git commit -m "added long content file"
sed -i '' -e 's/2/4/g' ./fileToModify
git add fileToModify
git commit -m "Modify multiple parts of the file and come close to, but not the first line"
sed -i '' -e 's/40/44/' ./fileToModify
git add fileToModify
git commit -m "Modify end of the file"

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
