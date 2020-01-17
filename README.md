[![Netlify Status](https://api.netlify.com/api/v1/badges/eadda60c-6780-4720-869d-ea925937a7e2/deploy-status)](https://app.netlify.com/sites/rhddx/deploys)

[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github.com/mindreeper2420/rhddx/blob/master/CHANGELOG.md)
[![GitHub release](https://img.shields.io/github/release/Naereen/StrapDown.js.svg)](https://github.com/mindreeper2420/rhddx/releases)

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/mindreeper2420/rhddx/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/mindreeper2420/rhddx/compare)

# RHDDX Frontend Documentation Site
This repository contains examples of components and assemblies used on the [developers.redhat.com](https://developers.redhat.com) site.

This site is built using JAMstack (JavaScript, APIs, and Markup) technologies ([What is JAMstack?](https://jamstack.org/)) Specifically, we use the technologies recommended by [Netlify CMS - Jekyll](https://www.netlifycms.org/docs/jekyll/).

## Bugs, Features, etc.

This is an ongoing project and I welcome contributions. Feel free to [file an issue](https://github.com/mindreeper2420/rhddx/issues/new) or submit a PR against an existing issue.

If you wish to contribute to this project, you should fork the project under your own account, and then raise any changes via pull requests.

Any and all changes must be approved by a member of the developers.redhat.com team.

## Local Development

Requirements:
 - Node (10+)
 - NPM (6+)
 - Ruby (2.6+ - for Jekyll)

Optional:
 - Gulp [global install]
   - CLI: 2.2.0
   - Local: 4.0.2

### Fork and clone repository
```bash
git clone git@github.com:YOUR_USER_NAME/rhddx.git
cd rhddx
git remote add -f upstream git@github.com:mindreeper2420/rhddx.git
```

### Getting started

All processes are controlled through Node/Gulp (even though this is a Jekyll JAMstack site). As such, after cloning this repository run:

```bash
# Install devDependencies
npm install

# Run Gulp Build
gulp build
```
alternatively, you can run something like
```bash
# Install devDependencies and run Build steps
npm install && npm run build
```

Each subsequent startup can be done using either `npm run development` or `gulp development`.

When in development mode, Gulp will watch the project folders for changes. Changes to `.scss` files will rebuild the styles and update the `main.css` or `rhdp.css` files under `_site/assets/`. Changes to any `.html` files will kick of the Jekyll Build process, updating the HTML files under `_site/`

To view the site locally, navigate to [localhost:4000](http://localhost:4000/).

### Run Netlify locally

Would you like to run the Netlify build locally? If so, you will need to run the following:

```bash
# Install the Netlify CLI
npm install netlify-cli -g

# Start Netlify dev
netlify dev
```

When running [Netlify locally](https://www.netlify.com/products/dev/), you can stream your dev server to a URL that you can then share. This is best used for local, collaborative development.

## Browser support

RHDDX is supported on the latest version of the following browsers:

 - Chrome
 - Firefox
 - Safari
 - Edge

## Performance

You can test the demo site's TTFB (Time To First Byte) at [testmysite.io](https://testmysite.io/5b50abe51f12b74b81dd5442/rhddx.netlify.com)

----

[![ForTheBadge built-with-love](http://ForTheBadge.com/images/badges/built-with-love.svg)](https://GitHub.com/mindreeper2420/)

[![ForTheBadge uses-git](http://ForTheBadge.com/images/badges/uses-git.svg)](https://github.com/topics/git)
[![ForTheBadge uses-html](http://ForTheBadge.com/images/badges/uses-html.svg)](https://github.com/topics/html)
[![ForTheBadge uses-css](http://ForTheBadge.com/images/badges/uses-css.svg)](https://github.com/topics/css)
