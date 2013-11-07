# Upgrading

## From 2.2.0
You'll probably want to start off with a clean checkout of your project, before running 'npm install'. Once you've run 'npm install' with the lavaca 2.2 setup, you'll end up with a bunch of things that are no longer necessary.

1. Checkout lavaca-starter somewhere so that you can copy over some files.
2. Copy bower.json and the hidden .bowerrc file from the root of lavaca-starter into the root of your project
3. Add `/src/www/components` to your .gitignore file
4. Remove this part from your package.json
```
"scripts": {
  "postinstall": "node ./postinstall.js"
},
"dependencies": {
  "lavaca": "2.2"
}
```
5. In your index.html file, change the path for the require `<script>` tag from "js/libs/require.js" to "components/requirejs/require.js"
6. In your boot.js file, update the paths for everything that used to be in `libs` or `extlibs`. You can also remove the entries for `cordova` and `docCookies`. You may just have to diff your file with the one in lavaca-starter.
7. Delete the src/www/js/extlibs folder if it exists

You can now run `npm install` and `bower install` and you should be good to go.
## From >= 2.0.0
Warning: The cordova build process has changed, so if you app is currently a hybrid app the ios and android projects will have to be recreated.

1. Checkout lavaca-starter somewhere so that you can copy over some files.
2. Copy bower.json and the hidden .bowerrc file from the root of lavaca-starter into the root of your project
3. Add `/src/www/components` to your .gitignore file
4. In your index.html file, change the path for the require `<script>` tag from "js/libs/require.js" to "components/requirejs/require.js"
5. In your index.html file, change the path for the require `<script>` tag from "js/libs/less-1.3.3.min.js" to "components/less.js/dist/less-1.3.3.min"
6. In your boot.js file, update the paths for everything that used to be in `libs` or `extlibs`. You can also remove the entries for `cordova` and `docCookies`. You may just have to diff your file with the one in lavaca-starter.
7. In your app.js file you should remove the require statements for jquery mobile touch and jquery mobile orientation if they exist and replace them with `require('hammer');`.
8. Delete all duplicated dependecies from libs or better yet move the remaining dependencies to bower.json 

You can now run `npm install` and `bower install` and you should be good to go.


