echo "Initialize Git Submodule"
git submodule init
sleep 2

echo "Change to Submodule Directory"
cd developers.redhat.com
sleep 2

echo "Update Submodule"
git submodule update
sleep 2

echo "Install Submodule Dependencies"
cd _docker/drupal/drupal-filesystem/web/themes/custom/rhdp2/rhd-frontend/
sleep 2
npm install
sleep 2

echo "Return to HEAD"
cd ../../../../../../../../../
