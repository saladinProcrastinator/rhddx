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

echo "Update Changelog"
gren release -P --override && gren changelog --override
