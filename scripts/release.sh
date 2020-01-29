if [ "`git status -s`" ]
then
  echo "You have unstaged commits. Please commit any pending changes."
  exit 1;
fi

echo "Checkout Master branch"
git checkout master

echo "Pull latest from master"
git pull --rebase origin master

echo "Update NPM Version"
VERSION=${1?Error: deliniate major, minor, path or prerelease}
npm version "$VERSION"

echo "Bump Tag Number"
NAME=${1?Error: no tag given}
git tag -a $NAME -m "$NAME"

echo "Update Tags/Releases"
git push origin master --follow-tags

echo "Update Changelog"
gren release -P --override && gren changelog --override
