# set nodejs version

nvm install 20.12.2
nvm use 20.12.2

# install node modules

npm install

# run the app locally

npm start

# to test CI locally, run this

npm ci
npm run test -- --watch=false --browsers=ChromeHeadless
npm run build -- --configuration production
