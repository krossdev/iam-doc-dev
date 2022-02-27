# libp2p

## 入门



- https://docs.libp2p.io/concepts/
- libp2p > Concepts 

## Transport

本小节，对Transport的建模: **Listen, Dail, MultiAddr, Switch**

- **Transport**
  > In libp2p, we call these foundational protocols that move bits around transports, 
and one of libp2p’s core requirements is to be transport agnostic. 

  libp2p 中，将基础协议称为 **transports**, 且lip2p的核心要求: **transport agnostic**
*这些基础协议包含: TCP/UDP/QUIC 等*

- **Listening and Dialing**

  **Transport**s 定义了2个核心操作(抽象出来的术语): **listening** and **dialing**.

- **Addresses**
  - `multiaddr`: Both dial and listen deal with multiaddresses.  
    例如 `/ip4/7.7.7.7/tcp/6543` (具体细节，后面有专门章节).
  - **PeerId** : When dialing a remote peer, the multiaddress should 
    include the PeerId of the peer you’re trying to reach. 用于建立安全通道。
    例如 `/ip4/1.2.3.4/tcp/4321/p2p/QmcEPrat8ShnCph8WjkREzt5CPXF2RwhYxYBALDcLC1iV6` 

- **Supporting multiple transports**
  libp2p applications often need to support multiple transports at once.
  例如你的 libp2p app 需要支持 TCP, 同时还要支持 websocket.

  The libp2p component responsible for managing the transports is called the **switch**
  (又叫做: **swarm**), which also coordinates protocol negotiation, 
  stream multiplexing, establishing secure communication and other forms of “connection upgrading”.

  The switch provides a single “entry point” for dialing and listening. 
  而不用操心 transports 的具体操作细节。

## NAT traversal

描述 libp2p 支持的打洞技术

- **Automatic router configuration**: 
  [UPnP](https://en.wikipedia.org/wiki/Universal_Plug_and_Play) or 
  [nat-pmp.](https://en.wikipedia.org/wiki/NAT_Port_Mapping_Protocol)

  如果你的路由器支持， libp2p 会尝试自动配置端口映射，然后 Listen。 (通常这是最理想的情况)
- **Hole-punching (STUN)**: 
  借助外部 STUN server 的port-mapping打洞方法。

  libp2p 说不需要 STUN server, 它所说的 `This external discovery mechanism` 是个啥？没看明白。
- **AutoNAT**
  - AutoNAT = `STUN` ???
  - identify protocol = `STUN` !
- Circuit Relay (TURN)
  Circuit Relay protocol = `TURN`


## Protocols

libp2p 协议，或称之为规范, (同名词包含 `libp2p protocol`, `wire protocols`, `application protocols`).

前面提到的包含 ` transport, peer identity, addressing`, 都是协议。
下面浏览一下一些关键的协议.

### 什么是 libp2p protocol ?

**Protocol Ids**

libp2p protocols have unique string identifiers, which are used in the **protocol negotiation** process when connections are first opened.

By convention, protocol ids have a path-like structure, with a version number as the final component:
```
/my-app/amazing-protocol/1.0.1
```

