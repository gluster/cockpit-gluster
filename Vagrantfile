Vagrant.configure(2) do |config|
  config.vm.define "cockpit" do |cockpit|
    cockpit.vm.box = "centos/7"
    cockpit.vm.network "private_network", ip: "192.168.50.86"
    cockpit.vm.synced_folder "./dist", "/cockpit/dist", type: "rsync", create: true, rsync__args: ["--verbose", "--archive", "--delete", "-z"]
    cockpit.vm.network "forwarded_port", guest: 9090, host: 80
    cockpit.vm.post_up_message = "You can now access Cockpit at http://localhost:80 (login as 'admin' with password 'foobar')"
    cockpit.vm.hostname = "cockpit-plugin-devel"

    cockpit.vm.provider "libvirt" do |libvirt|
        libvirt.memory = 1024
        libvirt.nested = true
        libvirt.cpu_mode = "host-model"
    end

    cockpit.vm.provider "virtualbox" do |virtualbox|
        virtualbox.memory = 1024
    end

    cockpit.vm.provision "shell", inline: <<-SHELL
        # Make bash stop on non-zero error code...
        set -e


        #disable deltarpms because it's pointless in this case and produces warnings
        cp /etc/yum.conf /etc/yum.conf.bak
        echo "deltarpm=0" >> /etc/yum.conf

        yum update -y
        yum install -y util-linux

        echo foobar | passwd --stdin root
        #create admin user if one doesn't exist
        getent passwd admin >/dev/null || useradd -c Administrator -G wheel admin
        echo foobar | passwd --stdin admin

        yum install -y cockpit
        usermod -a -G wheel vagrant
        chfn -f Vagrant vagrant

        #install packages
        yum install -y \
            cockpit \
            tuned libvirt \

        #re-enable deltarpms it's no longer pointless
        cat /etc/yum.conf.bak > /etc/yum.config
        rm -f /etc/yum.conf.bak

        #make dirs where cockpit plugins are stored
        mkdir -p /root/.local/share/cockpit /home/admin/.local/share/cockpit /usr/local/share/cockpit

        #keep link dist folder to plugin locations
        #ln -snf /cockpit/dist /usr/local/share/cockpit/gluster #should not be changed while cockpit is running.
        ln -snf /cockpit/dist /root/.local/share/cockpit/gluster
        ln -snf /cockpit/dist /home/admin/.local/share/cockpit/gluster

        #enable and start Cockpit
        systemctl enable cockpit.socket
        systemctl start cockpit.socket

        printf "[WebService]\nAllowUnencrypted=true\n" > /etc/cockpit/cockpit.conf
        systemctl daemon-reload
    SHELL
  end
end
