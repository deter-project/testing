#!/usr/bin/env bash

set -e

here=`pwd`

mkdir -p code
cd code

codedir=`pwd`

#
# tools ~~~~~~~~
#

# deter-admin
if [[ ! -f /usr/local/bin/deter-admin ]]; then
curl -OL https://mirror.deterlab.net/deter/bin/deter-admin
sudo mv deter-admin /usr/local/bin/
chmod +x /usr/local/bin/deter-admin
fi

# wtf
if [[ ! -f /usr/local/bin/wtf ]]; then
curl -OL https://mirror.deterlab.net/bakery/wtf/wtf
sudo mv wtf /usr/local/bin/
chmod +x /usr/local/bin/wtf
fi

if [[ ! -d testbed ]]; then
git clone git@github.com:deter-project/testbed
cd testbed
cd ..
fi

if [[ ! -d switch-drivers ]]; then
git clone git@github.com:deter-project/switch-drivers
fi

if [[ ! -d walrustf ]]; then
git clone git@github.com:rcgoodfellow/walrustf
fi

if [[ ! -d agx ]]; then
git clone git@github.com:rcgoodfellow/agx
fi

if [[ ! -d netlink ]]; then
git clone git@github.com:rcgoodfellow/netlink
fi

export TBDIR="$codedir/testbed"
export TOPODIR="$here"
export SWITCHDIR="$codedir/switch-drivers"
export WALRUSDIR="$codedir/walrustf"
export AGXDIR="$codedir/agx"
export NLDIR="$codedir/netlink"

cd $here

