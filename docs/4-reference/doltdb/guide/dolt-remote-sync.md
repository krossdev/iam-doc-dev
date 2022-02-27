# dolt 远程同步
[原文](https://www.dolthub.com/blog/2021-07-19-remotes/)

- Filesystem Based Remotes: `dolt remote add origin file:///Users/brian/datasets/menus `
- Cloud Hosted Remotes: 
  - GCP Remotes (Google Cloud Storage)
  - AWS Remotes
- HTTP(s) Remotes
  - dolt 定义的协议 [ChunkStoreService interface](https://github.com/dolthub/dolt/blob/master/proto/dolt/services/remotesapi/v1alpha1/chunkstore.proto#L23)
  - dolthub.com 就是基于该协议
  - [sample remote server](https://github.com/dolthub/dolt/tree/main/go/utils/remotesrv)


## 例子

### 文件系统

文件系统, [目前可能存在BUG](https://github.com/dolthub/dolt/issues/1860)
修正为

```sh
dolt clone file:$HOME/repo/testdb/.dolt/noms dolt2
```

## remotesrv 使用方法

- https://github.com/dolthub/dolt/tree/main/go/utils/remotesrv
- https://github.com/dolthub/dolt/blob/main/integration-tests/bats/remotes.bats

```
remotesrv --dir /tmp --http-port 1234 --grpc-port 50051 &> remotesrv.log &
dolt remote add origin http://localhost:50051/test-org/test-repo
dolt remote add origin http://localhost:50051/wk/p2018
dolt push origin main
dolt pull origin

dolt clone http://localhost:50051/wk/p2018 
```

其中: 1234 端口不是同步端口, RPC 才是



### http

```sh
dolt remote remove origin  
dolt remote add origin http://localhost:12345/.dolt/moms
dolt remote add origin http://localhost:12345/tmprepo/dolt2

dolt remote add origin Dolthub/menus
dolt remote -v origin https://doltremoteapi.dolthub.com/Dolthub/menus

dolt clone file:///$HOME/repo/doltdb/.dolt/noms dolt3

//dolt clone add origin Dolthub/menus

dolt clone http://localhost:12345/tmprepo/dolt2

```

