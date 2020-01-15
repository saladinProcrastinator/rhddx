[![Netlify Status](https://api.netlify.com/api/v1/badges/eadda60c-6780-4720-869d-ea925937a7e2/deploy-status)](https://app.netlify.com/sites/rhddx/deploys)
[![Automated Release Notes by gren](https://img.shields.io/badge/%F0%9F%A4%96-release%20notes-00B2EE.svg)](https://github-tools.github.io/github-release-notes/)

# RHDDX Frontend Documentation Site


## Local Development

All processes are controlled through Node/Gulp (even though this is a Jekyll JAMstack site). As such, clone this repository and run:

```bash
npm install
gulp development
```
Gulp will watch the project folders for changes.
```json
/assets
/styles
/pages
/_data
/_includes
/_layouts
```

Now navigate to [localhost:4000](http://localhost:4000/) to preview the site, and
[localhost:4000/admin](http://localhost:4000/admin) to log into the CMS.

## Bug reports, feature requests, etc

This is an ongoing project and I welcome contributions. Feel free to submit a PR.

If you need any help with setting up Netlify CMS, you can reach out to the Netlify team in the [Netlify CMS Gitter](https://gitter.im/netlify/netlifycms).

## Performance

You can test the demo site's TTFB (Time To First Byte) at [testmysite.io](https://testmysite.io/5b50abe51f12b74b81dd5442/jekyll-netlify-boilerplate.netlify.com)
