# noms part-1

- 阅读 [noms-pre-release](https://github.com/kalman/noms-pre-release) 代码

## /chunks 

ChunkStore 是 noms 持久化存储。

### ChunkStore 持久化接口

- `hash.Hash` SHA-512值
  - []byte = 20 字节
  - 经过base32编码后，得到 32 字节: `20 / 5 * 8 = 32`
- `Chunk` 基本的存储单元: 一段数据，及其HASH值. 数据写完后，自动产生HASH值
  ```go
  type Chunk struct {
    r    hash.Hash
    data []byte
  }
  ```
  - Chunk就是Merkle-DAG中，CDC中的那个**分块**
- `ChunkStore` is the core storage abstraction in noms.
  ```go
  type ChunkStore interface {
    ChunkSource
    ChunkSink
    RootTracker
  }
  ```
  - `ChunkSource` Chunk来源，如文件系统, leveldb，云存储OSS, memory , HTTP等
  - `ChunkSink` Chunk去向，如文件系统，leveldb，OSS, memory, HTTP 等. 将他们分开，可以实现复制???
  - `RootTracker` 类似git's commit HEAD ref 
    - UpdateRoot(current, last hash.Hash) bool 类似 **git commit** !

### memory ChunkStore

```go
type MemoryStore struct {
  data              map[hash.Hash]Chunk
  memoryRootTracker hash.Hash
}
```

这个功能，一目了然.

### BatchStore 接口

- 类似 ChunkStore 接口(但不是ChunkStore派生接口), 它包含了Cache设计

### TestStore

- wrapper MemoryStore for test

### BatchStoreAdaptor

将 ChunkStore 接口, 转换为 BatchStorea 接口

## Value

### Value

```go
// Value is implemented by every noms value
// 很像 Merkle-Node ???
type Value interface {
  Equals(other Value) bool
  Less(other Value) bool // 排序

  Hash() hash.Hash // HASH

  // Returns the immediate children of this value 
  // in the DAG, if any, not including Type().
  ChildValues() []Value
  Chunks() []Ref // CDC Chunks, 如果value太长(>4k), 被分布在多个chunk???
  Type() *Type // ???
}
```

- /types 下的类型，都属于 Value, 例如 Number, List, Map, etc...
- 复杂类型，如List, Map 包含了 Merkle DAG 的设计
- 简单类型，可能没有 DAG ???

### Value.Chunks() 是什么

考察一下简单类型, 如: String, Number, Type, Bool, 基本上都是 

```go
func (v Bool) Chunks() []Ref {
  return nil
  // 或
  return []Ref
}
```

考察复杂类型，如 List, Map, 基本上都是

```go
func (m Map) Chunks() []Ref {
  return m.seq.Chunks()
}
```

还有一个比较特殊，Ref，返回`[自己]`

```go
func (r Ref) Chunks() (chunks []Ref) {
  return append(chunks, r)
}
```

### Ref

```go
type Ref struct {
  target hash.Hash  // hash of Value ( Value = value from pointer)
  height uint64     // 高度??? 转引了几层的Chunk
  t      *Type      // 描述了2点: 1.自己是Ref, 2. 它所指向的Value的类型
  h      *hash.Hash // Ref 自己的Hash, 它的来源，比较特殊
}
func NewRef(v Value) Ref {
  return Ref{v.Hash(), maxChunkHeight(v) + 1, MakeRefType(v.Type()), &hash.Hash{}}
}
```

- Ref 本身也是 Value 的一种
- 它类似一个指针，指向另一个Value(Merkle Node)
- `NewRef()` 非常清晰的说明了这一点
- Ref.h 的来源，比较特殊 TODO: ???

#### height ???

`height := maxChunkHeight(v) + 1`

- 多一重 Ref, 则多一层 height ???
- 而对简单类型的v, 初始height `maxChunkHeight(v) = 0`

那么，height 表示被引用的次数?

#### h ???

## ValueReadWriter
```go
// ValueReadWriter is an interface that knows how to read and write Noms Values, 
// e.g. datas/Database. 
type ValueReadWriter interface {
  ReadValue(h hash.Hash) Value
  WriteValue(v Value) Ref
}
```


## codec

codec 大概是要实现 Value 的encode/decode 吧? 毕竟，Value 要持久化，就必须codec.
带着这个猜想，先来看看 binaryNomsWriter, binaryNomsReader

可以简单理解为 java java.nio.ByteBuffer 类, 封装一堆操作，吐出[]byte, 或者反之

### EncodeValue

```go
func EncodeValue(v Value, vw ValueWriter) chunks.Chunk
```

EncodeValue 的过程:

```
Value -> valueEncoder.writeValue(v) -> binaryNomsWriter -> buf -> Chunk
```

即一个Value，最后变成了一个Chunk. 而Chunk可以被持久化。

这里要注意一个细节: 为什么需要 `vw ValueWriter` 参数?
对复杂的类型，如 List, Map, 需要写入child-Value，这些Child-Value，会递归调用 `ValueWriter` .

所以，先猜想：简单Value，变成了一个Chunk，而复杂的Value，会以Merkle-DAG的形式，变成多个Chunk???

### DecodeValue

很明显
```go
func DecodeValue(c chunks.Chunk, vr ValueReader) Value
```
是其反响过程。

## ValueStore

```go
// `ValueStore` 通过内部的 `ChunkStore`, 实现了 `ValueReadWriter` 接口
type ValueStore struct {
  bs         BatchStore
  cache      map[hash.Hash]chunkCacheEntry
  mu         *sync.Mutex
  valueCache *sizecache.SizeCache
}
```

- `ValueStore` 在其内部，通过`BatchStore`实例，读写Noms Values. 因为它带缓存，
  故直到 Flush. or Close, 才真正持久化.
- Currently, `WriteValue` validates the following properties of a Value `v`:
  - v can be correctly serialized and its Ref taken
  - all Refs in v point to a Value that can be read from this ValueStore
  - all Refs in v point to a Value of the correct Type

在仔细看 `WriteValue()` 之前，要先看看 codec.go

### WriteValue()

```go
// 隐去了缓存处理的代码...
func (lvs *ValueStore) WriteValue(v Value) Ref {
  // 将 v Value 编码为 c Chunk(注意, 此时 c 还未持久化)
  // Encoding v causes any child chunks, 
  // e.g. internal nodes if v is a meta sequence, 
  // to get written. That needs to happen before we try to validate v.
  c := EncodeValue(v, lvs)
  d.Chk.False(c.IsEmpty())

  // 创建对Value的Ref
  hash := c.Hash()
  height := maxChunkHeight(v) + 1
  r := constructRef(MakeRefType(v.Type()), hash, height)

  // 持久化! ChunkStore.Put
  lvs.bs.SchedulePut(c, height, hints)
  return r
}
```

总结一下

1. 将 Value 编码成 Chunk
2. 将 Chunk 持久化
3. 同时，创建和返回Value的Ref, (*此时的Ref未持久化*)

### ReadValue()

```go
// 隐去了缓存处理的代码...
func (lvs *ValueStore) ReadValue(r hash.Hash) Value {
  // 从持久存储种读取 Chunk
  chunk := lvs.bs.Get(r)

  // 将 Chunk 解码 Value
  v := DecodeValue(chunk, lvs)
  return v
}
```

## 脉络已呈现出来了!

```go
func TestValueStore0(t *testing.T) {
  cs := chunks.NewTestStore()
  vs := types.NewValueStore(types.NewBatchStoreAdaptor(cs))

  b := types.String("hello")
  ref := vs.WriteValue(b)
  fmt.Println(cs)

  v := vs.ReadValue(ref.TargetHash())
  s := v.(types.String)
  fmt.Println(string(s))
}
```

输出
```
ftcgogg8ri2jjrb820stloefhvcmlkvq=[2 0 0 0 5 104 101 108 108 111]
hello
```

- NEXT, 复杂类型
