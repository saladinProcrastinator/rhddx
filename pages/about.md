---
layout: about
title: About
permalink: /about
section: overview
intro_paragraph: >
  This is the Pages overview page. It contains examples for all of the pages that are used on developers.redhat.com.
---

## The RHDDX site

The RHDDX site is the reference environment for developers.redhat.com. We strive to keep this site as up-to-date as possible but occasionally differences arrise between here and developers.redhat.com. If you find an error/difference/concern, feel free to report and issue on our [GitHub](https://github.com/redhat-developer/developers.redhat.com/issues) page.

## Development
The following information is related to the frontend code under [redhat-developer/developers.redhat.com](https://github.com/redhat-developer/developers.redhat.com/) and not for this demo environment. If you wish to contribute to this site, see [Updating this documentation](/getting-started/update-this-documentation).

### Installation, Scripts, and Contributing

- **Clone** the repository
- **Ask** for the Font Awesome license text for the `.npmrc` file
- **Ask** for the alternate registry information for the `.npmrc` file, if building the repo inside of Red Hat.
    - If running the alternate registry and Font Awesome, you will need to set npm `config set strict-ssl`  to `false` (`npm config set strict-ssl false`). Without that, Font Awesome will try to use the alternate registry for installation, which will not work.`
- **Run** ```npm install``` to install npm-tracked dependencies locally
- **Install** [Go](https://golang.org)
- Make Go-built executables accessible
    - **Add** the go `/bin` to PATH (find by running `go env` and it would be `$GOPATH/bin`)
        - This is a **necessary step** to successfully execute `publish_gh_pages.sh` or `review_gh_pages.sh`
    - **_Alternatively_** you can just run `hugo` commands with `~/go/bin/hugo`
- **Run** `go get github.com/gohugoio/hugo` (gets and builds the latest Hugo release)
- Mac users **Run** `cd ~/go/src/github.com/gohugoio/hugo && go install --tags extended` to ensure you have the extended release
- **Run** `hugo version` or `~/go/bin/hugo version` (_currently v0.56.3_; also look for `/extended` as that is necessary for Sass pipelines)
- If missing dependencies, either `go get ...` them or install for your OS. Have seen the following needed:
    - `go get github.com/hashicorp/go-immutable-radix`
    - `go get github.com/wellington/go-libsass`
    - gcc / g++
- Mac users: Increase max file limit so that you can run the Hugo server
    - **Create** a `limit.maxfiles.plist` file

```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
    "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
        <dict>
        <key>Label</key>
        <string>limit.maxfiles</string>
        <key>ProgramArguments</key>
        <array>
            <string>launchctl</string>
            <string>limit</string>
            <string>maxfiles</string>
            <string>262144</string>
            <string>524288</string>
        </array>
        <key>RunAtLoad</key>
        <true/>
        <key>ServiceIPC</key>
        <false/>
        </dict>
    </plist>
```

- Run the following:
  - **Run** `chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist` to properly set the owner
  - **Run** `chmod 0644 /Library/LaunchDaemons/limit.maxfiles.plist` to properly set the file permissions
  - **Run** `launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist` to load the `limit.maxfiles.plist` to the LaunchAgent
  - **Restart** you Mac so that the LaunchAgent can run and increase you max file limit
- Run the Hugo server
    - **Run** default dev server `hugo serve` (pulls from `config/development/config.toml)`)
    - **Run** bound dev server `hugo serve --bind=0.0.0.0 --port=8080` (for VMs or other sandbox environments)
- **Enjoy** live reload for Sass and Templates
- JS will live reload after running `npm run scripts` to build production script files

* NPM Scripts (```npm start```, ```npm test```, ```npm run {name}```)
    * ```start``` - builds scripts and keeps watching for changes
    * ```test``` - runs Karma test runner using Jasmine
    * ```build``` - builds scripts but does not watch for changes
    * ```scripts``` - builds scripts and keeps watching for changes

#### Adding and Updating Components

* Create a new component page
    * **Run** `hugo new components/yourcomponent.md`
    * **Edit** the new component file in `src/docs/content/components`
    * **Update** the `title`, `description`, and `scripts`
    * **Add** markdown content to appear above the render
* Create the data structure for the component
    * **Add** a data folder for your component in `/src/data/components/yourcomponent`
    * **Add** a `variant` file in the component's data folder

```toml
    [[variant]]
    id = "default"
    name = "Default Variant"
    order = 1

    [[variant]]
    id = "default2"
    name = "Default Variant 2"
    order = 2
```

```json
{
    "variant": [
        {
            "id": "variant1",
            "name": "Variation 1",
            "order": 1
        },
        {
            "id": "variant2",
            "name": "Variation 2",
            "order": 2
        }
    ]
}
```

Now do the following:
  * **Add** a `context` folder in your component's data folder for each different context you want to express for your component
  * **Add** a `details` file (JSON, YAML, or TOML) to the context folder

```toml
  name = "DEFAULT CONTEXT"
```

```json
  {
    "name": "New Component Name"
  }
```
  * **Add** a `{variantname}` file (JSON, YAML, or TOML) to the context folder with the context's template(s) for that variant

```toml
  templates = ["""
  <span>Variant Template 1</span>
  ""","""
  <span>Variant Template 2</span>
  """]
```

```json
{
  "templates": [
      "<span>Variant Template 1</span>",
      "<span>Variant Template 2</span>"
  ]
}
```

* **View** your new component page `/components/newcomponent`
