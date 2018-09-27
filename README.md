# cockpit-gluster
A GD2 based dashboard for gluster management.
It runs on any of the brick servers (where glusterd2 is running).

### Contents:
- [Features](#features)
- [Build](#building-from-source)
- [Package](#make-an-rpm)
- [Setup GD2 environment](#setup-your-brick-servers-with-gd2)
- [Install](#installing-on-one-of-the-gd2-nodes)
- [Access](#browse-to-the-cockpit-port)

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


## Setup your brick servers with GD2 and ansible dependencies:

On your brick servers:

```
sudo yum install -y python-requests python-jwt
```

and install and start/enable glusterd2.

As GD2 is in development, it is recommended to build it from the `master` branch and deploy it with an external etcd.
See [GD2 Resources](#gd2-resources)

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

## Screenshots
![Dashboard Image](/screenshots/dashboard.png?raw=true "Dashboard")
![Volume Modal Image](/screenshots/volume_modal.png?raw=true "Volume Modal")



## Cockpit

https://github.com/cockpit-project/cockpit

# GD2 Resources

GD2 developement guide: https://github.com/gluster/glusterd2/blob/master/doc/development-guide.md

GD2 quickstart guide: https://github.com/gluster/glusterd2/blob/master/doc/quick-start-user-guide.md

With my scripts (on CentOS VMs): https://github.com/rohantmp/gd2-testing
