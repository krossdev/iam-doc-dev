
## ProllyTree

- Prolly-Tree = Probabilistic B-Trees
- https://github.com/attic-labs/noms/blob/master/doc/intro.md#prolly-trees-probabilistic-b-trees

A critical invariant of Noms is `history-independence`: the same Noms value will be represented 
by the same graph of physical chunks, and the same hashes, regardless of what past sequence of 
logical mutations resulted in the value. This is what makes fast diff, sync, and merge possible in Noms: 
we can compare two values just by looking at their hash. If their hashes are identical, we know 
the values are identical without additional work. By modeling collections as trees of values, 
the same trick can be used to quickly find the differences between larges sets of values.

> - 同一个 `noms value` 对应于同一个Hash，同一个物理存储，而不管它是如何变成这个值的。
> - `history-independence`, 这是diff, sync快的原因, 也是可以做merge的原因

But Noms is also a database, and needs to do what databases do: efficiently search, scan, and mutate large collections. 
The classic data structures that enable these features inside databases — B-Trees and LSM Trees — 
can't be used by Noms because they aren't `history-independent`: their internal state depends upon their mutation history.

> -  为了 search, scan, mutate large collections, 一般要 `B-Tree or LSM Tree`
> - 但是，他们跟 `history-independence` 冲突

In order to model large mutable collections in Noms, of the type where B-Trees would typically be used, 
while preserving efficient diff, sync, and merge, Noms introduces Prolly Trees.

> - 鱼和熊掌兼得？是的，Prolly-Tree 要兼得。

### Prolly Tree Structure

