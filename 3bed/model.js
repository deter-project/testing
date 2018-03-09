/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 3-node testing system
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

// hey! listen! ~~~
// TBDIR
// TOPODIR 
// WALRUSDIR
// are environment variables that you must set when calling rvn build

// define the mounts we will use later in node definitions
deter_mounts = [{
    'source': env.TBDIR,
    'point': '/opt/deter/testbed'
  }];

///////
// mounts ~~~~~~~
////

configMount = (name) => ({
  'source': env.TOPODIR + '/config/files/' +name,
  'point': '/tmp/config'
});


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
  tbswitch('stem', [...deter_mounts, configMount('stem')]),
  tbswitch('leaf', [...deter_mounts, configMount('leaf')])
];

///////
// links ~~~~~~~~~~
////

links = [
  Link('boss', 0, 'stem', 1),
  Link('users', 0, 'stem', 2),
  Link('router', 0, 'stem', 3),
  ...Range(3).map(i => Link(`n${i}`, 0, 'stem', i+4, {boot: 1})),
  ...Range(3).map(i => Link(`n${i}`, 0, 'leaf', i+1)),
  Link('walrus', 0, 'stem', 7),
  Link('stem', 8, 'leaf', 4),

];

topo = {
  'name': '3bed',
  'nodes': nodes,
  'switches': switches,
  'links': links
};


