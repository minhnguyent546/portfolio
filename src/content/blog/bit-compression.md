---
title: Examples of using bit compression
description: Examples of using bit compression
tags:
  - bit-compression
  - bitset
topic: algorithms
thumbnail: ./bit-compression/thumbnail.png
author: Minh Thien Nguyen
pubDatetime: 2023-10-16
lang: en
translationOf: bit-compression-vi
---

## Table of contents

## 1. Bit compression and storing a set

Suppose we need to operate on subsets of a set with $n$ elements $\{0, 1, \ldots, n - 1\}$, where $n \le 64$. We store the subset in a bit string: bit $i$ is $1$ if element $i$ belongs to the set, and $0$ otherwise. Since $n \le 64$, a single 64-bit unsigned integer holds it: `unsigned long long x; // a set with at most 64 elements`.

Given two sets $A$ and $B$, we can express the [set operations](<https://en.wikipedia.org/wiki/Set_(mathematics)#Basic_operations>) through integer operations:

| Set operation                       | Bitwise operation        |             |
| ----------------------------------- | ------------------------ | ----------- |
| $A \cap B$                          | $A \& B$                 | bitwise AND |
| $A \cup B$                          | $A \| B$                 | bitwise OR  |
| complement of $A$                   | $\sim A$                 | bitwise NOT |
| $A \backslash B$                    | $A \& \sim B$            |             |
| add element $i$ to the set $A$      | $A \| (1ull \ll i)$      | left shift  |
| remove element $i$ from the set $A$ | $A \& \sim (1ull \ll i)$ |             |

Here `1ull` is the value `1` of type `unsigned long long`.

The harder part is counting the elements of a set, that is counting the $1$ bits of the binary representation. In C++ the built-in functions `__builtin_popcount` and `__builtin_popcountll` do this in $\mathcal{O}(\log{w})$, where $w$ is the machine word length (usually $32$ or $64$, depending on the hardware). For small sets, say at most 16 or 32 elements, we can count the $1$ bits in $\mathcal{O}(1)$ by precomputing a table of size $2^{16}$ bytes:

```cpp
char cnt[1 << 16];
void precompute() {
    for (int i = 0; i < (1 << 16); ++i) {
        cnt[i] = (i & 1) + cnt[i >> 1];
    }
}
int bit_count_16(unsigned int x) { return cnt[x]; }
int bit_count_32(unsigned int x) { return cnt[x >> 16] + cnt[x & 65535]; }
```

For larger sets we can do the following:

```cpp
const int N = (int) 5e7; // maximum number of elements in the set
const int N1 = N / 32 + 1;
unsigned int a[N1];
int get(int i) { return (a[i >> 5] >> (i & 31)) & 1; }
void set_0(int i) { a[i >> 5] &= ~(1u << (i & 31)); }
void set_1(int i) { a[i >> 5] |= 1u << (i & 31); }
int count() {
    int sum = 0;
    for (int i = 0; i < N1; ++i) {
        sum += bit_count_32(a[i]);
    }
    return sum;
}
```

In C++, [bitset](https://cplusplus.com/reference/bitset/bitset/) is a similar structure for these operations:

```cpp
a[3] = 1; // set bit index 3 to 1
a[3] = 0; // set bit index 3 to 0
int x = a[3];
printf("%d\n", (int) a[3]); // cast bitset<100>::reference to int
a = a | b; a |= b; // union of two sets
a = a & b; a &= b; // intersection of two sets
a = b >> 10; b = a << 10; // shift bits right and left
a = a & ~b; // difference of two sets
int c = (int) a.count(); // count the 1 bits in a
a.reset(3); b.reset(); // unset bits
```

Accessing and assigning element $i$ costs $\mathcal{O}(1)$; the other `bitset<n>` operations cost $\mathcal{O}\left(\frac{n}{w}\right)$, where $w$ is the machine word length.

A bitset behaves like a plain array, so we can walk it with a pointer:

```cpp
const int N = 40;
bitset<N> a;
uint8_t *ptr = (uint8_t*) &a;
ptr[0] = 10; // set the first 8 bits to 00001010
ptr[1] = 132; // set the next 8 bits to 10000100
cout << a << '\n'; // 00000000000000001000010000001010
```

In the rest of the article we look at examples of using bitset. For brevity, arrays default to zero unless stated otherwise.
