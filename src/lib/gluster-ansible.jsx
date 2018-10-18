export const INVENTORY = "/etc/ansible/hc_wizard_inventory.yml"

export const defaultGlusterModel = {
  hosts:["","",""],
  volumes: [ ],
  bricks: [],
  cacheConfig: [

  ],
  raidConfig:{
    raid_type:"JBOD",
    stripe_size:256,
    disk_count:12
  }
}


export const runGlusterAnsible = (inventoryFile, streamer, onDone, onFail) => {
  let cmd =     ["/usr/bin/ansible-playbook",
       "/etc/ansible/ping.yml",
       "-i",
       `${inventoryFile}`
     ];
  cmd =     ["/usr/bin/ansible-playbook",
       "/etc/ansible/hc_wizard.yml",
       "-i",
       `${inventoryFile}`,
       "--skip-tags",
       "prerequisites"
     ];

  return cockpit.spawn(cmd).done(onDone).fail(onFail).stream(streamer);


}
