/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 3-node testing system
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// hey! listen! ~~~
// TBDIR
// TOPODIR 
// SWITCHDIR
// WALRUSDIR
// AGXDIR
// NLDIR
// are environment variables that you must set when calling rvn build

// define the mounts we will use later in node definitions
deter_mounts = [{
    'source': env.TBDIR,
    'point': '/opt/deter/testbed'
  },{
    'source': env.SWITCHDIR,
    'point': '/opt/deter/switch-drivers'
  }
];

///////
// mounts ~~~~~~~
////

configMount = (name) => ({
  'source': env.TOPODIR + '/config/files/' +name,
  'point': '/tmp/config'
});

agxMount = { 
  'source': env.AGXDIR,   
  'point': '/opt/agx' 
};

netlinkMount = { 
  'source': env.NLDIR, 
  'point': '/opt/netlink' 
};


///////
// nodes ~~~~~~~~
////

[boss, users] = ['boss', 'users'].map(name => ({
    'name': name,
    'image': 'freebsd-11d',
    'os': 'freebsd',
    'cpu': {
      'cores': 4
    },
    'memory': {
      'capacity': GB(8)
    },
    'mounts': [
      ...deter_mounts,
      configMount(name),
      { 'source': env.WALRUSDIR, 'point': '/opt/walrus' }
    ]
  })
);

router = {
  'name': 'router',
  'image': 'freebsd-11r',
  'os': 'freebsd',
    'cpu': {
      'cores': 2
    },
    'memory': {
      'capacity': GB(4)
    },
  'mounts': [ configMount('router') ]
};

testnodes = Range(3).map(i => ({
    'name': `n${i}`,
    'image': 'netboot',
    'os': 'netboot',
    'no-testnet': true,
    'cpu': {
      'cores': 2
    },
    'memory': {
      'capacity': GB(4)
    },
    'mounts': [ configMount('router') ]
  })
);

walrus = {
  'name': 'walrus',
  'image': 'debian-stretch',
  'os': 'linux',
  'mounts': [ 
    configMount('walrus'),
    { 'source': env.WALRUSDIR, 'point': '/opt/walrus' },
  ]
}

nodes = [boss, users, router, walrus, ...testnodes]

///////
// switches ~~~~~~~
////

tbswitch = (name, mounts) => ({
  'name': name,
  'image': 'cumulusvx-3.5',
  'os': 'linux',
  'mounts': mounts
});

switches = [
  tbswitch('stem', [...deter_mounts, configMount('stem'), agxMount, netlinkMount]),
  tbswitch('leaf', [...deter_mounts, configMount('leaf'), agxMount, netlinkMount])
];

///////
// links ~~~~~~~~~~
////

links = [
  Link('boss', 'eth0', 'stem', 'swp1'),
  Link('users', 'eth0', 'stem', 'swp2'),
  Link('router', 'eth0', 'stem', 'swp3'),
  ...Range(3).map(i => Link(`n${i}`, 'eth0', 'stem', `swp${i+4}`, {boot: 1})),
  ...Range(3).map(i => Link(`n${i}`, 'eth0', 'leaf', `swp${i+1}`)),
  Link('walrus', 'eth0', 'stem', 'swp7'),
  Link('stem', 'swp8', 'leaf', 'swp4'),

];

topo = {
  'name': '3bed',
  'nodes': nodes,
  'switches': switches,
  'links': links
};


