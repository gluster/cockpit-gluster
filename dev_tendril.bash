#!/bin/bash
dir=./src
remote_install_str="rpm -evh cockpit-gluster; rpm -ivh /root/rohan/cockpit-gluster-0.1-1.fc28.noarch.rpm --relocate /usr/share/cockpit=/root/.local/share/cockpit"
remote_hostname="root@tendrl27.lab.eng.blr.redhat.com"
ssh_opts=""
if [[ $# -ge 1 ]]
then
	ssh_opts=" ${@} ${ssh_opts}"
	echo "Added SSH options: ${ssh_opts}"
fi

#Might not work with sudo without these lines in /etc/sudoers (or even afer that wtf).
#Defaults env_keep += "HOME"
#Defaults env_keep += "SSH_AUTH_SOCK"
echo "HOME is ${HOME}"


eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa


while inotifywait -qqre modify "${dir}"
do
    npx --no-install webpack && 
	    make rpm && 
	    sshpass -p rhhi123 rsync -e "ssh ${ssh_opts}" ./rpm_build/RPMS/noarch/cockpit-gluster-0.1-1.fc28.noarch.rpm ${remote_hostname}:/root/rohan/ && 
	    sshpass -p rhhi123 ssh ${ssh_opts} ${remote_hostname} ${remote_install_str} &&
	    notify-send "Updated Remote Plugin"
done
