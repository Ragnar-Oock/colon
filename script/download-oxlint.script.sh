#!/usr/bin/env bash

# get the oxlint version requested by the package json file
oxlintVersion="$(jq --raw-output .devDependencies.oxlint ./package.json | sed --regexp-extended 's/\^//')"

# get the release info for the tag corresponding to the oxlint version listed in the package.json
release="$(curl --location \
  --header "Accept: application/vnd.github+json" \
  --header "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/oxc-project/oxc/releases/tags/apps_v$oxlintVersion")"

# find the 'browser_download_url' property of the object in the 'assets' array that has a 'name' property that contains 'oxlint-linux-x64-gnu'
downloadUrl="$(echo "$release" | jq --raw-output '.assets | map(select(.name | contains("oxlint-linux-x64-gnu")))[0] | .browser_download_url')"

# download and unzip the asset we found above
curl --fail --silent --location "$downloadUrl" | tar --extract --ungzip || { echo "Download or extraction of oxlint failed"; exit 1; }

# rename the extracted binary
mv oxlint-linux-x64-gnu oxlint