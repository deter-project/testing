/*
 * switchinit
 * =====----~~
 *
 *	 switchinit is a program that takes in a json file describing the desired
 *   configuration of a switch in terms of its neighbors (as discovered via lldp)
 *   and uses the deter snmp-driver (dsnmp) to configure the switch in that way.
 *
 *   right now the only type of configuration that is supported is vlan config.
 *   future types of configuration may be supported later on down the road
 *
 *	 the input format is json and has the following structure for each switch.
 *	 in this example the two switch interfaces are specified in terms of
 *   neighbors (pc47 and pc74). pc47 has a trunked vlan config and pc74 has an
 *	 access vlan config. The final neighbor called "~" is special, it applies
 *	 to any interface that is not matched to a neighbor in the list.
 *
 *	 neighbor names are regular expressions so they may contain *?. etc
 *
 *	 {
 *		 "name": "my-switch",
 *		 "interfaces": {
 *			"pc47": {
 *			  "vlan": {
 *          "trunk": [2,4,6,8]
 *				}
 *			},
 *			"pc74": {
 *			  "vlan": {
 *          "access": 9
 *				}
 *			},
 *			"~": {
 *			  "vlan": {
 *          "access": 1
 *				}
 *			}
 *		}
 *	}
 *
 */

package main

import (
	"encoding/json"
	dsnmp "github.com/deter-project/switch-drivers/snmp/snmp"
	"io/ioutil"
	"log"
	"os"
	"regexp"
)

type Config struct {
	Name       string
	Interfaces map[string]IfConf
}

type IfConf struct {
	Vlan VlanConf
}

type VlanConf struct {
	Trunk  []int
	Access int
}

func main() {

	log.SetFlags(0)

	if len(os.Args) < 2 {
		log.Fatal("usage: switchinit config.json")
	}

	buf, err := ioutil.ReadFile(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}

	var configs []Config

	err = json.Unmarshal(buf, &configs)
	if err != nil {
		log.Fatal(err)
	}

	for _, c := range configs {
		err = doConfig(c)
		if err != nil {
			log.Fatal(err)
		}
	}

}

func doConfig(c Config) error {

	// initialize switch controller for the switch in question
	s, err := dsnmp.NewSwitchControllerSnmp(c.Name)
	if err != nil {
		return err
	}
	defer s.Snmp.Conn.Close()

	// ask the switch who its neighbors are
	nbrs, err := s.GetNeighbors()
	if err != nil {
		return err
	}

	ifxs, err := s.GetInterfaces()
	if err != nil {
		return err
	}
	matched := make(map[int]bool)
	for _, ifx := range ifxs {
		matched[ifx.BridgeIndex] = false
	}

	// walk through the provided configurations and try to match each to a switch
	// interface
	for pattern, cfg := range c.Interfaces {

		// compile user provided neighbor pattern
		rx, err := regexp.Compile(pattern)
		if err != nil {
			return err
		}

		for _, n := range nbrs {

			// if the interface has the specified neighbor, run the config on it
			if rx.MatchString(n.RemoteName) {
				matched[n.BridgeIfIndex] = true
				configIfx(n.BridgeIfIndex, cfg, s)
			}

		}
	}

	// check if there is a default rule, and if so apply it to any unmached
	// interfaces
	defaultRule, ok := c.Interfaces["~"]
	if ok {
		for bridge_index, match := range matched {
			if !match && bridge_index > 0 {
				configIfx(bridge_index, defaultRule, s)
			}
		}
	}

	return nil

}

func configIfx(bridgeIndex int, c IfConf, s *dsnmp.SwitchControllerSnmp) error {

	// clear out any previous configuration on the port
	log.Printf("[%d] clearing ports", bridgeIndex)
	err := s.ClearPorts([]int{bridgeIndex})
	if err != nil {
		return err
	}

	// if there are trunk ports set them, otherwise check for an access port
	// and set that up
	if len(c.Vlan.Trunk) > 0 {
		log.Printf("[%d] setting trunk", bridgeIndex)
		err_ := s.SetPortTrunk([]int{bridgeIndex}, c.Vlan.Trunk)
		if err != nil {
			log.Printf("%v", err)
			err = err_
		}
	} else if c.Vlan.Access > 0 {
		log.Printf("[%d] setting access", bridgeIndex)
		err_ := s.SetPortAccess([]int{bridgeIndex}, c.Vlan.Access)
		if err != nil {
			log.Printf("%v", err)
			err = err_
		}
	}

	return err

}
