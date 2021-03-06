REPLACE INTO `state_transitions` VALUES 
  ('MFS','BOOTING','BOOTING','DHCPRetry'),
  ('MFS','BOOTING','RELOADSETUP','BootOK'),
  ('MFS','BOOTING','SHUTDOWN','Error'),
  ('MFS','PXEBOOTING','BOOTING','BootInfo'),
  ('MFS','RELOADING','RELOADDONE','ReloadDone'),
  ('MFS','RELOADING','RELOADDONEV2','ReloadDone'),
  ('MFS','RELOADING','SHUTDOWN','Error'),
  ('MFS','RELOADOLDMFS','SHUTDOWN',''),
  ('MFS','RELOADSETUP','RELOADING','ReloadReady'),
  ('MFS','RELOADSETUP','RELOADOLDMFS',''),
  ('MFS','RELOADSETUP','SHUTDOWN','Error'),
  ('MFS','SHUTDOWN','BOOTING','DHCP'),
  ('MFS','SHUTDOWN','PXEBOOTING','DHCP'),
  ('MFS','SHUTDOWN','SHUTDOWN','Retry')
;

REPLACE INTO `state_triggers` VALUES
  ('*', 'MFS', 'RELOADDONE',   'RESET, RELOADDONE'),
  ('*', 'MFS', 'RELOADDONEV2', 'RESET, RELOADDONEV2')
;
