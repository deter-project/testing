#!/bin/bash

set -e

rvn ansible walrus config/deter_testsuite.yml
wtf -collector=`rvn ip walrus` watch config/files/walrus/deter-basic.json
