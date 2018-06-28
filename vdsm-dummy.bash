#!/bin/bash
user=tpjsm

if [[ $2 = "GlusterHost" ]]
then
  cat /home/${user}/dummy_1.txt
elif [[ $2 = "GlusterVolume" ]]; then
  if [[ $3 = "list" ]]; then
	  cat /home/${user}/dummy_3.txt
  elif [[ $4 = "volumeName=engine" ]]; then
    cat /home/${user}/dummy_engine.txt
  elif [[ $4 = "volumeName=data" ]]; then
    cat /home/${user}/dummy_data.txt
  elif [[ $4 = "volumeName=vmstore" ]]; then
    cat /home/${user}/dummy_vmstore.txt
  else
    echo "GlusterVolume else"
    exit 1
  fi
else
  echo "GlusterHost else"
  exit 1
fi
