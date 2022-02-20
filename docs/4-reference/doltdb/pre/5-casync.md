# casync

- http://0pointer.net/blog/casync-a-tool-for-distributing-file-system-images.html

 It combines the idea of the `rsync` algorithm 
 with the idea of `git`-style content-addressable file systems, 
 and creates a new system for efficiently storing and delivering file system images, 
 optimized for high-frequency update cycles over the Internet. 
 
 Its current focus is on delivering IoT, container, VM, application, portable service or OS images, but I hope to extend it later in a generic fashion to become useful for backups and home directory synchronization as well (but more about that later).

## Why?

I created `casync` after studying how today's popular tools store and deliver file system images. 
To briefly name a few: 

- Docker has a layered tarball approach, 
- `OSTree` serves the individual files directly 
  via HTTP and maintains packed deltas to speed up updates, 
- while other systems operate on the block layer and place raw `squashfs` images 
  (or other archival file systems, such as IS09660) for download on HTTP shares 
  (in the better cases combined with `zsync` data).

> 研究大文件传输: system image, docker, iso9660-image


## What casync Is

So much about the background why I created casync. Now, let's have a look what casync actually is like, and what it does. Here's the brief technical overview:

**Encoding**: 

Let's take a large linear data stream, 
- split it into **variable-sized** chunks 
  (the size of each being a function of the chunk's contents), 
- and store these chunks in individual, compressed files in some directory, 
- each file named after a strong hash value of its contents, 
- so that the hash value may be used to as key for retrieving the full chunk data. 

Let's call this directory a `"chunk store"` 

At the same time, generate a `"chunk index"` file that lists these chunk hash values plus 
their respective chunk sizes in a simple linear array. 

The chunking algorithm is supposed to create variable, but similarly sized chunks from the data 
stream, and do so in a way that the same data results in the same chunks 
even if placed at varying offsets. For more information see [this blog](./cdc) story.

> 该算法创建的chunk是变长的，而不是定长；


