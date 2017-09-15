#!/usr/bin/env bash

set -x
set -e

cd /usr/testbed
mkdir -p obj
cd obj
../src/configure --with-TBDEFS=/tmp/config/defs-vbed-3 &> /var/log/boss_configure
cd install
perl ./boss-install -b &> /var/log/boss_install
