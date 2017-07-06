#!/bin/sh

set -x
set -e

cd /usr/testbed
mkdir -p obj
cd obj
../src/configure --with-TBDEFS=/tmp/config/defs-vbed-3
cd install
perl ./boss-install -b
