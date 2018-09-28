# cockpit-gluster
A [cockpit](https://github.com/cockpit-project/cockpit) plugin that provides a status view and volume actions for a gluster cluster with [glusterd2](https://github.com/gluster/glusterd2)(GD2) based bricks.

It runs on any of the brick nodes (where glusterd2 is running).

### Contents:
- [Features](#features)
- [Build](#building-from-source)
- [Package](#make-an-rpm)
- [Setup GD2 environment](#setup-your-brick-servers-with-gd2)
- [Install](#installing-on-one-of-the-gd2-nodes)
- [Access](#browse-to-the-cockpit-port)
- [Dashboard screenshots](#dashboard-screenshots)
- [Create volumes](#create-volumes)

### Features:
- Status panel for monitoring peers, volumes and bricks
- A Wizard for brick setup and volume deployment.
### Pending Features
- GD2 rest auth support.
- Supporting multiple volume types.

## Building from source

### Install Build Dependencies

```
sudo yum install -y npm
npm install
```

### Build the project
```
./node_modules/.bin/webpack
```

## Make an rpm
```
make rpm
```


## Setup your brick servers with GD2


As GD2 is in development, it is recommended to build it from the `master` branch and deploy it with an external etcd.
See [GD2 Resources](#gd2-resources) for more information, and automated setup.

## Installing (on one of the GD2 nodes)
### Install gluster-ansible and its dependencies:

gluster-ansible is hosted in a [copr repo](https://copr.fedorainfracloud.org/coprs/sac/gluster-ansible/)

#### Install the repo:

| Operating System            | Install Command |
| ------------- | --------------- |
| Centos 7      | `sudo curl -o /etc/yum.repos.d/gluster-ansible.repo https://copr.fedorainfracloud.org/coprs/sac/gluster-ansible/repo/epel-7/sac-gluster-ansible-epel-7.repo`        |
| Fedora 27+     | `sudo dnf copr enable sac/gluster-ansible`  |


#### Install the packages from the repo:

```
sudo yum install gluster-ansible python-gluster-mgmt-client

```

## Install cockpit-gluster
```
yum install -y cockpit-gluster-x.x.x-x.noarch.rpm
```
## Browse to the cockpit port:
`http://your-cockpithost.domain:9090`



## Creating volumes

Setup passwordless ssh from the managing host (where cockpit-gluster is installed) to all the other nodes:

Run these commands on the managing host:
```
ssh-keygen

ssh-copy-id root@host1.example.com
ssh-copy-id root@host2.example.com
ssh-copy-id root@host3.example.com
```

Click on:
 - Create Volume (if creating on the existing cluster)
 - Expand Cluster (if creating on new nodes)

## Screenshots
### Dashboard
![Dashboard Image](/screenshots/dashboard.png?raw=true "Dashboard")

### Volume Creation Wizard
![Wizard Hosts Image](/screenshots/wizard_hosts.png?raw=true "Wizard Hosts")
![Wizard Volumes Image](/screenshots/wizard_volumes.png?raw=true "Wizard Volumes")
![Wizard Bricks Image](/screenshots/wizard_bricks.png?raw=true "Wizard Bricks")
![Wizard Review Image](/screenshots/wizard_review.png?raw=true "Wizard Review")



## GD2 Resources

GD2 developement guide: https://github.com/gluster/glusterd2/blob/master/doc/development-guide.md

GD2 quickstart guide: https://github.com/gluster/glusterd2/blob/master/doc/quick-start-user-guide.md

A two command cluster setup with ansible and bash (for CentOS machines): https://github.com/rohantmp/gd2-testing
