#!/bin/sh

set -x
set -e

cd /usr/testbed/obj
../src/configure --with-TBDEFS=/tmp/config/defs-vbed-3 --with-WALRUS=yes
gmake boss-install-force
