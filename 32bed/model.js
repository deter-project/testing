/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 32-node topology testing system
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
    'image': 'freebsd-11',
    'os': 'freebsd',
    'level': 1,
    'mounts': [
      ...deter_mounts,
      configMount(name),
      { 'source': env.WALRUSDIR, 'point': '/opt/walrus' }
    ]
  })
);

router = {
  'name': 'router',
  'image': 'freebsd-11-router',
  'os': 'freebsd',
  'level': 1,
  'mounts': [ configMount('router') ]
};

walrus = {
  'name': 'walrus',
  'image': 'debian-stretch',
  'os': 'linux',
  'level': 2,
  'mounts': [ 
    configMount('walrus'),
    { 'source': env.WALRUSDIR, 'point': '/opt/walrus' },
  ]
}

testnodes = Range(32).map(i => ({
    'name': `n${i}`,
    'image': 'netboot',
    'os': 'netboot',
    'level': 3,
    'mounts': [ ]
  })
);


nodes = [boss, users, router, walrus, ...testnodes]

///////
// switches ~~~~~~~
////


switches = [
  Switch('stem', 1, [...deter_mounts, configMount('stem'), agxMount, netlinkMount]),
  Switch('trunk', 1, [...deter_mounts, configMount('trunk'), agxMount, netlinkMount]),
  Switch('spine0', 1, [...deter_mounts, configMount('spine0'), agxMount, netlinkMount]),
  Switch('spine1', 1, [...deter_mounts, configMount('spine1'), agxMount, netlinkMount]),
  Switch('leaf0', 1, [...deter_mounts, configMount('leaf0'), agxMount, netlinkMount]),
  Switch('leaf1', 1, [...deter_mounts, configMount('leaf1'), agxMount, netlinkMount]),
  Switch('leaf2', 1, [...deter_mounts, configMount('leaf2'), agxMount, netlinkMount]),
  Switch('leaf3', 1, [...deter_mounts, configMount('leaf3'), agxMount, netlinkMount])
];

///////
// links ~~~~~~~~~~
////

links = [
  // infrastructure control net
  Link('boss',   '', 'stem', ''),
  Link('users',  '', 'stem', ''),
  Link('router', '', 'stem', ''),
  Link('walrus', '', 'stem', ''),

  // switch control net
  Link('trunk',  '', 'stem', ''),
  Link('spine0', '', 'stem', ''),
  Link('spine1', '', 'stem', ''),
  Link('leaf0',  '', 'stem', ''),
  Link('leaf1',  '', 'stem', ''),
  Link('leaf2',  '', 'stem', ''),
  Link('leaf3',  '', 'stem', ''),

  // node control net
  ...Range(32).map(i => Link(`n${i}`,   '', 'stem', '', {boot: 1})),

  // trunk-spine experiment net
  ...Range(4).map(i => Link('spine0', '', 'trunk', '')),
  ...Range(4).map(i => Link('spine1', '', 'trunk', '')),

  // leaf-trunk experiment net
  ...Range(4).map(i => Link('leaf0', '', 'spine0', '')),
  ...Range(4).map(i => Link('leaf1', '', 'spine0', '')),
  ...Range(4).map(i => Link('leaf2', '', 'spine1', '')),
  ...Range(4).map(i => Link('leaf3', '', 'spine1', '')),

  // node-leaf experiment net
  ...Range(8).map(i => Link(`n${i}`,    '', 'leaf0', '')),
  ...Range(8).map(i => Link(`n${8+i}`,  '', 'leaf1', '')),
  ...Range(8).map(i => Link(`n${16+i}`, '', 'leaf2', '')),
  ...Range(8).map(i => Link(`n${24+i}`, '', 'leaf3', ''))

];

topo = {
  'name': '32bed',
  'nodes': nodes,
  'switches': switches,
  'links': links
};


