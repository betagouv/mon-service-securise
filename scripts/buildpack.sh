#!/usr/bin/env bash

# Inspiré de : https://github.com/Scalingo/multi-buildpack/blob/master/bin/compile

set -e
unset GIT_DIR

dir=$(mktemp -t buildpackXXXXX)
rm -rf $dir

url="https://github.com/Scalingo/multi-buildpack.git"
echo "=====> Downloading Buildpack: $url"

git clone $url $dir >/dev/null 2>&1
cd $dir
chmod -f +x $dir/bin/{detect,compile,release} || true
$dir/bin/compile $1 $2 $3

if [ $? != 0 ]; then
  exit 1
fi

if [ -e $dir/export ]; then
  source $dir/export
fi

if [ -x $dir/bin/release ]; then
  $dir/bin/release $1 > $1/last_pack_release.out
fi
