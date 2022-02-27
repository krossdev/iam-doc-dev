IPFS-private network

- https://labs.eleks.com/2019/03/ipfs-network-data-replication.html

Here’s an IPFS tutorial to show you how to organise a private distributed network to enable secure storage, sharing and data replication.

> 这是一个 IPFS 教程，向您展示如何组织私有分布式网络以实现安全存储、共享和数据复制。

There are two types of IPFS networks: public and private. All files in the public IPFS network are accessible to everyone. Since most business applications, especially enterprise solutions, require full control over their data, making their networks publicly available is not an option. This is where IPFS privacy features could help close the network for certain entities.

> IPFS 网络有两种类型：公共和私有。
公共 IPFS 网络中的所有文件都可供所有人访问。由于大多数业务应用程序，尤其是企业解决方案，都需要完全控制其数据，因此公开其网络不是一种选择。
这就是 IPFS 隐私功能可以帮助关闭某些实体的网络访问。

In this IPFS tutorial, we will go through the process of creating a private IPFS network and setting up an IPFS-Cluster for data replication on top of a private IPFS network.

While IPFS itself does not provide data replication among all nodes in the network, there are two options to replicate data in IPFS, using [Filecoin](https://filecoin.io/) and [IPFS-Cluster](https://cluster.ipfs.io/). We will use IPFS-Cluster to enable this functionality. In our case, we’ll deploy our private network on the three virtual machines in the cloud. But before we start, here are the links to the support documentation of the tools used:

> IPFS 本身不提供网络中所有节点之间的数据复制. 
若要复制，有两种选择: Filecoin](https://filecoin.io/) and [IPFS-Cluster](https://cluster.ipfs.io/).
我们将使用 IPFS-Cluster 来启用此功能。

- **IPFS:** A protocol and network designed to create a content-addressable, peer-to-peer method of storing and sharing hypermedia in a distributed file system. [Read more](https://ipfs.io/)
- **Private IPFS:** Allows IPFS to only connect to other peers who have a shared secret key. With **IPFS** **private networks**, each node specifies which other nodes it will connect to. Nodes in that network don’t respond to communications from nodes outside that network. [Read more](https://github.com/ipfs/go-ipfs/blob/master/docs/experimental-features.md#private-networks)
- **IPFS-Cluster:** An IPFS-Cluster is a stand-alone application and a CLI client that allocates, replicates and tracks pins across a cluster of IPFS daemons. **IPFS-Cluster** uses a leader-based consensus algorithm **Raft** to coordinate storage of a pinset, distributing the set of data across the participating nodes. [Read more](https://github.com/ipfs/ipfs-cluster)

It is worth noting that a private network is a default feature implemented within the core **IPFS** functionality and **IPFS-Cluster** is its separate app. IPFS and IPFS-Cluster applications are installed as different packages, run as separate processes, and they have different peer IDs as well as API endpoints and ports. IPFS-Cluster daemon depends on IPFS daemon and should be started afterwards.

### A step-by-step IPFS tutorial for creating a private network

By default, IPFS and IPFS-Cluster use the following ports:

**IPFS**
4001 – Communication with other nodes
5001 – API server
8080 – Gateway server

**IPFS-CLUSTER**
9094 – HTTP API endpoint
9095 – IPFS proxy endpoint
9096 – Cluster swarm, used for communication between cluster nodes

We will use recently created three virtual machines (in my case I used DigitalOcean) with installed Linux Ubuntu Distributive version 16.04 and command line as the main tool for installing necessary packages and settings. Depending on your cloud provider (AWS, Azure, Google, etc.), you may need to look at some additional settings, like firewall or security group configuration, to let your peers see each other.

Let’s suppose that we have three VMs with the following IP addresses:
Node0: 192.168.10.1
Node1: 192.168.10.2
Node2: 192.168.10.3

Let’s start with the zero node (Node0) which will be our bootstrap node.

#### Step 1: Install Go

First of all, let’s install Go as we will need it during our deployment process.
Update Linux packages and dependencies:

Download the latest version and unzip Go

|     |     |
| --- | --- |
| `1` | `wget https:``//dl.google.com/go/go1.11.4.linux-amd64.tar.gz` |

|     |     |
| --- | --- |
| `2` | `sudo tar -xvf go1.11.4.linux-amd64.tar.gz` |

Create Path for Go and set environment variables.
1\. Create folder:

Open .bashrc file and add to the end three variables GOROOT, GOPATH, PATH.
Open file:

Insert to the end of the .bashrc file:

|     |     |
| --- | --- |
| `1` | `export GOROOT=/usr/local/go` |

|     |     |
| --- | --- |
| `2` | `export GOPATH=``$HOME``/gopath` |

|     |     |
| --- | --- |
| `3` | `export PATH=``$PATH``:``$GOROOT``/bin:``$GOPATH``/bin` |

2\. Update .bashrc file and check Go version:

#### Step 2: Install IPFS

We will install the latest version of the **go-ipfs**. At the moment of writing this article, it was v0.4.18 for Linux. You can check for the latest version here https://dist.ipfs.io/#go-ipfs

Download IPFS, unzip tar file, move unzipped folder under bin and initialise IPFS node:

|     |     |
| --- | --- |
| `1` | `wget https:``//dist.ipfs.io/go-ipfs/v0.4.18/go-ipfs_v0.4.18_linux-amd64.tar.gz` |

|     |     |
| --- | --- |
| `2` | `tar xvfz go-ipfs_v0.4.18_linux-amd64.tar.gz` |

|     |     |
| --- | --- |
| `3` | `sudo mv go ipfs/ipfs /usr/local/bin/ipfs` |

Repeat steps 1 and 2 for all your VMs.

#### Step 3: Creating a Private network

Once you have Go and IPFS installed on all of your nodes, run the following command to install the swarm key generation utility. Swarm key allows us to create a private network and tell network peers to communicate only with those peers who share this secret key.

This command should be run only on your Node0. We generate swarm.key on the bootstrap node and then just copy it to the rest of the nodes.

|     |     |
| --- | --- |
| `1` | `go get -u github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen` |

Now run this utility on your first node to generate swarm.key under .ipfs folder:

|     |     |
| --- | --- |
| `1` | `ipfs-swarm-key-gen & > ~/.ipfs/swarm.key` |

Copy the file generated *swarm.key* to the IPFS directory of each node participating in the private network. First of all, you need to remove the default entries of bootstrap nodes from all the nodes you have created.

#### Step 4: Bootstrapping IPFS nodes

Add the hash address of your bootstrap to each of the nodes including the bootstrap.

|     |     |
| --- | --- |
| `1` | `ipfs bootstrap add /ip4/192.168.10.1/tcp/4001/ipfs/QmQVvZEmvjhYgsyEC7NvMn8EWf131EcgTXFFJQYGSz4Y83` |

The IP part (192.168.10.1) will be changed to your Node0 machine IP. The last part is the peer ID which is generated when you initialise your peer ipfs init). You can see it above where it shows “peer identity:

|     |     |
| --- | --- |
| `1` | `QmQVvZEmvjhYgsyEC7NvMn8EWf131EcgTXFFJQYGSz4Y83` |

or if you run ***ipfs id*** command in the console. So, you need to change IP and peer ID accordingly to you Node0. Do this for all of your nodes.

We also need to set the environment variable “LIBP2P\_FORCE\_PNET” to force our network to Private mode:

|     |     |
| --- | --- |
| `1` | `export LIBP2P_FORCE_PNET=1` |

**Configuring IP for communication**

Inside the .ipfs folder, there is a “config” file. It contains a lot of settings including the network details on which our IPFS nodes will work on. Open this config file and find “Addresses”. It will look like this:

|     |     |
| --- | --- |
| `2` | `"API"``:` `"/ip4/192.168.10.1/tcp/5001"``,` |

|     |     |
| --- | --- |
| `4` | `"Gateway"``:` `"/ip4/192.168.10.1/tcp/8080"``,` |

|     |     |
| --- | --- |
| `7` | `"/ip4/0.0.0.0/tcp/4001"``,` |

The IP mentioned in the *API* is the one on which IPFS will bind on for communication. By default, it’s localhost (127.0.0.1), so to enable our nodes to “see” each other we need to set this parameter accordingly to each node’s IP. *Gateway* parameter is for access from the browser.

#### Step 5: Start the nodes and test

We are done with all the configurations, and now it is time to start all the nodes to see if everything went well and if they are closed to the private network. Run IPFS daemon on all of your nodes.

Now let’s add the file from one of the nodes and try to access it from another.

|     |     |
| --- | --- |
| `2` | `echo` `hello IPFS & > file.txt` |

Take the printed hash and try to the cat file from another node.

|     |     |
| --- | --- |
| `1` | `ipfs cat QmZULkCELmmk5XNfCgTnCyFgAVxBRBXyDHGGMVoLFLiXEN` |

You should see the contents of the added file from the first node. To check and be sure that we have a private network we can try to access our file by its CID from the public IPFS gateway. You can choose one of the public gateways from this list: https://ipfs.github.io/public-gateway-checker.

If you did everything right, then the file won’t be accessible. Also, you can run the ***ipfs swarm peers*** command, and it will display a list of the peers in the network it’s connected to. In our example, each peer sees two others.

#### Step 6: Run IPFS daemon as a service in the background

For IPFS demon to be continually running, even after we have exited from our console session, we will create **systemd** service. Before we do so, stop/kill your ipfs daemon. Create a file for a new service.

|     |     |
| --- | --- |
| `1` | `sudo nano /etc/systemd/system/ipfs.service` |

And add to it the following settings:

|     |     |
| --- | --- |
| `2` | `Description=IPFS Daemon` |

|     |     |
| --- | --- |
| `3` | `After=syslog.target network.target remote-fs.target nss-lookup.target` |

|     |     |
| --- | --- |
| `6` | `ExecStart=/usr/local/bin/ipfs daemon --enable-namesys-pubsub` |

|     |     |
| --- | --- |
| `9` | `WantedBy=multi-user.target` |

Save and close the file.
Apply the new service.

|     |     |
| --- | --- |
| `1` | `sudo systemctl daemon-reload` |

|     |     |
| --- | --- |
| `2` | `sudo systemctl enable ipfs` |

|     |     |
| --- | --- |
| `3` | `sudo systemctl start ipfs` |

|     |     |
| --- | --- |
| `4` | `sudo systemctl status ipfs` |

Reboot your system and check that IPFS daemon is active and running, and then you can again try to add the file from one node and access it from another.

We have completed part of creating a private IPFS network and running its demons as a service. At this phase, you should have three IPFS nodes organised in one private network. Now let’s create our IPFS-CLUSTER for data replication.

### **Deploying IPFS-Cluster**

After we create a private IPFS network, we can start deploying IPFS-Cluster on top of IPFS for automated data replication and better management of our data.

There are two ways how to organize IPFS cluster, the first one is to set a fixed peerset (so you will not be able to increase your cluster with more peers after the creation) and the other one – to bootstrap nodes (you can add new peers after cluster was created).

IPFS-Cluster includes two components:

- **ipfs-cluster-service** mostly to initialise cluster peer and run its daemon
- **ipfs-cluster-ctl** for managing nodes and data among the cluster

#### **Step 1: Install IPFS-Cluster**

There are many ways how to install IPFS-Cluster. In this manual, we are using the [installing from source](https://cluster.ipfs.io/documentation/download/#installing-from-source) method. You can see all the provided methods [here](https://cluster.ipfs.io/documentation/download).

Run next commands in your console terminal to install ipfs-cluster components:

|     |     |
| --- | --- |
| `1` | `git clone https:``//github.com/ipfs/ipfs-cluster.git $GOPATH/src/github.com/ipfs/ipfs-cluster` |

|     |     |
| --- | --- |
| `2` | `cd` `$GOPATH``/src/github.com/ipfs/ipfs-cluster` |

Check successful installation by running:

|     |     |
| --- | --- |
| `1` | `ipfs-cluster-service --version` |

|     |     |
| --- | --- |
| `2` | `ipfs-cluster-ctl --version` |

Repeat this step for all of your nodes.

#### Step 2: Generate and set up CLUSTER_SECRET variable

Now we need to generate CLUSTER\_SECRET and set it as an environment variable for all peers participating in the cluster. Sharing the same CLUSTER\_SECRET allow peers to understand that they are part of one IPFS-Cluster. We will generate this key on the zero node and then copy it to all other nodes. On your first node run the following commands:

|     |     |
| --- | --- |
| `1` | `export CLUSTER_SECRET=$(od -vN 32 -An -tx1 /dev/urandom \| tr -d` `' \n'``)` `echo` `$CLUSTER_SECRET` |

You should see something like this:

|     |     |
| --- | --- |
| `1` | `9a420ec947512b8836d8eb46e1c56fdb746ab8a78015b9821e6b46b38344038f` |

In order for CLUSTER_SECRET to not disappear after you exit the console session, you must add it as a constant environment variable to the .bashrc file. Copy the printed key after echo command and add it to the end of .bashrc file on all of your nodes.

It should look like this:

|     |     |
| --- | --- |
| `1` | `export CLUSTER_SECRET=9a420ec947512b8836d8eb46e1c56fdb746ab8a78015b9821e6b46b38344038f` |

And don’t forget to update your .bashrc file with command:

#### **Step 3: Init and Start cluster**

After we have installed IPFS-Cluster service and set a CLUSTER_SECRET environment variable, we are ready to initialise and start first cluster peer (Node0).

Note: make sure that your ipfs daemon is running before you start the ipfs-cluster-service daemon. To initialise cluster peer, we need to run the command:

To start cluster peer, run:

You should see the output in the console:

|     |     |
| --- | --- |
| `1` | `INFO cluster: IPFS Cluster is ready cluster.go:461` |

|     |     |
| --- | --- |
| `2` | `ipfs-cluster-service daemon` |

You should see the output in the console:

|     |     |
| --- | --- |
| `1` | `INFO cluster: IPFS Cluster is ready cluster.go:461` |

Now open a new console window and connect to your second VM(node1). Note: make sure that your *ipfs daemon* is running before you start the ipfs-cluster-service daemon.

You need to install IPFS-Cluster components and set a CLUSTER_SECRET environment variable (copy from node0) as we did it for our first node. Run the following commands to initialise IPFS-Cluster and bootstrap it to node0:

|     |     |
| --- | --- |
| `1` | `ipfs-cluster-service init` |

|     |     |
| --- | --- |
| `2` | `ipfs-cluster-service daemon --bootstrap` |

|     |     |
| --- | --- |
| `3` | `/ip4/192.168.10.1/tcp/9096/ipfs/QmZjSoXUQgJ9tutP1rXjjNYwTrRM9QPhmD9GHVjbtgWxEn` |

The IP part (192.168.10.1) will be changed to your Node0 machine IP. The last part is the cluster peer ID which is generated when you initialise your cluster peer(ipfs-cluster-service init). Bear in mind that it should be IPFS-Cluster peer ID, not an IPFS peer ID.

You can run ***ipfs-cluster-service*** ***id*** command in the console to get this. You need to change IP and cluster peer ID according to your Node0. Do this for all of your nodes. To check that we have two peers in our cluster, run command:

|     |     |
| --- | --- |
| `1` | `Ipfs-cluster-ctl peers ls` |

And you should see the list of cluster peers:

|     |     |
| --- | --- |
| `1` | `node1 & > ipfs-cluster-ctl peers ls` |

|     |     |
| --- | --- |
| `2` | `QmYFYwnFUkjFhJcSJJGN72wwedZnpQQ4aNpAtPZt8g5fCd \| Sees 1 other peers` |

|     |     |
| --- | --- |
| `4` | `- /ip4/127.0.0.1/tcp/10096/ipfs/QmYFYwnFUkjFhJcSJJGN72wwedZnpQQ4aNpAtPZt8g5fCd` |

|     |     |
| --- | --- |
| `5` | `- /ip4/192.168.1.3/tcp/10096/ipfs/QmYFYwnFUkjFhJcSJJGN72wwedZnpQQ4aNpAtPZt8g5fCd` |

|     |     |
| --- | --- |
| `6` | `IPFS: Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |

|     |     |
| --- | --- |
| `7` | `- /ip4/127.0.0.1/tcp/4001/ipfs/Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |

|     |     |
| --- | --- |
| `8` | `- /ip4/192.168.1.3/tcp/4001/ipfs/Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` |

|     |     |
| --- | --- |
| `9` | `QmZjSoXUQgJ9tutP1rXjjNYwTrRM9QPhmD9GHVjbtgWxEn \| Sees 1 other peers` |

|     |     |
| --- | --- |
| `11` | `- /ip4/127.0.0.1/tcp/9096/ipfs/QmZjSoXUQgJ9tutP1rXjjNYwTrRM9QPhmD9GHVjbtgWxEn` |

|     |     |
| --- | --- |
| `12` | `- /ip4/192.168.1.2/tcp/9096/ipfs/QmZjSoXUQgJ9tutP1rXjjNYwTrRM9QPhmD9GHVjbtgWxEn` |

|     |     |
| --- | --- |
| `13` | `IPFS: Qmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` |

|     |     |
| --- | --- |
| `14` | `- /ip4/127.0.0.1/tcp/4001/ipfs/Qmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` |

|     |     |
| --- | --- |
| `15` | `- /ip4/192.168.1.2/tcp/4001/ipfs/Qmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` |

Repeat this step for the third node and all others nodes you want to join to the cluster.

#### **Step 4: Run IPFS-Cluster daemon as a service**

For the IPFS-Cluster daemon to be continually running, even after we close console session, we will create **systemd** service for it. Run the following command to create a file for IPFS-Cluster **system** service:

|     |     |
| --- | --- |
| `1` | `sudo nano /etc/systemd/system/ipfs-cluster.service` |

And insert to it:

|     |     |
| --- | --- |
| `2` | `Description=IPFS-Cluster Daemon` |

|     |     |
| --- | --- |
| `4` | `After=syslog.target network.target remote-fs.target nss-lookup.target ipfs` |

|     |     |
| --- | --- |
| `7` | `ExecStart=/home/ubuntu/gopath/bin/ipfs-cluster-service daemon` |

|     |     |
| --- | --- |
| `10` | `WantedBy=multi-user.target` |

Apply new service and run it:

|     |     |
| --- | --- |
| `1` | `sudo systemctl daemon-reload` |

|     |     |
| --- | --- |
| `2` | `sudo systemctl enable ipfs-cluster` |

|     |     |
| --- | --- |
| `3` | `sudo systemctl start ipfs-cluster` |

|     |     |
| --- | --- |
| `4` | `sudo systemctl status ipfs-cluster` |

Reboot your machine and check that both IPFS and IPFS-Cluster services are running.

#### Step 5: Test IPFS-Cluster and data replication

To test data replication, create the file and add it to the cluster:

|     |     |
| --- | --- |
| `1` | `ipfs-cluster-ctl add myfile.txt` |

Take CID of the recently added file and check its status:

|     |     |
| --- | --- |
| `1` | `ipfs-cluster-ctl status CID` |

You should see that this file has been PINNED among all cluster nodes.

### Conclusion

Are you wondering how you can apply this IPFS tutorial to support your real-life needs? This article describes how we started with an internal PoC and ended up with a real prototype allowing us to [share files on the blockchain with IPFS securely](https://labs.eleks.com/2016/10/secure-document-transfer-built-top-blockchain-technologies.html).

If you have any questions regarding IPFS networks and their potential use for data replication and secure data sharing, don’t hesitate to [get in touch](https://eleks.com/contact-us/)!

*By Mykhailo Borysov, ELEKS Research and Development Manager*
