#!/usr/bin/env bash

# get deter client utilities

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
  sudo chmod +x /usr/local/bin/deter-admin
  sudo ln -s /usr/local/bin/deter-admin /usr/bin/deter-admin
fi

# wtf
if [[ ! -f /usr/local/bin/wtf ]]; then
  curl -OL https://mirror.deterlab.net/bakery/wtf/wtf
  sudo mv wtf /usr/local/bin/
  sudo chmod +x /usr/local/bin/wtf
  sudo -ln -s /usr/local/bin/wtf /usr/bin/wtf
fi

if [[ ! -d testbed ]]; then
  git clone https://github.com/deter-project/testbed
fi

#if [[ ! -d switch-drivers ]]; then
#  mkdir switch-drivers
#  cd switch-drivers
#  wget https://github.com/deter-project/switch-drivers/releases/download/v0.1/lldp-switchmac
#  chmod +x lldp-switchmac
#  wget https://github.com/deter-project/switch-drivers/releases/download/v0.1/snmpd
#  chmod +x snmpd
#  cd $codedir
#fi

if [[ ! -d walrustf ]]; then
  git clone https://github.com/rcgoodfellow/walrustf
fi

#if [[ ! -d agx ]]; then
#  mkdir agx
#  cd agx
#  wget https://github.com/rcgoodfellow/agx/releases/download/v0.1/qbridge
#  chmod +x qbridge
#  cd $codedir
#fi

